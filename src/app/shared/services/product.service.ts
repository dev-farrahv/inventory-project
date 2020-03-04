import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id?: string;
  name: string;
  serialNumber: string;
  qty: string;
  color: string;
  price: string;
  currency: string;
  remarks: string;
  otherDescription: string;
  itemCode: string;
  image: string;
  weight: string;
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private productsCollection: AngularFirestoreCollection<Product>;
 
  private products: Observable<Product[]>;  

  constructor(db: AngularFirestore) {
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
 
  updateProduct(product: Product, id: string) {
    return this.productsCollection.doc(id).update(product);
  }
 
  addProduct(product: Product) {
    return this.productsCollection.add(product);
  }
 
  removeProduct(id) {
    return this.productsCollection.doc(id).delete();
  }
}
