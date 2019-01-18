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
import { Reducer } from 'redux';
import { RuntimeState, SET_BALANCE, SET_TRANSFERS } from '../../redux/runtime';

const defaultState: RuntimeState = {
  ongAmount: 0,
  ontAmount: 0,
  unboundAmount: 0,
  nepAmount: 0,
  transfers: [],
  tokenAmounts: [],
};

export const runtimeReducer: Reducer<RuntimeState> = (state = defaultState, action) => {
  const payload = action.payload;

  switch (action.type) {
    case SET_BALANCE:
      return {
        ...state,
        ongAmount: payload.ongAmount,
        ontAmount: payload.ontAmount,
        unboundAmount: payload.unboundAmount,
        nepAmount: payload.nepAmount,
        tokenAmounts: payload.tokenAmounts,
      };
    case SET_TRANSFERS:
      return { ...state, transfers: payload.transfers };
    default:
      return state;
  }
};
