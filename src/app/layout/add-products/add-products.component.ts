import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { Product, ProductService } from 'src/app/shared/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs/operators';
import { NgxImageCompressService } from 'ngx-image-compress';



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
  editMode = false;
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
  closeResult: string;
  imageFileCompressed: any = null;
  getCompressedFile: any = null;
  sizeOfOriginalImage: number;
  sizeOFCompressedImage: number;
  imgResultAfterCompress: string;

  constructor(
    private productService: ProductService,
    public router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private imageCompress: NgxImageCompressService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.spinner.show();
        this.editMode = true;
        this.productService.getProduct(params.id).pipe(take(1)).subscribe(product => {
          this.product = product;
          this.product.id = params.id;
          this.spinner.hide();
        });
      }
    });
  }

  remove(item) {
    this.productService.removeProduct(item.id);
  }


  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  async saveProduct() {
    if (!this.editMode) {
      if (this.fileData) {
        this.spinner.show();

        await this.compressImage();
        this.product.image = await this.productService.uploadFile(this.imageFileCompressed, this.fileUpload[0].name);

      } else {
        return this.toastr.warning('Please upload an image!');
      }

      this.productService.addProduct(this.product).then(() => {
        this.toastr.success('Product Added!');
        this.product = {
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
        this.fileData = null;
        this.previewUrl = null;
        this.spinner.hide();
      });
    } else {
      if (this.fileData) {
        this.spinner.show();
        await this.compressImage();
        this.product.image = await this.productService.uploadFile(this.imageFileCompressed, this.fileUpload[0].name);
      }
      this.productService.updateProduct(this.product).then(() => {
        this.toastr.success('Product Updated!');
        this.router.navigate(['/inventory']);
        this.spinner.hide();
      });
    }
  }

  deleteProduct(id) {
    this.productService.removeProduct(id).then(() => {
      this.close();
      this.toastr.success('Product Deleted!');
      this.router.navigate(['/inventory']);
    });
  }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.fileUpload = <FileList>fileInput.target.files;
    this.preview();
  }

  preview() {
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

  open(content) {
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  close() {
    this.modalService.dismissAll();
  }

  async compressImage() {
    return new Promise(res => {
      console.log('before upload');
      console.log(this.fileUpload);
      const image = this.previewUrl;
      const orientation = -1;
      this.sizeOfOriginalImage = this.imageCompress.byteCount(image) / (1024 * 1024);
      console.warn('Size in bytes is now:', this.sizeOfOriginalImage);
      this.imageCompress.compressFile(image, orientation, 50, 50).then(
        result => {

          this.sizeOFCompressedImage = this.imageCompress.byteCount(result) / (1024 * 1024);
          console.warn('Size in bytes after compression:', this.sizeOFCompressedImage);
          this.imageFileCompressed = this.dataURItoBlob(result.split(',')[1]);
          res();
        });
    });
  }
}
