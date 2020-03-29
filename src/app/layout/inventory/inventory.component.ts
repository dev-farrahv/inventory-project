import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [routerTransition()]
})
export class InventoryComponent implements OnInit {
  search = '';
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
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
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
    this.spinner.show();
    this.reservation.totalPrice = this.productList.filter(item => item.isSelected).reduce((total, product) => {
      const price = product.sellingPrice * product.qty;
      return total + price;
    }, 0);

    this.reservation.referenceNumber = 'RN-2020' + (Math.random() * 1000000).toFixed();
    this.reservation.products = this.productList.filter(item => item.isSelected);
    this.reservation.status = 'Pending';
    this.reservation.subTotal = this.reservation.totalPrice;
    this.reservation.shippingFee = 0;
    this.reservation.totalWeight = 0;
    this.reservation.discount = 0;
    this.reservationService.addReservation(this.reservation).then(() => {
      this.toastr.success('Product reserved!');
      console.log('success');
      this.close();
      this.loading = false;
      this.resetSelectedList();
      this.spinner.hide();

    });
  }

  getSelectedProduct() {
    return this.productList.filter(item => item.isSelected);
  }

  resetSelectedList() {
    this.productList.forEach(product => {
      product.isSelected = false;
    });
  }

}
