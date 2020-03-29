import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface ShippingFee {
  id?: string;
  min: number;
  max: number;
  shippingFee?: number;
  amount: number;
  zone: number;
  continent: [];
}

@Injectable({
  providedIn: 'root'
})
export class ShippingFeeService {
  private shippingFeeCollection: AngularFirestoreCollection<ShippingFee>;

  private shippingFee: Observable<ShippingFee[]>;

  constructor(db: AngularFirestore) {

    this.shippingFeeCollection = db.collection<ShippingFee>('shippingFees');

    this.shippingFee = this.shippingFeeCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );


  }

  addShippingFee(shippingFee: ShippingFee) {
    return this.shippingFeeCollection.add(shippingFee);
  }

  updateShippingFee(shippingFee: ShippingFee) {
    return this.shippingFeeCollection.doc(shippingFee.id).update(shippingFee);
  }

  getShippingFees() {
    return this.shippingFee;
  }

}
