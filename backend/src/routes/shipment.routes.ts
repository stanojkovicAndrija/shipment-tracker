import { Router } from 'express';
import { db } from '../prisma/db.js';
import { z } from 'zod';
import {
  getShipmentStats,
  createShipment,
  addShipmentEvent,
} from '../services/shipment.service.js';

export const shipmentRouter = Router();

const createShipmentSchema = z.object({
  trackingNumber: z.string().min(1),
  customerId: z.number().int().positive(),
  destination: z.string().min(1),
  promisedAt: z.string().datetime()
});
const createShipmentEventSchema = z.object({
  eventType: z.enum([
    'PICKED_UP',
    'DEPARTED',
    'ARRIVED_AT_HUB',
    'OUT_FOR_DELIVERY',
    'DELIVERED'
  ]),
  location: z.string().min(1),
  occurredAt: z.string().datetime()
});
const shipmentStatusSchema = z.enum([
  'CREATED',
  'PICKED_UP',
  'DEPARTED',
  'AT_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
]);
shipmentRouter.get('/stats', async (_req, res) => {
  try {
    const stats = await getShipmentStats();

    return res.json(stats);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch shipment statistics'
    });
  }
});
shipmentRouter.get('/', async (req, res) => {
  try {
    const status = req.query.status;
    const late = req.query.late;
    const search = req.query.search;

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        message: 'Invalid pagination parameters'
      });
    }

    let shipments = await db.orm.public.Shipment.all();

    if (typeof status === 'string') {
      const result = shipmentStatusSchema.safeParse(status);

      if (!result.success) {
        return res.status(400).json({
          message: 'Invalid shipment status'
        });
      }

      shipments = shipments.filter(
        shipment => shipment.status === result.data
      );
    }

    if (late === 'true') {
      shipments = shipments
        .filter(
          shipment =>
            shipment.status !== 'DELIVERED' &&
            new Date(shipment.promisedAt) < new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.promisedAt).getTime() -
            new Date(b.promisedAt).getTime()
        );
    }

    if (typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();

      shipments = shipments.filter(
        shipment =>
          shipment.trackingNumber.toLowerCase().includes(searchTerm) ||
          shipment.destination.toLowerCase().includes(searchTerm)
      );
    }

    if (late === 'false') {
      shipments = shipments.filter(
        shipment =>
          shipment.status === 'DELIVERED' ||
          new Date(shipment.promisedAt) >= new Date()
      );
    }

    const total = shipments.length;

    const paginatedShipments = shipments.slice(
      offset,
      offset + pageSize
    );

    return res.json({
      data: paginatedShipments,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch shipments'
    });
  }
});
shipmentRouter.post('/', async (req, res) => {
  try {
    const result = createShipmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid shipment data',
        errors: result.error.flatten()
      });
    }

    const {
      trackingNumber,
      customerId,
      destination,
      promisedAt
    } = result.data;

    const shipment = await createShipment(
      trackingNumber,
      customerId,
      destination,
      promisedAt
    );

    return res.status(201).json(shipment);

  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === 'Customer not found'
    ) {
      return res.status(404).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: 'Failed to create shipment'
    });
  }
});
shipmentRouter.get('/:id/events', async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);

    if (!Number.isInteger(shipmentId)) {
      return res.status(400).json({
        message: 'Invalid shipment id'
      });
    }

    const shipment = await db.orm.public.Shipment
      .where({ id: shipmentId })
      .first();

    if (!shipment) {
      return res.status(404).json({
        message: 'Shipment not found'
      });
    }

    const events = await db.orm.public.ShipmentEvent
      .where({ shipmentId })
      .all();

    return res.json(events);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch shipment events'
    });
  }
});
shipmentRouter.post('/:id/events', async (req, res) => {
  try {
    const shipmentId = Number(req.params.id);

    if (!Number.isInteger(shipmentId)) {
      return res.status(400).json({
        message: 'Invalid shipment id'
      });
    }

    const result = createShipmentEventSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid event data',
        errors: result.error.flatten()
      });
    }

    const {
      eventType,
      location,
      occurredAt
    } = result.data;

    const event = await addShipmentEvent(
      shipmentId,
      eventType,
      location,
      occurredAt
    );

    return res.status(201).json(event);

  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === 'Shipment not found') {
        return res.status(404).json({
          message: error.message
        });
      }

      if (
        error.message === 'Shipment cannot accept new events' ||
        error.message.startsWith('Invalid event for shipment status')
      ) {
        return res.status(409).json({
          message: error.message
        });
      }
    }

    return res.status(500).json({
      message: 'Failed to create shipment event'
    });
  }
});
shipmentRouter.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'Invalid shipment id'
      });
    }

    const shipment = await db.orm.public.Shipment
      .where({ id })
      .include('customer')
      .include('events')
      .first();

    if (!shipment) {
      return res.status(404).json({
        message: 'Shipment not found'
      });
    }

    return res.json(shipment);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch shipment'
    });
  }
});