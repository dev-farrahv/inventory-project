import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { Product, ProductService } from 'src/app/shared/services/product.service';

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
    referenceNumber: "",
    totalWeight: ""
  };

  productList: Product[];
  modalProduct: Product;
  product: Product = {  
    name: "",
    serialNumber: "",
    qty: "",
    color: "",
    price: "",
    currency: "",
    remarks: "",
    otherDescription: "",
    itemCode: "",
    image: "",
    weight: "",
  };

  //productList: any[] = [];
  closeResult: string;
  constructor(private modalService: NgbModal, public router: Router, private reservationService: ReservationService, private productService: ProductService) { }

  open(content, productId) {
    this.productService.getProduct(productId).subscribe(res => {
      this.modalProduct = res;
      console.log(this.modalProduct);
    });

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
    //this.productList = [ , , , , , , , , , , ,];
    // this.reservationService.getproducts().subscribe(res => {
    //   this.productList = res;
    //   console.log(this.productList);
    // });
    this.productService.getproducts().subscribe(res => {
      this.productList = res;
      console.log(this.productList);
    });
  }

  saveReservation(){
    console.log('heyyy');
    this.reservation.referenceNumber = "202003040009";
    this.reservation.totalWeight = "12";
    this.reservationService.addReservation(this.reservation).then(() => {
      console.log('success');
    });
  }


}
