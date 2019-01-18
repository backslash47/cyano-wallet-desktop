/*
 * Copyright (C) 2018 Matus Zamborsky
 * This file is part of The Ontology Wallet&ID.
 *
 * The The Ontology Wallet&ID is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Ontology Wallet&ID is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The Ontology Wallet&ID.  If not, see <http://www.gnu.org/licenses/>.
 */
import { electronEnhancer } from 'redux-electron-store';
import { createStore, combineReducers } from 'redux';
import { GlobalStore } from '../redux/state';
import { loaderReducer } from '../background/redux/loaderReducer';
import { routerReducer } from '../background/redux/routerReducer';
import { runtimeReducer } from '../background/redux/runtimeReducer';
import { settingsReducer } from '../background/redux/settingsReducer';
import { statusReducer } from '../background/redux/statusReducer';
import { transactionRequestsReducer } from '../background/redux/transactionRequestsReducer';
import { walletReducer } from '../background/redux/walletReducer';

export { GlobalState } from '../redux/state';
export { default as Actions } from '../redux/actions';

export const globalReducer = combineReducers({
  loader: loaderReducer,
  router: routerReducer,
  runtime: runtimeReducer,
  settings: settingsReducer,
  status: statusReducer,
  transactionRequests: transactionRequestsReducer,
  wallet: walletReducer,
});

let store: GlobalStore;

export function initStore(): GlobalStore {
  store = createStore(globalReducer, electronEnhancer({ dispatchProxy: (a: any) => store.dispatch(a) }));

  return store;
}

export function getStore() {
  return store;
}
