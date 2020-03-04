import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Product, ProductService } from 'src/app/shared/services/product.service';


@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.scss'],
  animations: [routerTransition()]
})
export class AddProductsComponent implements OnInit {

  productList: Product[];
  product: Product = {  
    name: "",
    serialNumber: "",
    qty: "",
    color: "",
    price: "",
    currency: "",
    remarks: "",
    otherDescription: "",
    itemCode: "",
    image: "",
    weight: "",
  };

  constructor(private productService: ProductService) { }
 
  ngOnInit() {
    this.productService.getproducts().subscribe(res => {
      this.productList = res;
      console.log(this.productList);
    });
  }
 
  remove(item) {
    this.productService.removeProduct(item.id);
  }

  saveProduct(){
    console.log('heyyy');
    this.productService.addProduct(this.product).then(() => {
      console.log('success');
    });
  }

}
