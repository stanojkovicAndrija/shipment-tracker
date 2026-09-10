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

export interface ShipmentResponse {
  data: Shipment[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private apiUrl = 'http://localhost:3000/api/shipments';

  constructor(private http: HttpClient) { }

  getShipments(status?: string, search?: string, late?: string) {
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

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    console.log('REQUEST URL:', url);
    return this.http.get<ShipmentResponse>(url);
  }
}