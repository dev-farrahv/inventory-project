import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { ToastrService } from 'ngx-toastr';

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
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    referenceNumber: '',
    totalPrice: 0,
    products: []
  };

  productList: Product[];

  closeResult: string;
  loading = false;

  constructor(
    private modalService: NgbModal,
    public router: Router,
    private reservationService: ReservationService,
    private productService: ProductService,
    private toastr: ToastrService
  ) { }

  open(content) {
    if (!this.productList.some(item => item.isSelected)) {
      return this.toastr.warning('Please select atleast one item!');
    }
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
    this.loading = true;

    const totalPrice = this.productList.reduce((total, product) => {
      const price = product.price * product.qty;
      return total + price;
    }, 0);

    this.reservation.referenceNumber = 'RN-2020' + (Math.random() * 1000000).toFixed();
    this.reservation.totalPrice = totalPrice;
    this.reservation.products = this.productList.filter(item => item.isSelected);
    this.reservation.status = 'Pending';
    this.reservationService.addReservation(this.reservation).then(() => {
      this.toastr.success('Product reserved!');
      console.log('success');
      this.close();
      this.loading = false;
    });
  }

  getSelectedProduct() {
    return this.productList.filter(item => item.isSelected);
  }

}
