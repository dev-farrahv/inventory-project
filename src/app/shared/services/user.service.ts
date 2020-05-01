import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userCollection: AngularFirestoreCollection<any>;
  private user: Observable<any[]>;

  constructor(private db: AngularFirestore) {
    this.userCollection = db.collection<any>('users');
    this.user = this.userCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  getuser() {
    return this.user;
  }

  getUser(uid) {
    return this.userCollection.doc<any>(uid).valueChanges();
  }

  updateUser(user: any) {
    user.updatedAt = new Date().toString();
    return this.userCollection.doc(user.id).update(user);
  }

  addUser(user: any) {
    return this.userCollection.doc(user.id).set(user);
  }

  removeUser(id) {
    return this.userCollection.doc(id).delete();
  }
}
