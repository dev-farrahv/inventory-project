import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AddProductsComponent } from './add-products/add-products.component';
import { ReservationComponent } from './reservation/reservation.component';
import { InventoryComponent } from './inventory/inventory.component';
import { ViewReservationComponent } from './view-reservation/view-reservation.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            {
                path: 'add-products',
                component: AddProductsComponent
            },
            {
                path: 'view-reservation',
                component: ViewReservationComponent
            },
            {
                path: 'reservations',
                component: ReservationComponent
            },
            {
                path: 'inventory',
                component: InventoryComponent
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
