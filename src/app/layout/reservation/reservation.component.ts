import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { ShippingFeeService, ShippingFee } from 'src/app/shared/services/shipping-fee.service';
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
  shippingFeeData = [];
  shippingFee: ShippingFee = {
    min: 0,
    max: 0,
    shippingFee: 0,
    amount: 0,
    zone: 0,
    continent: []
  };

  constructor(private reservationService: ReservationService, private shippingService: ShippingFeeService, public router: Router) { }

  ngOnInit() {
    this.reservationService.getreservations().subscribe(res => {
      this.reservationList = res.filter(reservation => reservation.status !== 'Canceled');
    });

    //remove this once migrated to prod
    this.shippingService.getShippingFees().subscribe((shipping: ShippingFee[]) => {
      console.log(shipping);
      if(shipping.length <= 0){
        console.log("run populate shipping fee");
        this.populateShippingFee();
      }
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

  populateShippingFee(){
    this.shippingFeeData = [{min: 0, max: 500, continent: ["Asia"], zone: "1", shippingFee: "1400"},
    {min: 0, max: 500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2000"},
    {min: 0, max: 500, continent: ["Europe"], zone: "3", shippingFee: "2200"},
    {min: 0, max: 500, continent: ["South America "," Africa"], zone: "4", shippingFee: "2400"},
    
    {min: 501, max: 600, continent: ["Asia"], zone: "1", shippingFee: "1540"},
    {min: 501, max: 600, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2180"},
    {min: 501, max: 600, continent: ["Europe"], zone: "3", shippingFee: "2400"},
    {min: 501, max: 600, continent: ["South America "," Africa"], zone: "4", shippingFee: "2740"},
    
    {min: 601, max: 700, continent: ["Asia"], zone: "1", shippingFee: "1680"},
    {min: 601, max: 700, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2360"},
    {min: 601, max: 700, continent: ["Europe"], zone: "3", shippingFee: "2600"},
    {min: 601, max: 700, continent: ["South America "," Africa"], zone: "4", shippingFee: "3080"},
    
    {min: 701, max: 800, continent: ["Asia"], zone: "1", shippingFee: "1820"},
    {min: 701, max: 800, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2540"},
    {min: 701, max: 800, continent: ["Europe"], zone: "3", shippingFee: "2800"},
    {min: 701, max: 800, continent: ["South America "," Africa"], zone: "4", shippingFee: "3420"},
    
    {min: 801, max: 900, continent: ["Asia"], zone: "1", shippingFee: "1960"},
    {min: 801, max: 900, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2720"},
    {min: 801, max: 900, continent: ["Europe"], zone: "3", shippingFee: "3000"},
    {min: 801, max: 900, continent: ["South America "," Africa"], zone: "4", shippingFee: "4100"},
    
    {min: 901, max: 1000, continent: ["Asia"], zone: "1", shippingFee: "2100"},
    {min: 901, max: 1000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "2900"},
    {min: 901, max: 1000, continent: ["Europe"], zone: "3", shippingFee: "3200"},
    {min: 901, max: 1000, continent: ["South America "," Africa"], zone: "4", shippingFee: "4900"},
    
    {min: 1001, max: 1250, continent: ["Asia"], zone: "1", shippingFee: "2400"},
    {min: 1001, max: 1250, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "3300"},
    {min: 1001, max: 1250, continent: ["Europe"], zone: "3", shippingFee: "3650"},
    {min: 1001, max: 1250, continent: ["South America "," Africa"], zone: "4", shippingFee: "5700"},
    
    {min: 1251, max: 1500, continent: ["Asia"], zone: "1", shippingFee: "2700"},
    {min: 1251, max: 1500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "3700"},
    {min: 1251, max: 1500, continent: ["Europe"], zone: "3", shippingFee: "4100"},
    {min: 1251, max: 1500, continent: ["South America "," Africa"], zone: "4", shippingFee: "6500"},
    
    {min: 1501, max: 1750, continent: ["Asia"], zone: "1", shippingFee: "3000"},
    {min: 1501, max: 1750, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "4100"},
    {min: 1501, max: 1750, continent: ["Europe"], zone: "3", shippingFee: "4550"},
    {min: 1501, max: 1750, continent: ["South America "," Africa"], zone: "4", shippingFee: "7300"},
    
    {min: 1751, max: 2000, continent: ["Asia"], zone: "1", shippingFee: "3300"},
    {min: 1751, max: 2000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "4500"},
    {min: 1751, max: 2000, continent: ["Europe"], zone: "3", shippingFee: "5000"},
    {min: 1751, max: 2000, continent: ["South America "," Africa"], zone: "4", shippingFee: "8800"},
    
    {min: 2001, max: 2500, continent: ["Asia"], zone: "1", shippingFee: "3800"},
    {min: 2001, max: 2500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "5200"},
    {min: 2001, max: 2500, continent: ["Europe"], zone: "3", shippingFee: "5800"},
    {min: 2001, max: 2500, continent: ["South America "," Africa"], zone: "4", shippingFee: "10300"},
    
    {min: 2501, max: 3000, continent: ["Asia"], zone: "1", shippingFee: "4300"},
    {min: 2501, max: 3000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "5900"},
    {min: 2501, max: 3000, continent: ["Europe"], zone: "3", shippingFee: "6600"},
    {min: 2501, max: 3000, continent: ["South America "," Africa"], zone: "4", shippingFee: "11800"},
    
    {min: 3001, max: 3500, continent: ["Asia"], zone: "1", shippingFee: "4800"},
    {min: 3001, max: 3500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "6600"},
    {min: 3001, max: 3500, continent: ["Europe"], zone: "3", shippingFee: "7400"},
    {min: 3001, max: 3500, continent: ["South America "," Africa"], zone: "4", shippingFee: "13300"},
    
    {min: 3501, max: 4000, continent: ["Asia"], zone: "1", shippingFee: "5300"},
    {min: 3501, max: 4000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "7300"},
    {min: 3501, max: 4000, continent: ["Europe"], zone: "3", shippingFee: "8200"},
    {min: 3501, max: 4000, continent: ["South America "," Africa"], zone: "4", shippingFee: "14800"},
    
    {min: 4001, max: 4500, continent: ["Asia"], zone: "1", shippingFee: "5800"},
    {min: 4001, max: 4500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "8000"},
    {min: 4001, max: 4500, continent: ["Europe"], zone: "3", shippingFee: "9000"},
    {min: 4001, max: 4500, continent: ["South America "," Africa"], zone: "4", shippingFee: "16300"},
    
    {min: 4501, max: 5000, continent: ["Asia"], zone: "1", shippingFee: "6300"},
    {min: 4501, max: 5000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "8700"},
    {min: 4501, max: 5000, continent: ["Europe"], zone: "3", shippingFee: "9800"},
    {min: 4501, max: 5000, continent: ["South America "," Africa"], zone: "4", shippingFee: "17800"},
    
    {min: 5001, max: 5500, continent: ["Asia"], zone: "1", shippingFee: "6800"},
    {min: 5001, max: 5500, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "9400"},
    {min: 5001, max: 5500, continent: ["Europe"], zone: "3", shippingFee: "10600"},
    {min: 5001, max: 5500, continent: ["South America "," Africa"], zone: "4", shippingFee: "19300"},
    
    {min: 5501, max: 6000, continent: ["Asia"], zone: "1", shippingFee: "7300"},
    {min: 5501, max: 6000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "10100"},
    {min: 5501, max: 6000, continent: ["Europe"], zone: "3", shippingFee: "11400"},
    {min: 5501, max: 6000, continent: ["South America "," Africa"], zone: "4", shippingFee: "21400"},
    
    {min: 6001, max: 7000, continent: ["Asia"], zone: "1", shippingFee: "8100"},
    {min: 6001, max: 7000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "11200"},
    {min: 6001, max: 7000, continent: ["Europe"], zone: "3", shippingFee: "12700"},
    {min: 6001, max: 7000, continent: ["South America "," Africa"], zone: "4", shippingFee: "23500"},
    
    {min: 7001, max: 8000, continent: ["Asia"], zone: "1", shippingFee: "8900"},
    {min: 7001, max: 8000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "12300"},
    {min: 7001, max: 8000, continent: ["Europe"], zone: "3", shippingFee: "1400"},
    {min: 7001, max: 8000, continent: ["South America "," Africa"], zone: "4", shippingFee: "25600"},
    
    {min: 8001, max: 9000, continent: ["Asia"], zone: "1", shippingFee: "9700"},
    {min: 8001, max: 9000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "13400"},
    {min: 8001, max: 9000, continent: ["Europe"], zone: "3", shippingFee: "15300"},
    {min: 8001, max: 9000, continent: ["South America "," Africa"], zone: "4", shippingFee: "27700"},
    
    {min: 9001, max: 10000, continent: ["Asia"], zone: "1", shippingFee: "10500"},
    {min: 9001, max: 10000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "14500"},
    {min: 9001, max: 10000, continent: ["Europe"], zone: "3", shippingFee: "16600"},
    {min: 9001, max: 10000, continent: ["South America "," Africa"], zone: "4", shippingFee: "29800"},
    
    {min: 10001, max: 11000, continent: ["Asia"], zone: "1", shippingFee: "11300"},
    {min: 10001, max: 11000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "15600"},
    {min: 10001, max: 11000, continent: ["Europe"], zone: "3", shippingFee: "17900"},
    {min: 10001, max: 11000, continent: ["South America "," Africa"], zone: "4", shippingFee: "31900"},
    
    {min: 11001, max: 12000, continent: ["Asia"], zone: "1", shippingFee: "12100"},
    {min: 11001, max: 12000, continent: ["Oceania"," North America", " Central America"," Middle East"], zone: "2", shippingFee: "16700"},
    {min: 11001, max: 12000, continent: ["Europe"], zone: "3", shippingFee: "19200"},
    {min: 11001, max: 12000, continent: ["South America "," Africa"], zone: "4", shippingFee: "34000"}];

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

}
