import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  ActionReducer,
  MetaReducer
} from '@ngrx/store';
import { storageSync } from '@larscom/ngrx-store-storagesync';
import * as fromUser from './user/user.reducer';
import { User } from './user/user.model';


export interface RootState {
  user: User;
}

export const reducers: ActionReducerMap<RootState> = {
  user: fromUser.reducer,
};

export function storageSyncReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return storageSync<RootState>({
    features: [{ stateKey: 'user' }],
    storage: window.localStorage
  })(reducer);
}

export const metaReducers: Array<MetaReducer<any, any>> = [storageSyncReducer];

// Users
export const selectUserState = createFeatureSelector<User>('user');

export const selectUser = createSelector(
  selectUserState,
  state => state
);

export const selectEmail = createSelector(
  selectUser,
  user => user.email
);

export const selectName = createSelector(
  selectUser,
  user => user.name
);

export const selectProfilePic = createSelector(
  selectUser,
  user => user.image
);

export const selectStatus = createSelector(
  selectUser,
  user => user.status
);

export const selectType = createSelector(
  selectUser,
  user => user.type
);
