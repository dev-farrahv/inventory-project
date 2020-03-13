import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [routerTransition()]
})
export class ReservationComponent implements OnInit {
  search = '';
  reservationList: Reservation[];
  printList = [];
  
  constructor(private reservationService: ReservationService, public router: Router) { }

  ngOnInit() {
    this.reservationService.getreservations().subscribe(res => {
      this.reservationList = res;
      console.log(this.reservationList);
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
    this.printList.push([{text: 'Products', style: 'tableHeader', alignment: 'center'}, {text: 'Amount', style: 'tableHeader', alignment: 'center'}]);
    item.products.forEach(invoice => {
      const invoicePrintList = [];
      invoicePrintList.push(invoice['name']);
      invoicePrintList.push( {text: invoice['sellingPrice'], alignment: 'center'});
      
      this.printList.push(invoicePrintList);
    });
    this.printList.push([{text: 'SUB TOTAL', style: 'tableHeader', alignment: 'center'}, {text: '25000', style: 'tableHeader', alignment: 'center'}]);    
    
    const docDefinition = {
      // {
      //   image: 'test.jpeg',
      //   width: 150,
      //   height: 150,
      // }, 
      //{
      //   image: await this.getBase64ImageFromURL(item.products[0].image),
      //   width: 200,
      //   height: 200,
      //   alignment: 'center'
      // },
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
                {text: [
                  {text: '   2Nd \n', fontSize: 15, bold: true},
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
            {text: ' Invoice To: \n', fontSize: 12, bold: true},
            {text: item.name + ' \n \n', fontSize: 12},
            {text: ' Date: \n', fontSize: 12, bold: true},
            {text: dateToday + ' \n \n', fontSize: 12}
          ]
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [ ... this.printList]
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
        { text: '\n \n'}, 
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            body: [
              [{text: "Terms and conditions Orders are usually processed and shipped within 3 business days (Monday-Friday) Excluding JAPAN holidays. Once your order is shipperd, you will be notified by Facebook message aloing with your tracking number. You can easily track it through EMS website https://www.post.japanpost.jp/int/ems/index_en.html" +
              "We provide a wide range of shipping options for our JAPAN customers. \n \n" +
              "Please note that PABITBIT LOCAL SHIP IS NOT INCLUDED"}],
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
        { text: '\n \n'}, 
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: [500],
            body: [
              [{text: [
                {text: "PAYPAL \n\n", style: 'modeofpaymentheader' }, {text: "hazeltitco@yahoo.com \n \n \n" },
                {text: "BDO \n\n", style: 'modeofpaymentheader' }, {text: "Hazel Joyce Titco Kojima \n \n  007570086691 \n \n METROBANK \n \n Hazel Joyce Titco Kojima \n \n 0663728040735 \n \n \n" },
                {text: "JP BANK \n\n", style: 'modeofpaymentheader' }, {text: "Hazel Joyce Titco Kojima \n \n  1448043110571 " }  
                ]
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
        }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

}
