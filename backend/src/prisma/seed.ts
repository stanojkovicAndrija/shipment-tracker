import { db } from './db.js';

const customer1 = await db.orm.public.Customer.create({
  name: 'Acme Logistics',
  email: 'contact@acme.test'
});

const customer2 = await db.orm.public.Customer.create({
  name: 'Global Trade',
  email: 'info@globaltrade.test'
});

const customer3 = await db.orm.public.Customer.create({
  name: 'Tech Solutions',
  email: 'hello@techsolutions.test'
});

const shipment1 = await db.orm.public.Shipment.create({
  trackingNumber: 'TRK-10001',
  customerId: customer1.id,
  destination: 'Belgrade, Serbia',
  promisedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'CREATED'
});

const shipment2 = await db.orm.public.Shipment.create({
  trackingNumber: 'TRK-10002',
  customerId: customer2.id,
  destination: 'Novi Sad, Serbia',
  promisedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  status: 'DEPARTED'
});

const shipment3 = await db.orm.public.Shipment.create({
  trackingNumber: 'TRK-10003',
  customerId: customer3.id,
  destination: 'Budapest, Hungary',
  promisedAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  status: 'AT_HUB'
});

const shipment4 = await db.orm.public.Shipment.create({
  trackingNumber: 'TRK-10004',
  customerId: customer1.id,
  destination: 'Vienna, Austria',
  promisedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  status: 'OUT_FOR_DELIVERY'
});

const shipment5 = await db.orm.public.Shipment.create({
  trackingNumber: 'TRK-10005',
  customerId: customer2.id,
  destination: 'Zagreb, Croatia',
  promisedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'DELIVERED'
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment2.id,
  eventType: 'PICKED_UP',
  location: 'Belgrade',
  occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment2.id,
  eventType: 'DEPARTED',
  location: 'Belgrade',
  occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment3.id,
  eventType: 'PICKED_UP',
  location: 'Novi Sad',
  occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment3.id,
  eventType: 'DEPARTED',
  location: 'Novi Sad',
  occurredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment3.id,
  eventType: 'ARRIVED_AT_HUB',
  location: 'Budapest',
  occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment5.id,
  eventType: 'PICKED_UP',
  location: 'Belgrade',
  occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment5.id,
  eventType: 'DEPARTED',
  location: 'Belgrade',
  occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment5.id,
  eventType: 'ARRIVED_AT_HUB',
  location: 'Zagreb',
  occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment5.id,
  eventType: 'OUT_FOR_DELIVERY',
  location: 'Zagreb',
  occurredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
});

await db.orm.public.ShipmentEvent.create({
  shipmentId: shipment5.id,
  eventType: 'DELIVERED',
  location: 'Zagreb',
  occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
});

console.log('Seed completed successfully.');