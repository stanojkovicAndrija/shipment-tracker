import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShipmentService } from '../../shipment.service';
import { Shipment } from '../../shipment.service';
import { DatePipe } from '@angular/common';
@Component({
  imports: [DatePipe],
  selector: 'app-shipment-list',
  styleUrl: './shipment-list.css',
  templateUrl: './shipment-list.html',
})
export class ShipmentList implements OnInit {

  shipments: Shipment[] = [];
  selectedStatus: string = '';
  selectedLate: string = '';  
  searchTerm: string  = '';
  

  constructor(private shipmentService: ShipmentService, private cdr: ChangeDetectorRef) { }
  
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.shipmentService
    .getShipments(this.selectedStatus, this.searchTerm)
    .subscribe(data => {
      this.shipments = data.data;
      this.cdr.detectChanges();
    });
  }
  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.shipmentService
    .getShipments(this.selectedStatus)
    .subscribe(data => {
      this.shipments = data.data;
      this.cdr.detectChanges();
    });
  }
  onLateChange(event: Event): void {
    this.selectedLate = (event.target as HTMLSelectElement).value;
    this.shipmentService
    .getShipments(this.selectedStatus, this.searchTerm, this.selectedLate)
    .subscribe(data => {
      this.shipments = data.data;
      this.cdr.detectChanges();
    });}
  ngOnInit(): void {
    this.shipmentService.getShipments().subscribe(data => {
      this.shipments = data.data;
      this.cdr.detectChanges();});
  }

}