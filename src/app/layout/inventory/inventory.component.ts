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
    qty: 0,
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    referenceNumber: "",
    totalWeight: 0,
    price: 0,
    totalPrice: 0,
    product: null
  };

  productList: Product[];
  modalProduct: Product;
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
    image: "",
    weight: 0,
  };

  closeResult: string;
  constructor(private modalService: NgbModal, public router: Router, private reservationService: ReservationService, private productService: ProductService) { }

  open(content, product) {
    this.modalProduct = product;

    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  close() {
    this.modalService.dismissAll();
  }

  ngOnInit() {
    this.productService.getproducts().subscribe(res => {
      this.productList = res;
      console.log(this.productList);
    });
  }

  saveReservation() {

    this.reservation.referenceNumber = 'RN-' + (Math.random() * 100000000).toFixed();
    this.reservation.price = this.modalProduct.price;
    console.log(this.modalProduct.weight);
    console.log(this.modalProduct.price);

    this.reservation.totalWeight = this.modalProduct.weight * this.reservation.qty;
    this.reservation.totalPrice = this.reservation.price * this.reservation.qty;
    this.reservation.product = this.modalProduct;
    this.reservation.status = 'Pending';
    this.reservationService.addReservation(this.reservation).then(() => {
      console.log('success');
      this.modalProduct.qty -= this.reservation.qty;
      this.productService.updateProduct(this.modalProduct);
      this.close();
    });
  }


}
