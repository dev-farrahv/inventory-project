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
  printList: any[];

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

  updateReservation() {
    this.spinner.show();
    this.reservationService.updateReservation(this.reservation).then(() => {
      this.toastr.success('Reservation updated!');
      this.spinner.hide();
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

  async printItemPdf(i) {
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
        // {
        //   image: await this.getBase64ImageFromURL(this.reservation.products[i].image),
        //   width: 200,
        //   alignment: 'center',
        //   margin: [10, 10, 10, 10]
        // },
        {
          style: 'tableExample',
          table: {
            headerRows: 6,
            widths: [100, '*', '*'],
            body: [
              [
                { text: 'Item Code ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].itemCode, bold: true, style: 'col' },
                // {
                //   qr: this.reservation.products[i].purchasePrice.toString(),
                //   alignment: 'center',
                //   margin: [10, 10, 10, 10],
                //   rowSpan: 6
                // }
                {
                  image: await this.getBase64ImageFromURL(this.reservation.products[i].image),
                  width: 100,
                  alignment: 'center',
                  margin: [10, 10, 10, 10],
                  rowSpan: 6
                },
              ],
              [
                { text: 'Name ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].name, style: 'col' },
              ],
              [
                { text: 'Owner ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.name, style: 'col' },
              ],
              [
                { text: 'Price ', bold: true, fontSize: 14, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].sellingPrice, style: 'col', fontSize: 14, bold: true },
              ],
              [
                { text: 'Weight ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].weight, style: 'col' },
              ],
              [
                { text: 'Remarks ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].remarks, style: 'col' },
              ],
            ]
          },
          layout: {
            hLineWidth: function (index, node) {
              return (index === 0 || index === node.table.body.length) ? 2 : 1;
            },
            vLineWidth: function (index, node) {
              return (index === 0 || index === node.table.widths.length) ? 2 : 1;
            },
            hLineColor: function (index, node) {
              return (index === 0 || index === node.table.body.length) ? 'black' : 'gray';
            },
            vLineColor: function (index, node) {
              return (index === 0 || index === node.table.widths.length) ? 'black' : 'gray';
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

        {
          qr: this.reservation.products[i].purchasePrice.toString(),
          alignment: 'center',
          margin: [0, 100, 0, 5],
          fit: 200
        },
        { text: 'SCAN QR', alignment: 'center', fontSize: 12 }
      ],
      styles: {
        tableExample: {
          fontSize: 14
        },
        col: {
          fontSize: 10,
          margin: [10, 10, 10, 10]
        },
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'justify'
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  async printInvoicePdf(item) {
    const dateToday = new Date();
    this.printList = [];
    const rowsHeader = [
      { text: 'Products', style: 'tableHeader', alignment: 'left' },
      { text: 'Amount', style: 'tableHeader', alignment: 'right' }
    ];
    this.printList.push(rowsHeader);
    item.products.forEach((invoice, i) => {
      const invoicePrintList = [];
      invoicePrintList.push({ text: `${(i + 1)}. ${invoice['name']}`, alignment: 'left', fontSize: 12 });
      invoicePrintList.push({ text: invoice['sellingPrice'], alignment: 'right', fontSize: 12 });

      this.printList.push(invoicePrintList);
    });
    // const subtotal = [
    //   { text: 'SUB TOTAL: ' + item.subTotal, style: 'tableHeader', alignment: 'left' }
    // ];
    // this.printList.push(subtotal);

    const docDefinition = {
      content: [
        {
          text: 'INVOICE \n \n',
          style: 'header',
          alignment: 'center'
        },
        {
          alignment: 'justify',
          columns: [
            {
              image: await this.getBase64ImageFromURL('assets/images/company_logo.jpg'),
              fit: [100, 100],
              width: 'auto',
            },
            {
              width: 'auto',
              stack: [
                {
                  text: [
                    { text: '   2Nd \n', fontSize: 15, bold: true },
                    'KYOTO FU  KYOTO SHI FUSHIMI KU, \n',
                    'OGURISU KITA GOTO CHO 1-9-103 \n',
                    'KYOTO, \n',
                    'KYOTO, \n',
                    'Japan, \n',
                    'Mobile: 08053361176 \n',
                    'hazeltitco@yahoo.com \n',
                    'https://www.facebook.com/2Nd-107816430558898 \n',
                  ]
                }
              ],
              style: 'superMargin'
            }
          ]
        },
        {
          text: [
            { text: ' Invoice To: \n', fontSize: 12, bold: true },
            { text: item.name + ' \n \n', fontSize: 12 },
            { text: ' Date: \n', fontSize: 12, bold: true },
            { text: dateToday + ' \n \n', fontSize: 12 }
          ]
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [... this.printList]
            // body: [
            //   //[{text: 'Products', style: 'tableHeader', alignment: 'center'}, {text: 'Amount', style: 'tableHeader', alignment: 'center'}],
            //   //[{text: 'Products', style: 'tableHeader', alignment: 'center'}, {text: 'Amount', style: 'tableHeader', alignment: 'center'}],
            // ]
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
          }
        },
        { text: 'Shipping Fee:      ' + item.shippingFee, style: 'shippingFee', alignment: 'right' },
        { text: 'Sub Total:      ' + item.subTotal, style: 'subtotal', alignment: 'right' },
        { text: '\n \n' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            body: [
              [{
                text: "Terms and conditions Orders are usually processed and shipped within 3 business days (Monday-Friday) Excluding JAPAN holidays. Once your order is shipperd, you will be notified by Facebook message aloing with your tracking number. You can easily track it through EMS website https://www.post.japanpost.jp/int/ems/index_en.html" +
                  "We provide a wide range of shipping options for our JAPAN customers. \n \n" +
                  "Please note that PABITBIT LOCAL SHIP IS NOT INCLUDED",
                style: 'termsAndCondition'
              }],
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
          }
        },
        { text: '\n \n' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: [500],
            body: [
              [{
                text: [
                  { text: "PAYPAL \n\n", style: 'modeofpaymentheader' }, { text: "hazeltitco@yahoo.com \n \n \n" },
                  { text: "BDO \n\n", style: 'modeofpaymentheader' }, { text: "Hazel Joyce Titco Kojima \n \n  007570086691 \n \n METROBANK \n \n Hazel Joyce Titco Kojima \n \n 0663728040735 \n \n \n" },
                  { text: "JP BANK \n\n", style: 'modeofpaymentheader' }, { text: "Hazel Joyce Titco Kojima \n \n  1448043110571 " }
                ]
              }],
            ]
          },
          layout: {
            hLineWidth: function (i, node) {
              return 1
            },
            vLineWidth: function (i, node) {
              return 1
            },
            hLineColor: function (i, node) {
              return 'gray';
            },
            vLineColor: function (i, node) {
              return 'gray';
            },
          }
        }
      ],
      styles: {
        tableExample: {
          fontSize: 14
        },
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'justify'
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        modeofpaymentheader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        superMargin: {
          margin: [20, 0, 40, 0],
          fontSize: 9
        },
        subtotal: {
          fontSize: 13,
          margin: [5, 5, 5, 5],
          bold: true,
        },
        shippingFee: {
          fontSize: 12,
          margin: [5, 5, 5, 0],
        },
        termsAndCondition: {
          fontSize: 12,
          margin: [10, 10, 10, 10],
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  ngOnDestroy() {
    this.updateReservation();
  }

}
