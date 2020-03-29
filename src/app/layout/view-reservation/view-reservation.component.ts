import { Component, OnInit, Input } from '@angular/core';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
import { ShippingFeeService, ShippingFee } from 'src/app/shared/services/shipping-fee.service';
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
    modeOfPayment: '',
    dateCreated: '',
  };
  printList: any[];
  shippingFees: ShippingFee[];

  activeZone: ShippingFee[];
  loading = true;

  constructor(
    public router: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private toastr: ToastrService,
    private shippingService: ShippingFeeService
  ) {
    this.spinner.show();
    this.route.params.subscribe(params => {
      if (!params.id) {
        router.navigate(['/reservations']);
      }

      this.reservationService.getReservation(params.id).subscribe(reservation => {
        this.reservation = reservation;
        this.reservation.id = params.id;
        if (this.reservation.zone == null) {
          this.reservation.zone = 1;
        }
        if (this.reservation.discount == null) {
          this.reservation.discount = 0;
        }
        this.spinner.hide();
        this.loading = false;
      });
    });
    this.shippingService.getShippingFees().subscribe((sf: ShippingFee[]) => {
      this.shippingFees = sf;
      this.setZone();
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
    return (this.reservation.totalPrice + this.reservation.shippingFee) - ((this.reservation.discount * this.reservation.totalPrice) / 100);
  }

  calcShippingFee() {
    let weight = this.reservation.totalWeight;
    if (this.reservation.shippingFee == null) {
      weight = 0;
    }

    if (weight > 12000) {
      weight = 12000;
    }

    const amount = this.activeZone.find(sf => weight <= sf.max).amount;

    this.reservation.shippingFee = amount;
    this.reservation.subTotal = this.calcSubTotal();
  }

  calcDiscount() {

    if (this.reservation.discount > 100) {
      this.reservation.discount = 100;
    }

    this.reservation.subTotal = this.calcSubTotal();
  }



  setZone() {
    this.activeZone = this.shippingFees.filter(item => item.zone === +this.reservation.zone).sort((a, b) => {
      return a.min - b.min;
    });

    this.calcShippingFee();
  }

  checkIfZero() {
    if (this.reservation.shippingFee == null) {
      this.reservation.shippingFee = 0;
    }

    if (this.reservation.discount == null) {
      this.reservation.discount = 0;
    }

    if (this.reservation.totalWeight == null) {
      this.reservation.totalWeight = 0;
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
            headerRows: 5,
            widths: [100, '*', '*'],
            body: [
              [
                { text: 'Item Code ', bold: true, alignment: 'right', style: 'col' },
                { text: this.reservation.products[i].itemCode, bold: true, style: 'col' },
                {
                  image: await this.getBase64ImageFromURL(this.reservation.products[i].image),
                  width: 100,
                  alignment: 'center',
                  margin: [10, 10, 10, 10],
                  rowSpan: 5
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
          text: 'INVOICE \n',
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
            { text: ' Invoice To: \n', fontSize: 10, bold: true },
            { text: item.name + ' \n', fontSize: 10 },
            { text: ' Date: \n', fontSize: 10, bold: true },
            { text: dateToday + ' \n', fontSize: 10 }
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
        { text: '\n' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            body: [
              [{
                stack: [{
                  text: [
                    { text: "Terms and conditions \n \n", style: 'modeofpaymentheader' },
                    {
                      text: "Terms and conditions Orders are usually processed and shipped within 3 business days (Monday-Friday) Excluding JAPAN holidays. Once your order is shipped, you will be notified via fb messenger along with your tracking number. You can easily track it through EMS website https://www.post.japanpost.jp/int/ems/index_en.html. " +
                        "We provide a wide range of shipping options for our JAPAN customers. \n \n" +
                        "Please note that PABITBIT LOCAL SHIP IS NOT INCLUDED"
                    }
                  ]
                }],
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
        { text: '\n' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              [{ text: "\n PAYPAL", style: 'modeofpaymentheader' }, { text: "\n BDO ", style: 'modeofpaymentheader' }],
              [{ text: "hazeltitco@yahoo.com \n \n \n", style: 'modeOfPaymentMargin' }, { text: "Hazel Joyce Titco Kojima \n \n  007570086691 \n \n ", style: 'modeOfPaymentMargin' }],
              [{ text: "METROBANK ", style: 'modeofpaymentheader' }, { text: "JP BANK ", style: 'modeofpaymentheader' }],
              [{ text: "Hazel Joyce Titco Kojima \n \n 0663728040735 \n \n \n", style: 'modeOfPaymentMargin' }, { text: "Hazel Joyce Titco Kojima \n \n  1448043110571 ", style: 'modeOfPaymentMargin' }],
            ]
            // body: [
            //   [{

            //       text: [
            //         { text: "PAYPAL \n", style: 'modeofpaymentheader' }, { text: "hazeltitco@yahoo.com \n \n \n",  style: 'modeOfPaymentMargin' },
            //         { text: "BDO \n", style: 'modeofpaymentheader' }, { text: "Hazel Joyce Titco Kojima \n \n  007570086691 \n \n "},
            //         { text: "METROBANK \n", style: 'modeofpaymentheader' }, { text:"Hazel Joyce Titco Kojima \n \n 0663728040735 \n \n \n",  style: 'modeOfPaymentMargin' },
            //         { text: "JP BANK \n", style: 'modeofpaymentheader' }, { text: "Hazel Joyce Titco Kojima \n \n  1448043110571 ",  style: 'modeOfPaymentMargin' }
            //       ]

            //   }],
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
              return (i === 0 || i === node.table.body.length) ? 'black' : 'white';
            },
            vLineColor: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'white';
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
          margin: [10, 0, 10, 0],
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        superMargin: {
          margin: [10, 10, 10, 10],
          fontSize: 9
        },
        modeOfPaymentMargin: {
          margin: [10, 0, 10, 0],
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

  async printPaymentReceipt(item) {
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
    const docDefinition = {
      content: [
        {
          text: 'Payment Receipt \n',
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
            { text: ' Received From: \n', bold: true },
            { text: item.name + ' \n \n' },
            { text: item.address   + ' \n \n' }
          ]
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*','*', '*'],
            body: [
              [{text: 'Reference Number', style: 'tableHeader'}, {text: 'Date', style: 'tableHeader'}, {text: 'Payment Type', style: 'tableHeader'}, {text: 'Amount', style: 'tableHeader'}],
              [{text: item.referenceNumber}, {text: item.dateCreated}, {text: item.modeOfPayment}, {text: item.subTotal}],
              //[{text: 'Products', style: 'tableHeader', alignment: 'center'}, {text: 'Amount', style: 'tableHeader', alignment: 'center'}],
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
              return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
            },
            vLineColor: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
            },
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
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        modeofpaymentheader: {
          margin: [10, 0, 10, 0],
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        superMargin: {
          margin: [10, 10, 10, 10],
          fontSize: 9
        },
        modeOfPaymentMargin: {
          margin: [10, 0, 10, 0],
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

  showModeOfPayment() {
    console.log(this.reservation.status);
    this.spinner.show();
    this.reservationService.updateReservation(this.reservation).then(() => {
      this.toastr.success('Reservation updated!');
      this.spinner.hide();
    });
  }

  
}
