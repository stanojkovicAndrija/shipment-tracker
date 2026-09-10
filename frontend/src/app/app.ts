import { Component} from '@angular/core';
import { ShipmentList } from "./pages/shipment-list/shipment-list";

@Component({
  selector: 'app-root',
  imports: [ShipmentList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
