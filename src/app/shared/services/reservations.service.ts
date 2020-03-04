import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Reservation {
  id?: string;
  qty: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
}
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private reservationsCollection: AngularFirestoreCollection<Reservation>;
 
  private reservations: Observable<Reservation[]>;  

  constructor(db: AngularFirestore) {
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
 
  updateReservation(reservation: Reservation, id: string) {
    return this.reservationsCollection.doc(id).update(reservation);
  }
 
  addReservation(reservation: Reservation) {
    return this.reservationsCollection.add(reservation);
  }
 
  removeReservation(id) {
    return this.reservationsCollection.doc(id).delete();
  }

}
