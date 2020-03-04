import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.scss'],
  animations: [routerTransition()]
})
export class AddProductsComponent implements OnInit {

  fileData: File = null;
  previewUrl: any = null;
  fileUpload: FileList = null;
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
    image: "assets/images/empty.png",
    weight: "",
  };

  constructor(private productService: ProductService, public router: Router, private spinner: NgxSpinnerService) { }
 
  ngOnInit() {
  }
 
  remove(item) {
    this.productService.removeProduct(item.id);
  }

  async saveProduct(){
   if (this.fileData) {
      this.spinner.show();
      this.product.image = await this.productService.uploadFile(this.fileUpload);
      this.spinner.hide();
   }

    this.productService.addProduct(this.product).then(() => {
      this.router.navigate(['/inventory']);
    });
  }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.fileUpload = <FileList>fileInput.target.files;
    this.preview();
  }
  
  preview() {
    // Show preview 
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    };
  }

}
