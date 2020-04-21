import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { ShippingFeeService, ShippingFee } from 'src/app/shared/services/shipping-fee.service';
import { Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [routerTransition()]
})
export class ReservationComponent implements OnInit {
  private destroyed$ = new Subject();
  search = '';
  reservations: Reservation[];
  reservationList: Reservation[];
  printList = [];
  shippingFeeData = [];
  filterStatus = 'All';
  shippingFee: ShippingFee = {
    min: 0,
    max: 0,
    shippingFee: 0,
    amount: 0,
    zone: 0,
    continent: []
  };

  constructor(
    private reservationService: ReservationService,
    private shippingService: ShippingFeeService,
    public router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.reservationService.getreservations().pipe(takeUntil(this.destroyed$)).subscribe(res => {
      this.reservations = res;
      this.reservationList = res;
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


  async printPdf(item) {
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

  populateShippingFee() {
    this.shippingFeeData = []; //insert here the data to be populated

    this.shippingFeeData.forEach((data, i) => {
      this.shippingFee.min = data.min;
      this.shippingFee.max = data.max;
      this.shippingFee.amount = data.shippingFee;
      this.shippingFee.zone = data.zone;
      this.shippingFee.continent = data.continent;

      this.shippingService.addShippingFee(this.shippingFee).then(() => {
        console.log('success');
      });
    });

  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  setReservationsByStatus() {
    if (this.filterStatus == 'All') {
      this.reservationList = this.reservations;
    } else {
      this.reservationList = this.reservations.filter(reservation => reservation.status === this.filterStatus);
    }

  }
}
