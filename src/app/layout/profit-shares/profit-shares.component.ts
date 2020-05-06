import { Component, OnInit, NgZone } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProfitService } from 'src/app/shared/services/profit.service';
import { routerTransition } from 'src/app/router.animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ExportToCsv } from 'export-to-csv';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profit-shares',
  templateUrl: './profit-shares.component.html',
  styleUrls: ['./profit-shares.component.scss'],
  animations: [routerTransition()]
})
export class ProfitSharesComponent implements OnInit {
  private destroyed$ = new Subject();
  reservations: Reservation[];
  reservationList: Reservation[];
  reservation$: any;
  deductionPercent = 30;
  loading: boolean;
  totalSoldPrice: number;
  totalPurchasePrice: number;
  totalProfit: number;
  totalDeductions: number;
  totalNetProfit: number;
  totalShares = 0;
  sharer: any = {
    name: null,
    percent: null
  };
  sharers: any[] = [];
  fromDate: any;
  toDate: any;
  hoveredDate: NgbDate | null = null;
  totalPercent = 0;
  totalProfitPerShare = 0;
  totalProductDiscount = 0;
  csvProducts: any;
  csvSharer: any;
  baseUrl: string;

  constructor(
    private modalService: NgbModal,
    private reservationService: ReservationService,
    private profitService: ProfitService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.baseUrl = environment.baseUrl;
    this.toDate = this.calendar.getToday();
    this.fromDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 7);
    this.loading = true;
    this.spinner.show();
    this.reservationService.getreservations()
      .pipe(takeUntil(this.destroyed$)).subscribe(res => {
        this.reservations = res.filter(r => r.status !== 'Canceled' && r.status !== 'Pending');
        this.setReservationsByWeek();
        this.spinner.hide();
        this.loading = false;
      });
    this.calculateTotalProfitPerShare();
  }


  setReservationsByWeek() {
    this.spinner.show();
    const to = moment(new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day)).add(1, 'days');
    const from = moment(new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day));

    this.reservationList = this.reservations.filter(r => r.dateUpdated).filter(
      r => moment(new Date(r.dateUpdated.seconds * 1000)) >= from
        && moment(new Date(r.dateUpdated.seconds * 1000)) < to).sort((a, b) => {
          return a.dateUpdated > b.dateUpdated ? 1 : -1;
        });
    this.totalSoldPrice = this.calculateTotalPrice('sellingPrice');
    this.totalPurchasePrice = this.calculateTotalPrice('purchasePrice');
    this.totalProfit = this.calculateOverAllTotalProfit();
    this.totalDeductions = this.calculateTotalDeductionsByPercent();
    this.totalNetProfit = this.calculateTotalNetProfit();
    this.totalProductDiscount = this.calculateTotalItemDiscounts();
    this.spinner.hide();
  }

  async addSharer() {
    if (!this.sharer.name || !this.sharer.percent) {
      return;
    }
    if ((this.sharer.percent + this.totalPercent) > 100) {
      return this.toastr.warning('Maximum percent exceeds!');
    }

    this.spinner.show();
    this.profitService.addSharer(this.sharer);
    this.spinner.hide();
    this.close();
    this.sharer = {
      name: null,
      percent: null
    };
  }

  async updateSharer() {
    if (!this.sharer.name || !this.sharer.percent) {
      return;
    }
    if ((this.sharer.percent + this.totalPercent) > 100) {
      return this.toastr.warning('Maximum percent exceeds!');
    }

    this.spinner.show();
    this.profitService.updateSharer(this.sharer);
    this.spinner.hide();
    this.close();
    this.sharer = {
      name: null,
      percent: null
    };
  }

  async deleteSharer() {
    this.spinner.show();
    this.profitService.removeSharer(this.sharer.id);
    this.spinner.hide();
    this.close();
  }

  openEdit(content, sharer) {
    this.sharer = sharer;
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      // console.log(result);
    }, (reason) => {
      // console.log(reason);
    });
  }

  open(content) {
    this.sharer = {
      name: null,
      percent: null
    };
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      // console.log(result);
    }, (reason) => {
      // console.log(reason);
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  calculateTotalProfit(sellingPrice, purchasePrice, discount) {
    return Math.round((sellingPrice - purchasePrice) - (discount ? discount : 0));
  }

  calculateDeductionsByPercent(sellingPrice, purchasePrice, discount) {
    const total = this.calculateTotalProfit(sellingPrice, purchasePrice, discount);
    return Math.round((total * this.deductionPercent) / 100);
  }

  calculateNetProfit(sellingPrice, purchasePrice, discount) {
    const deduction = this.calculateDeductionsByPercent(sellingPrice, purchasePrice, discount);
    return Math.round(sellingPrice - deduction) - (discount ? discount : 0);
  }

  calculateTotalPrice(field) {
    return this.reservationList.reduce((totalPrice, reservation) => {
      const amount = reservation.products.reduce((total, product) => {
        return total + product[field];
      }, 0);
      return totalPrice + amount;
    }, 0);
  }

  calculateOverAllTotalProfit() {
    return this.calculateTotalPrice('sellingPrice') - this.calculateTotalPrice('purchasePrice');
  }

  calculateTotalDeductionsByPercent() {
    return this.reservationList.reduce((totalPrice, reservation) => {
      const amount = reservation.products.reduce((total, product) => {
        return total + this.calculateDeductionsByPercent(product.sellingPrice, product.purchasePrice, product.discount);
      }, 0);
      return totalPrice + amount;
    }, 0);
  }

  calculateTotalNetProfit() {
    return this.reservationList.reduce((totalPrice, reservation) => {
      const amount = reservation.products.reduce((total, product) => {
        return total + this.calculateNetProfit(product.sellingPrice, product.purchasePrice, product.discount);
      }, 0);
      return totalPrice + amount;
    }, 0);
  }

  calculateProfitPerShare(percent) {

    if (!percent || !this.totalNetProfit) {
      return 0;
    }

    return (this.totalNetProfit * percent) / 100;
  }

  calculateTotalProfitPerShare() {
    this.profitService.getsharer()
      .pipe(takeUntil(this.destroyed$)).subscribe(res => {
        this.sharers = res;
        this.totalPercent = res.reduce((total, r) => {
          return total + r.percent;
        }, 0);

        this.totalProfitPerShare = res.reduce((total, r) => {
          return total + this.calculateProfitPerShare(r.percent);
        }, 0);
      });
  }

  calculateTotalItemDiscounts() {
    return this.reservationList.reduce((totalPrice, reservation) => {
      const amount = reservation.products.reduce((total, product) => {
        const discount = product.discount ? product.discount : 0;
        return total + discount;
      }, 0);
      return totalPrice + amount;
    }, 0);
  }


  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }

    if (this.fromDate && this.toDate) {
      this.setReservationsByWeek();
    }

  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  changePercent(percent) {
    this.deductionPercent = percent;
    this.setReservationsByWeek();
    this.calculateTotalProfitPerShare();
  }

  generateCsv() {
    this.csvProducts = [];
    this.csvSharer = [];

    this.reservationList.forEach((reservation, r) => {
      reservation.products.forEach((product, p) => {
        this.csvProducts.push({
          col1: reservation.referenceNumber,
          col2: reservation.name,
          col3: product.name,
          col4: product.sellingPrice,
          col5: product.purchasePrice,
          col6: this.calculateTotalProfit(product.sellingPrice, product.purchasePrice, product.discount),
          col7: this.calculateDeductionsByPercent(product.sellingPrice, product.purchasePrice, product.discount),
          col8: this.calculateNetProfit(product.sellingPrice, product.purchasePrice, product.discount),
        });
      });
    });

    // footer total
    this.csvProducts.push({
      col1: '',
      col2: '',
      col3: '',
      col4: this.totalSoldPrice,
      col5: this.totalPurchasePrice,
      col6: this.totalProfit,
      col7: this.totalDeductions,
      col8: this.totalNetProfit,
    });

    // for Sharer table
    this.csvSharer = [
      { col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '' },
      { col1: '', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '' },
      { col1: 'SHARERS', col2: '', col3: '', col4: '', col5: '', col6: '', col7: '', col8: '' }];

    this.sharers.forEach((sharer, p) => {
      this.csvSharer.push({
        col1: sharer.name,
        col2: sharer.percent,
        col3: this.calculateProfitPerShare(sharer.percent),
        col4: '',
        col5: '',
        col6: '',
        col7: '',
        col8: '',
      });
    });

    const data = [... this.csvProducts, ... this.csvSharer];

    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: '2nd Bags and Clothing co.',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: false,
      headers: [
        'Reference Number',
        'Customer Name',
        'Product Name',
        'Sold Price',
        'Purchase Price',
        'Total Profit',
        '-' + this.deductionPercent + '% Profit',
        'Net Profit']
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };

    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(data);
  }

  getUrl(id) {
    return `${this.baseUrl}/view-reservation;id=${id}`;
  }
}
