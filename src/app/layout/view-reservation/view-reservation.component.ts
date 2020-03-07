import { Component, OnInit, Input } from '@angular/core';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';

@Component({
  selector: 'app-view-reservation',
  templateUrl: './view-reservation.component.html',
  styleUrls: ['./view-reservation.component.scss']
})
export class ViewReservationComponent implements OnInit {
  @Input() id: string;
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

  product: Product = {
    name: "",
    serialNumber: "",
    qty: 0,
    color: "",
    price: 0,
    currency: "",
    remarks: "",
    otherDescription: "",
    itemCode: "",
    image: "assets/images/empty.png",
    weight: 0,
  };

  constructor(
    public router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {
    this.route.params.subscribe(params => {
      if (!params.id) {
        router.navigate(['/reservations']);
      }

      this.reservationService.getReservation(params.id).subscribe(reservation => {
        this.reservation = reservation;
        this.reservation.id = params.id;
        this.product = reservation.product;
        console.log(this.reservation);

      });
    });
  }

  ngOnInit() {
  }

  updateStatus() {
    this.reservationService.updateReservation(this.reservation);
  }

}
