import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [routerTransition()]
})
export class InventoryComponent implements OnInit {
  reservationList: Reservation[];
  reservation: Reservation = {  
    qty: "",
    name: "",
    email: "",
    contactNumber: "",
    address: "",
  };

  closeResult: string;
  constructor(private modalService: NgbModal, public router: Router, private reservationService: ReservationService) { }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    this.reservationService.getreservations().subscribe(res => {
      this.reservationList = res;
      console.log(this.reservationList);
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit() {
    // this.reservationService.getproducts().subscribe(res => {
    //   this.productList = res;
    //   console.log(this.productList);
    // });
  }

  saveReservation(){
    console.log('heyyy');
    this.reservationService.addReservation(this.reservation).then(() => {
      console.log('success');
    });
  }


}
