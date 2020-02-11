import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.scss'],
  animations: [routerTransition()]
})
export class AddProductsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
