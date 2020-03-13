import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


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
    name: '',
    serialNumber: '',
    qty: 1,
    color: '',
    purchasePrice: 0,
    sellingPrice: 0,
    currency: '',
    remarks: '',
    description: '',
    itemCode: '',
    image: 'assets/images/empty.png',
    weight: 0,
  };

  constructor(
    private productService: ProductService,
    public router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
  }

  remove(item) {
    this.productService.removeProduct(item.id);
  }

  async saveProduct() {
    if (this.fileData) {
      this.spinner.show();
      this.product.image = await this.productService.uploadFile(this.fileUpload);

    } else {
      return this.toastr.warning('Please upload an image!');
    }

    this.productService.addProduct(this.product).then(() => {
      this.router.navigate(['/inventory']);
      this.spinner.hide();
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
