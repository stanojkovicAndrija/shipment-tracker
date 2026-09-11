import { Routes } from '@angular/router';
import { ShipmentList } from './pages/shipment-list/shipment-list';
import { ShipmentDetails } from './pages/shipment-details/shipment-details';
import { CreateShipment } from './pages/create-shipment/create-shipment';
export const routes: Routes = [
  { path: '', component: ShipmentList },
  { path: 'shipments/create', component: CreateShipment },
  { path: 'shipments/:id', component: ShipmentDetails }
];
