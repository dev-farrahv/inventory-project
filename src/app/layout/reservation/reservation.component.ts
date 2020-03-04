import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [routerTransition()]
})
export class ReservationComponent implements OnInit {
  reservationList: Reservation[];
  reservation: Reservation = {  
    qty: "",
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    referenceNumber: "",
    totalWeight: ""
  };

  constructor(private reservationService: ReservationService) { }

  ngOnInit() {
    this.reservationService.getreservations().subscribe(res => {
      this.reservationList = res;
      console.log(this.reservationList);
    });
  }

}
