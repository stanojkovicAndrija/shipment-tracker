import express from 'express';
import cors from 'cors';
import { customerRouter } from './routes/customer.routes.js';
import { shipmentRouter } from './routes/shipment.routes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/shipments', shipmentRouter);
app.use('/api/customers', customerRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Shipment Tracker API is running'
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});