import { Component, OnInit, Input } from '@angular/core';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-view-reservation',
  templateUrl: './view-reservation.component.html',
  styleUrls: ['./view-reservation.component.scss']
})
export class ViewReservationComponent implements OnInit {
  @Input() id: string;
  reservation: Reservation = {
    qty: 0,
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    referenceNumber: '',
    products: [],
    totalPrice: 0,
  };

  constructor(
    public router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private toastr: ToastrService
  ) {
    this.route.params.subscribe(params => {
      if (!params.id) {
        router.navigate(['/reservations']);
      }

      this.reservationService.getReservation(params.id).subscribe(reservation => {
        this.reservation = reservation;
        this.reservation.id = params.id;
        console.log(this.reservation);

      });
    });
  }

  ngOnInit() {
  }

  updateStatus() {
    this.reservationService.updateReservation(this.reservation).then(() => {
      this.toastr.success('Status updated!');
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
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
    });
  }

  calcSubTotal() {
    if (this.reservation.shippingFee != null) {
      this.reservation.subTotal = this.reservation.totalPrice + this.reservation.shippingFee;
    } else {
      this.reservation.subTotal = this.reservation.totalPrice;
    }
  }

  checkIfZero() {
    if (this.reservation.shippingFee == null) {
      this.reservation.shippingFee = 0;
    }
  }



  async printPdf() {
    const docDefinition = {
      // {
      //   image: 'test.jpeg',
      //   width: 150,
      //   height: 150,
      // }, 
      content: [
        {
          text: '2nd Bags/Luggage, Clothes and accessories \n \n \n',
          style: 'header',
          alignment: 'center'
        },
        {
          image: await this.getBase64ImageFromURL(this.reservation.products[0].image),
          width: 200,
          height: 200,
          alignment: 'center'
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [{ text: 'Item Code: ', bold: true }, this.reservation.products[0].itemCode, { text: 'Product Name: ', bold: true }, this.reservation.products[0].name],
              [{ text: 'Price: ', bold: true }, this.reservation.products[0].price, { text: 'Owner: ', bold: true }, this.reservation.name],
              [{ text: 'Address: ', bold: true }, this.reservation.address, { text: 'Description: ', bold: true }, this.reservation.products[0].remarks],
              [{ text: 'Weight: ', bold: true }, this.reservation.products[0].weight, { text: 'Color: ', bold: true }, this.reservation.products[0].color]
            ]
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 2 : 1;
            },
            hLineColor: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
            },
            vLineColor: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            },
            // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (rowIndex, node, columnIndex) { return null; }
          }
        },
      ],
      styles: {
        tableExample: {
          fontSize: 14
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'justify'
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }
}
