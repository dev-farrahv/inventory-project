import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [routerTransition()]
})
export class ReservationComponent implements OnInit {
  reservationList: Reservation[];
  reservation: Reservation = {
    qty: 0,
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    referenceNumber: "",
    totalWeight: 0,
    price: 0,
    product: null,
    totalPrice: 0,
  };

  constructor(private reservationService: ReservationService, public router: Router) { }

  ngOnInit() {
    this.reservationService.getreservations().subscribe(res => {
      this.reservationList = res;
      console.log(this.reservationList);
    });
  }

}
