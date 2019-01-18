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

import { finishLoading, startLoading } from './loader';
import { setRouterState } from './router';
import { setBalance, setTransfers } from './runtime';
import { addToken, delToken, setSettings } from './settings';
import { changeNetworkState } from './status';
import { addRequest, resolveRequest, updateRequest } from './transactionRequests';
import { clearIdentity, clearWallet, setWallet } from './wallet';

export default {
  loader: {
    finishLoading,
    startLoading,
  },
  router: {
    setRouterState,
  },
  runtime: {
    setBalance,
    setTransfers,
  },
  settings: {
    addToken,
    delToken,
    setSettings,
  },
  status: {
    changeNetworkState,
  },
  transactionRequests: {
    addRequest,
    resolveRequest,
    updateRequest,
  },
  wallet: {
    clearIdentity,
    clearWallet,
    setWallet,
  },
};
