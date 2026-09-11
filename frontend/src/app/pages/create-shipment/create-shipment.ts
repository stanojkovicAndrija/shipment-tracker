import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Customer,
  ShipmentService
} from '../../shipment.service';

@Component({
  selector: 'app-create-shipment',
  imports: [FormsModule],
  templateUrl: './create-shipment.html',
  styleUrl: './create-shipment.css'
})
export class CreateShipment implements OnInit {

  customers: Customer[] = [];

  trackingNumber = '';
  customerId = '';
  destination = '';
  promisedAt = '';

  constructor(
    private shipmentService: ShipmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.shipmentService.getCustomers().subscribe(data => {
      this.customers = data;
      this.cdr.detectChanges();
    });
  }

  createShipment(): void {
    const promisedAt = new Date(this.promisedAt).toISOString();

    this.shipmentService.createShipment({
      trackingNumber: this.trackingNumber,
      customerId: Number(this.customerId),
      destination: this.destination,
      promisedAt: promisedAt
    }).subscribe({
      next: () => {
        alert('Shipment created successfully');

        this.trackingNumber = '';
        this.customerId = '';
        this.destination = '';
        this.promisedAt = '';
      },
      error: (error) => {
        alert(error.error?.message || 'Failed to create shipment');
      }
    });
  }
}