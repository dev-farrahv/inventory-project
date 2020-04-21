import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfitService {
  private sharerCollection: AngularFirestoreCollection<any>;

  private sharer: Observable<any[]>;

  constructor(private db: AngularFirestore) {
    this.sharerCollection = this.db.collection<any>('sharer');

    this.sharer = this.sharerCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getsharer() {
    return this.sharer;
  }

  getSharerById(id) {
    return this.sharerCollection.doc<any>(id).valueChanges();
  }

  updateSharer(sharer: any) {
    return this.sharerCollection.doc(sharer.id).update(sharer);
  }

  addSharer(sharer: any) {
    return this.sharerCollection.add(sharer);
  }

  removeSharer(id) {
    return this.sharerCollection.doc(id).delete();
  }
}
