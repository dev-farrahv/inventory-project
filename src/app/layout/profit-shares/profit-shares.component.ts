import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Reservation, ReservationService } from 'src/app/shared/services/reservations.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProfitService } from 'src/app/shared/services/profit.service';
import { routerTransition } from 'src/app/router.animations';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profit-shares',
  templateUrl: './profit-shares.component.html',
  styleUrls: ['./profit-shares.component.scss'],
  animations: [routerTransition()]
})
export class ProfitSharesComponent implements OnInit {
  private destroyed$ = new Subject();
  weeks: any[] = [];
  week: any;
  reservationList: Reservation[];
  weekId: number;
  reservation$: any;
  deductionPercent = 30;
  loading: boolean;
  totalSoldPrice: number;
  totalPurchasePrice: number;
  totalProfit: number;
  totalDeductions: number;
  totalNetProfit: number;
  totalShares = 0;
  sharer = {
    name: null,
    shares: null
  };

  constructor(
    private modalService: NgbModal,
    private reservationService: ReservationService,
    private weeksService: ProfitService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.spinner.show();
    this.weeksService.getWeeksOrderById().pipe(takeUntil(this.destroyed$)).subscribe(weeks => {
      this.weeks = weeks;
      this.weekId = weeks.length;
      this.week = this.weeks[this.weekId - 1];

      this.spinner.hide();
      this.setReservationsByWeekId();
      this.loading = false;
    });
  }

  setReservationsByWeekId() {
    this.spinner.show();
    if (this.reservation$) {
      this.reservation$.unsubscribe();
    }

    this.reservation$ = this.reservationService.getReservationByWeekId(this.weekId).
      pipe(takeUntil(this.destroyed$)).subscribe(res => {
        this.reservationList = res.sort((a, b) => {
          const dateA = new Date(a.dateCreated);
          const dateB = new Date(b.dateCreated);
          return dateA > dateB ? 1 : -1;
        });
        this.totalSoldPrice = this.calculateTotalPrice('sellingPrice');
        this.totalPurchasePrice = this.calculateTotalPrice('purchasePrice');
        this.totalProfit = this.calculateOverAllTotalProfit();
        this.totalDeductions = this.calculateTotalDeductionsByPercent();
        this.totalNetProfit = this.calculateTotalNetProfit();
        this.totalShares = this.weeks[this.weekId - 1].sharers.reduce((total, sharer) => {
          return total + sharer.shares;
        }, 0);
        this.spinner.hide();
      });
  }
  async startNewWeek() {
    const newWeek = {
      dateStarte: new Date().toLocaleDateString(),
      weekId: this.weeks.length + 1,
      sharers: []
    };
    this.spinner.show();
    await this.weeksService.addWeek(newWeek);
    this.setReservationsByWeekId();
    this.spinner.hide();
    this.toastr.success(`Week ${newWeek.weekId} added!`);
  }

  async addSharer() {
    if (!this.sharer.name || !this.sharer.shares) {
      return;
    }

    if (this.sharer.shares > 10) {
      return this.toastr.warning('Maximum 10 shares only!');
    }

    this.weeks[this.weekId - 1].sharers.push(this.sharer);
    this.sharer = {
      name: null,
      shares: null
    };

    this.spinner.show();
    await this.weeksService.updateWeek(this.weeks[this.weekId - 1]);
    this.spinner.hide();


    this.close();
  }

  open(content) {
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log(reason);
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

  prevWeek() {
    if (this.weekId !== 1) {
      this.weekId--;
      this.setReservationsByWeekId();
    }
  }

  nextWeek() {
    if (this.weekId !== this.weeks.length) {
      this.weekId++;
      this.setReservationsByWeekId();
    }
  }

  calculateTotalProfit(sellingPrice, purchasePrice) {
    return Math.round(sellingPrice - purchasePrice);
  }

  calculateDeductionsByPercent(sellingPrice, purchasePrice) {
    const total = this.calculateTotalProfit(sellingPrice, purchasePrice);
    return Math.round((total * this.deductionPercent) / 100);
  }

  calculateNetProfit(sellingPrice, purchasePrice) {
    const deduction = this.calculateDeductionsByPercent(sellingPrice, purchasePrice);
    return Math.round(sellingPrice - deduction);
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
        return total + this.calculateDeductionsByPercent(product.sellingPrice, product.purchasePrice);
      }, 0);
      return totalPrice + amount;
    }, 0);
  }

  calculateTotalNetProfit() {
    return this.reservationList.reduce((totalPrice, reservation) => {
      const amount = reservation.products.reduce((total, product) => {
        return total + this.calculateNetProfit(product.sellingPrice, product.purchasePrice);
      }, 0);
      return totalPrice + amount;
    }, 0);
  }

  calculateProfitPerShare(shares) {

    if (!shares || !this.totalNetProfit || !this.totalShares) {
      return 0;
    }

    return (this.totalNetProfit / this.totalShares) * shares;
  }
}
