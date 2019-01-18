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
import 'babel-polyfill';

import { app } from 'electron';
import * as Ledger from '@ont-community/ontology-ts-sdk-ledger';
// import * as Trezor from '@ont-community/ontology-ts-sdk-trezor';
import { Crypto } from 'ontology-ts-sdk';
import { initBalanceProvider } from './background/balanceProvider';
import { initNetwork } from './background/network';
import { initSettingsProvider } from './background/persist/settingsProvider';
import { initWalletProvider } from './background/persist/walletProvider';
import { initPopupManager, PopupManager } from './background/popUpManager';
import { initStore } from './background/redux';
import { initRequestsManager } from './background/requestsManager';
import { initDApiProvider } from './background/dapp';

let popupManager: PopupManager;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const store = initStore();
  popupManager = initPopupManager(store);

  initNetwork(store);
  initBalanceProvider(store);
  initSettingsProvider(store);
  initWalletProvider(store);
  initRequestsManager(store, popupManager);
  initDApiProvider();

  Crypto.registerKeyDeserializer(new Ledger.LedgerKeyDeserializer());
  // Crypto.registerKeyDeserializer(new Trezor.TrezorKeyDeserializer());
  Ledger.setLedgerTransport(new Ledger.LedgerTransportNode());

  await popupManager.show();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (popupManager !== undefined) {
    popupManager.show();
  }
});
