import { Action } from '@ngrx/store';
import { User } from 'src/app/models/user.model';

export enum UserActionTypes {
  SetUser = '[User] Set user',
  RemoveUser = '[User] Remove user'
}

export class SetUser implements Action {
  readonly type = UserActionTypes.SetUser;
  constructor(public payload: User) { }
}

export class RemoveUser implements Action {
  readonly type = UserActionTypes.RemoveUser;
  constructor() { }
}

export type UserActions = SetUser | RemoveUser;
