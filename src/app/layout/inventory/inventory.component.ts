import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import {
  Reservation,
  ReservationService,
} from 'src/app/shared/services/reservations.service';
import {
  Product,
  ProductService,
} from 'src/app/shared/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ProfitService } from 'src/app/shared/services/profit.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  animations: [routerTransition()],
})
export class InventoryComponent implements OnInit {
  private destroyed$ = new Subject();
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
    products: [],
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
    private spinner: NgxSpinnerService
  ) {}

  open(content) {
    if (!this.productList.some((item) => item.isSelected)) {
      return this.toastr.warning('Please select atleast one item!');
    }
    this.modalService.open(content).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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
    this.spinner.show();
    this.productService
      .getAvailableProducts()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.productList = res;
        if (res.some((r) => r.status == null)) {
          const nostatus = res.filter((r) => r.status == null);
          nostatus.forEach(async (product) => {
            product.status = 0;
            await this.productService.updateProduct(product);
          });
        }
        this.spinner.hide();
      });
  }

  saveReservation() {
    this.loading = true;
    this.spinner.show();
    this.reservation.totalPrice = this.productList
      .filter((item) => item.isSelected)
      .reduce((total, product) => {
        const price = product.sellingPrice * product.qty;
        return total + price;
      }, 0);

    this.reservation.referenceNumber =
      'RN-2020' + (Math.random() * 1000000).toFixed();
    this.reservation.products = this.productList.filter(
      (item) => item.isSelected
    );
    this.reservation.status = 'Pending';
    this.reservation.subTotal = this.reservation.totalPrice;
    this.reservation.shippingFee = 0;
    this.reservation.totalWeight = 0;
    this.reservation.discount = 0;
    this.reservation.dateCreated = new Date().toDateString();
    this.productList
      .filter((item) => item.isSelected)
      .forEach(async (product) => {
        product.status = 1;
        product.isSelected = false;
        product.rn = this.reservation.referenceNumber;
        await this.productService.updateProduct(product);
      });
    this.reservationService.addReservation(this.reservation).then(() => {
      this.toastr.success('Product reserved!');

      this.close();
      this.loading = false;
      this.resetSelectedList();
      this.spinner.hide();
    });
  }

  getSelectedProduct() {
    return this.productList.filter((item) => item.isSelected);
  }

  resetSelectedList() {
    this.productList.forEach((product) => {
      product.isSelected = false;
    });
  }

  goToRerevation(rn) {
    console.log(rn);

    this.reservationService
      .getReservationByRN(rn)
      .pipe(take(1))
      .subscribe((reservation) => {
        this.router.navigate(['/view-reservation', { id: reservation[0].id }]);
        // this.router.navigateByUrl(['/view-reservation', { id: reservation[0].id }]);
      });
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }

  async printItemPdf(item) {
    console.log(item);
    const docDefinition = {
      content: [
        {
          alignment: 'justify',
          columns: [
            {
              image: await this.getBase64ImageFromURL(
                'assets/images/company_logo.jpg'
              ),
              fit: [100, 100],
              margin: [5, 5, 5, 5],
              width: 'auto',
            },
            {
              width: 'auto',
              stack: [
                {
                  text: [
                    { text: '   RYSINH Co. Limited \n', fontSize: 9, bold: true },
                    { text: ' KYOTO FU  KYOTO SHI FUSHIMI KU, \n  OGURISU KITA GOTO CHO 1-9-103 \n  KYOTO, \n  KYOTO, \n  Japan, \n  Mobile: 08053361176 \n  hazeltitco@yahoo.com \n  https://www.facebook.com \n/2Nd-107816430558898  ', fontSize: 9 },
                  ]
                }
              ],
              style: 'superMargin',
            },
          ],
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 5,
            widths: [100, 150],
            body: [
              [
                {
                  text: 'Item Code: \n' + item.itemCode,
                  bold: true,
                  alignment: 'left',
                  style: 'col',
                },
                {
                  image: await this.getBase64ImageFromURL(item.image),
                  width: 100,
                  alignment: 'center',
                  margin: [10, 10, 10, 10],
                  rowSpan: 5,
                },
              ],
              [
                {
                  text: 'Serial No: \n' + item.serialNumber,
                  bold: true,
                  alignment: 'left',
                  style: 'col',
                },
              ],
              [
                {
                  text: 'Name: \n' + item.name,
                  bold: true,
                  alignment: 'left',
                  style: 'col',
                },
              ],
              [
                {
                  text: 'Price: \n' + item.sellingPrice,
                  bold: true,
                  fontSize: 10,
                  alignment: 'left',
                  style: 'col',
                },
              ],
              [
                {
                  text: 'Remarks: \n' + item.remarks,
                  bold: true,
                  alignment: 'left',
                  style: 'col',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (index, node) {
              return index === 0 || index === node.table.body.length ? 2 : 1;
            },
            vLineWidth: function (index, node) {
              return index === 0 || index === node.table.widths.length ? 2 : 1;
            },
            hLineColor: function (index, node) {
              return index === 0 || index === node.table.body.length
                ? 'black'
                : 'gray';
            },
            vLineColor: function (index, node) {
              return index === 0 || index === node.table.widths.length
                ? 'black'
                : 'gray';
            },
          },
        },
        // {
        //   qr: this.reservation.products[i].purchasePrice.toString(),
        //   alignment: 'center',
        //   margin: [0, 100, 0, 5],
        //   fit: 200
        // },
        // { text: 'SCAN QR', alignment: 'center', fontSize: 12 }
      ],
      styles: {
        tableExample: {
          fontSize: 14,
          margin: [0, 0, 0, 0],
        },
        col: {
          fontSize: 10,
          margin: [0, 0, 0, 0],
        },
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'justify',
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}

// Status value

// 0 = new
// 1 = reserved
// 2 = paid
// 3 = for shipping
// 4 = completed
