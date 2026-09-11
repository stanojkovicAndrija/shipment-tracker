import { db } from '../prisma/db';

const statusTransitions = {
  CREATED: {
    eventType: 'PICKED_UP',
    nextStatus: 'PICKED_UP'
  },
  PICKED_UP: {
    eventType: 'DEPARTED',
    nextStatus: 'DEPARTED'
  },
  DEPARTED: {
    eventType: 'ARRIVED_AT_HUB',
    nextStatus: 'AT_HUB'
  },
  AT_HUB: {
    eventType: 'OUT_FOR_DELIVERY',
    nextStatus: 'OUT_FOR_DELIVERY'
  },
  OUT_FOR_DELIVERY: {
    eventType: 'DELIVERED',
    nextStatus: 'DELIVERED'
  }
} as const;

export async function addShipmentEvent(
  shipmentId: number,
  eventType: string,
  location: string,
  occurredAt: string
) {
  const shipment = await db.orm.public.Shipment
    .where({ id: shipmentId })
    .first();

  if (!shipment) {
    throw new Error('Shipment not found');
  }

  const transition =
    statusTransitions[
      shipment.status as keyof typeof statusTransitions
    ];

  if (!transition) {
    throw new Error('Shipment cannot accept new events');
  }

  if (transition.eventType !== eventType) {
    throw new Error(
      `Invalid event for shipment status ${shipment.status}`
    );
  }

  const event = await db.transaction(async (tx) => {
    const createdEvent =
      await tx.orm.public.ShipmentEvent.create({
        shipmentId,
        eventType,
        location,
        occurredAt
      });

    await tx.orm.public.Shipment
      .where({ id: shipmentId })
      .update({
        status: transition.nextStatus
      });

    return createdEvent;
  });

  return event;
}

export async function createShipment(
  trackingNumber: string,
  customerId: number,
  destination: string,
  promisedAt: string
) {
  const customer = await db.orm.public.Customer
    .where({ id: customerId })
    .first();

  if (!customer) {
    throw new Error('Customer not found');
  }

  const shipment = await db.orm.public.Shipment.create({
    trackingNumber,
    customerId,
    destination,
    promisedAt,
    status: 'CREATED'
  });

  return shipment;
}

export async function getShipmentStats() {
  const shipments = await db.orm.public.Shipment.all();

  const now = new Date();

  const total = shipments.length;

  const delivered = shipments.filter(
    shipment => shipment.status === 'DELIVERED'
  ).length;

  const inTransit = shipments.filter(
    shipment =>
      shipment.status !== 'CREATED' &&
      shipment.status !== 'DELIVERED'
  ).length;

  const late = shipments.filter(
    shipment =>
      shipment.status !== 'DELIVERED' &&
      new Date(shipment.promisedAt) < now
  ).length;

  return {
    total,
    inTransit,
    delivered,
    late
  };
}