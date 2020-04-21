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
  weeks: any[];
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
    this.weeksService.getWeeks().pipe(takeUntil(this.destroyed$)).subscribe(weeks => {
      this.weeks = weeks;
      this.weekId = weeks.length;
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
    console.log(this.weekId);

    this.reservation$ = this.reservationService.getReservationByWeekId(this.weekId).
      pipe(takeUntil(this.destroyed$)).subscribe(res => {
        this.reservationList = res.filter(reservation => reservation.status !== 'Canceled').sort((a, b) => {
          const dateA = new Date(a.dateCreated);
          const dateB = new Date(b.dateCreated);
          return dateA > dateB ? 1 : -1;
        });
        this.totalSoldPrice = this.calculateTotalPrice('sellingPrice');
        this.totalPurchasePrice = this.calculateTotalPrice('purchasePrice');
        this.totalProfit = this.calculateOverAllTotalProfit();
        this.totalDeductions = this.calculateTotalDeductionsByPercent();
        this.totalNetProfit = this.calculateTotalNetProfit();
        this.spinner.hide();
      });
  }
  async startNewWeek() {
    const newWeek = {
      weekId: this.weeks.length + 1,
      sharers: []
    };
    this.spinner.show();
    await this.weeksService.addWeek(newWeek);
    this.spinner.hide();
    this.toastr.success(`Week ${newWeek.weekId} added!`)
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

  nestWeek() {
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
}
