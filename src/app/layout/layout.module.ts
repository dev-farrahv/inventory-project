import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { AddProductsComponent } from './add-products/add-products.component';
import { ReservationComponent } from './reservation/reservation.component';
import { InventoryComponent } from './inventory/inventory.component';
import { SharerManagementComponent } from './sharer-management/sharer-management.component';
import { PageHeaderModule } from '../shared';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ViewReservationComponent } from './view-reservation/view-reservation.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {NgxImageCompressService} from 'ngx-image-compress';
import { EarningReportComponent } from './earning-report/earning-report.component';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule,
        PageHeaderModule,
        NgbModule,
        FormsModule,
        NgxSpinnerModule,
        Ng2SearchPipeModule,
    ],
    declarations: [
        LayoutComponent,
        SidebarComponent,
        HeaderComponent,
        AddProductsComponent,
        ReservationComponent,
        InventoryComponent,
        ViewReservationComponent,
        SharerManagementComponent,
        EarningReportComponent],
    providers : [
        NgxImageCompressService
    ]
})
export class LayoutModule { }
