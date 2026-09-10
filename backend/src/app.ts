import express from 'express';
import cors from 'cors';
import { db } from './prisma/db.js';
import { z } from 'zod';

const app = express();
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
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Shipment Tracker API is running'
  });
});
app.post('/api/shipments', async (req, res) => {
  try {
    const result = createShipmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid shipment data',
        errors: result.error.flatten()
      });
    }

    const { trackingNumber, customerId, destination, promisedAt } = result.data;

    const customer = await db.orm.public.Customer
      .where({ id: customerId })
      .first();

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    const shipment = await db.orm.public.Shipment.create({
      trackingNumber,
      customerId,
      destination,
      promisedAt,
      status: 'CREATED'
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create shipment'
    });
  }
});
app.get('/api/test-db', async (_req, res) => {
  try {
    const customers = await db.orm.public.Customer.all();

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Database connection failed'
    });
  }
});
app.get('/api/shipments', async (_req, res) => {
  try {
    const shipments = await db.orm.public.Shipment.all();

    res.json(shipments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch shipments'
    });
  }
});
app.get('/api/shipments/:id', async (req, res) => {
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

    res.json(shipment);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch shipment'
    });
  }
});
app.post('/api/shipments/:id/events', async (req, res) => {
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

    const { eventType, location, occurredAt } = result.data;

    const shipment = await db.orm.public.Shipment
      .where({ id: shipmentId })
      .first();

    if (!shipment) {
      return res.status(404).json({
        message: 'Shipment not found'
      });
    }

    const transition = statusTransitions[shipment.status as keyof typeof statusTransitions];

    if (!transition) {
      return res.status(409).json({
        message: 'Shipment cannot accept new events'
      });
    }

    if (transition.eventType !== eventType) {
      return res.status(409).json({
        message: `Invalid event for shipment status ${shipment.status}`
      });
    }

    const event = await db.orm.public.ShipmentEvent.create({
      shipmentId,
      eventType,
      location,
      occurredAt
    });

    await db.orm.public.Shipment
      .where({ id: shipmentId })
      .update({
        status: transition.nextStatus
      });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create shipment event'
    });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});