import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfitService {
  private weeksCollection: AngularFirestoreCollection<any>;

  private weeks: Observable<any[]>;

  constructor(private db: AngularFirestore) {
    this.weeksCollection = this.db.collection<any>('weeks');

    this.weeks = this.weeksCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getWeeks() {
    return this.weeks;
  }

  getWeekById(id) {
    return this.weeksCollection.doc<any>(id).valueChanges();
  }

  updateWeek(week: any) {
    return this.weeksCollection.doc(week.id).update(week);
  }

  addWeek(week: any) {
    return this.weeksCollection.add(week);
  }

  removeWeek(id) {
    return this.weeksCollection.doc(id).delete();
  }
}
