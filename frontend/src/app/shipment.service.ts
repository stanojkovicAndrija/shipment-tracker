import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Shipment {
  id: number;
  trackingNumber: string;
  customerId: number;
  destination: string;
  promisedAt: string;
  status: string;
}
export interface Customer {
  id: number;
  name: string;
  email: string;
}
export interface CreateShipment {
  trackingNumber: string;
  customerId: number;
  destination: string;
  promisedAt: string;
}
export interface ShipmentEvent {
  id: number;
  shipmentId: number;
  eventType: string;
  location: string | null;
  occurredAt: string;
  createdAt: string;
}
export interface ShipmentDetails extends Shipment {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  events: ShipmentEvent[];

}
export interface ShipmentResponse {
  data: Shipment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface CreateShipmentEvent {
  eventType: string;
  location: string;
  occurredAt: string;
}
export interface ShipmentStats {
  total: number;
  inTransit: number;
  delivered: number;
  late: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private apiUrl = 'http://localhost:3000/api/shipments';

  constructor(private http: HttpClient) { }

  getShipments(
    status?: string,
    search?: string,
    late?: string,
    page: number = 1,
    pageSize: number = 5) {
    let url = this.apiUrl;

    const params: string[] = [];

    if (status) {
      params.push(`status=${encodeURIComponent(status)}`);
    }

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (late) {
      params.push(`late=${encodeURIComponent(late)}`);
    }
    params.push(`page=${page}`);
    params.push(`pageSize=${pageSize}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<ShipmentResponse>(url);
  }
  getShipmentById(id: number) {
    return this.http.get<ShipmentDetails>(`${this.apiUrl}/${id}`);
  }
  addShipmentEvent(
    id: number,
    event: CreateShipmentEvent
  ) {
    return this.http.post<ShipmentEvent>(
      `${this.apiUrl}/${id}/events`,
      event
    );
  }
  getCustomers() {
    return this.http.get<Customer[]>(
      'http://localhost:3000/api/customers'
    );
  }
  createShipment(shipment: CreateShipment) {
    return this.http.post<Shipment>(
      this.apiUrl,
      shipment
    );
  }
  getShipmentStats() {
  return this.http.get<ShipmentStats>(
    'http://localhost:3000/api/shipments/stats'
  );
}
}