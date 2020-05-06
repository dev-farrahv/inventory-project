import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map, tap, finalize } from 'rxjs/operators';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';


export interface Product {
  id?: string;
  name: string;
  serialNumber: string;
  qty: number;
  color: string;
  purchasePrice: number;
  sellingPrice: number;
  currency: string;
  remarks: string;
  description?: string;
  itemCode: string;
  image: string;
  weight: number;
  isSelected?: boolean;
  status?: number;
  rn?: string;
  dateCreated?: Date;
  dateUpdated?: Date;
  biddingCode?: string;
  discount?: number;
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  private productsCollection: AngularFirestoreCollection<Product>;

  private products: Observable<Product[]>;

  // Upload Task 
  task: AngularFireUploadTask;

  // Progress in percentage
  percentage: Observable<number>;

  // Snapshot of uploading file
  snapshot: Observable<any>;

  // Uploaded File URL
  UploadedFileURL: Observable<string>;

  //Uploaded Image List
  images: Observable<any[]>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage, private database: AngularFirestore) {
    this.productsCollection = db.collection<Product>('products');

    this.products = this.productsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getproducts() {
    return this.products;
  }

  getProduct(id) {
    return this.productsCollection.doc<Product>(id).valueChanges();
  }

  getAvailableProducts() {
    return this.db.collection<Product>('products', ref => ref.where('status', '<', 4)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  updateProduct(product: Product) {
    return this.productsCollection.doc(product.id).update(product);
  }

  addProduct(product: Product) {
    return this.productsCollection.add(product);
  }

  removeProduct(id) {
    return this.productsCollection.doc(id).delete();
  }

  uploadFile(file: any, filename: string) {

    return new Promise<string>((res, reject) => {
      const path = `compressed/image${new Date().getTime()}_${filename}`;
      const customMetadata = { app: '2nd Image Upload Demo' };
      const fileRef = this.storage.ref(path);
      this.storage.upload(path, file, { customMetadata }).then(async result => {
        const url = await result.ref.getDownloadURL();
        res(url);
      });
    });
  }


}
