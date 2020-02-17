import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [routerTransition()]
})
export class ReservationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
