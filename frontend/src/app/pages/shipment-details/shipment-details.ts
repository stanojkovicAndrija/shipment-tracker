import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  ShipmentDetails as ShipmentDetailsModel,
  ShipmentService
} from '../../shipment.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-shipment-details',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './shipment-details.html',
  styleUrl: './shipment-details.css'
})
export class ShipmentDetails implements OnInit {

  shipment?: ShipmentDetailsModel;
  eventType = '';
  location = '';
  errorMessage = '';
  occurredAt = '';

  constructor(
    private route: ActivatedRoute,
    private shipmentService: ShipmentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadShipment()
  }
loadShipment(): void {
  const idParam = this.route.snapshot.paramMap.get('id');

  if (!idParam || !Number.isInteger(Number(idParam))) {
    this.errorMessage = 'Invalid shipment id';
    this.cdr.detectChanges();
    return;
  }

  const id = Number(idParam);

  this.shipmentService.getShipmentById(id).subscribe({
    next: data => {
      this.shipment = data;
      this.errorMessage = '';
      this.cdr.detectChanges();
    },
    error: error => {
      this.errorMessage =
        error.error?.message || 'Failed to load shipment';

      this.cdr.detectChanges();
    }
  });
}
addEvent(): void {
  if (!this.shipment) {
    return;
  }

  const occurredAt = new Date(this.occurredAt).toISOString();

  this.shipmentService.addShipmentEvent(
    this.shipment.id,
    {
      eventType: this.eventType,
      location: this.location,
      occurredAt: occurredAt
    }
  ).subscribe({
    next: () => {
      this.eventType = '';
      this.location = '';
      this.occurredAt = '';
      this.errorMessage = '';
      this.loadShipment();
    },
    error: (error) => {
      this.errorMessage = error.error?.message || 'Failed to add event(CREATED->PICKED_UP->DEPARTED->AT_HUB->OUT_OF_DELIVERY->DELIVERED';
       this.cdr.detectChanges();
    }
  });
}
}