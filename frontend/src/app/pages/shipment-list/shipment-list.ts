import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ShipmentService, ShipmentStats } from '../../shipment.service';
import { Shipment } from '../../shipment.service';
import { DatePipe } from '@angular/common';
import { RouterLink } from "@angular/router";
@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-shipment-list',
  styleUrl: './shipment-list.css',
  templateUrl: './shipment-list.html',
})
export class ShipmentList implements OnInit {

  shipments: Shipment[] = [];
  selectedStatus: string = '';
  selectedLate: string = '';  
  searchTerm: string  = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  stats?: ShipmentStats;
  

  constructor(private shipmentService: ShipmentService,
     private cdr: ChangeDetectorRef,
    ) { }
  
  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.loadShipments();
  }
  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadShipments();
  }
  onLateChange(event: Event): void {
    this.selectedLate = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.loadShipments();
  }
  loadShipments(): void {
    this.shipmentService
    .getShipments(
      this.selectedStatus, 
      this.searchTerm, 
      this.selectedLate,
      this.currentPage, 
      this.pageSize )
    .subscribe(data => {
      this.shipments = data.data;
      this.totalPages = data.totalPages;
      this.cdr.detectChanges();
    });
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadShipments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadShipments();
    }
  }
  loadStats(): void {
    this.shipmentService.getShipmentStats().subscribe(data => { 
      this.stats = data;
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void {
    this.loadShipments();
    this.loadStats();
  }

}