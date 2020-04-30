import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.service';

export interface Reservation {
  id?: string;
  qty: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  referenceNumber: string;
  totalPrice: number;
  products: Product[];
  status?: string;
  shippingFee?: number;
  subTotal?: number;
  totalWeight?: number;
  modeOfPayment?: string;
  dateCreated?: string;
  dateUpdated?: any;
  discount?: number;
  zone?: number;
  measurement?: string;
  previousBalance?: number;
  weekId?: number;
}
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservationsCollection: AngularFirestoreCollection<Reservation>;

  private reservations: Observable<Reservation[]>;

  constructor(private db: AngularFirestore) {
    this.reservationsCollection = db.collection<Reservation>('reservations');

    this.reservations = this.reservationsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getreservations() {
    return this.reservations;
  }

  getReservation(id) {
    return this.reservationsCollection.doc<Reservation>(id).valueChanges();
  }

  getReservationByWeekId(weekId) {
    return this.db.collection<Reservation>('reservations', ref => ref.where('status', '==', 'Completed').where('weekId', '==', weekId)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getReservationByRN(rn) {
    return this.db.collection<Reservation>('reservations', ref => ref.where('referenceNumber', '==', rn)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getReservationByStatus(status) {
    return this.db.collection<Reservation>('reservations',
      ref => ref.where('status', '==', status)).snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  getReservationByWeek(from, to) {
    return this.db.collection<Reservation>('reservations',
      ref => ref
        .where('status', '==', 'Completed')
        .where('dateUpdated', '>', from).where('dateUpdated', '<', to)).snapshotChanges().pipe(
          map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data();
              const id = a.payload.doc.id;
              return { id, ...data };
            });
          })
        );
  }

  updateReservation(reservation: Reservation) {
    return this.reservationsCollection.doc(reservation.id).update(reservation);
  }

  addReservation(reservation: Reservation) {
    return this.reservationsCollection.add(reservation);
  }

  removeReservation(id) {
    return this.reservationsCollection.doc(id).delete();
  }

}
