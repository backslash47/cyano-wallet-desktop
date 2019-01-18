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
import { ipcMain } from 'electron';
import * as path from 'path';
import { Identity } from 'ontology-ts-sdk';
import { decryptAccount } from '../api/accountApi';
import { getWallet } from '../api/authApi';
import { Deferred } from '../utils/deffered';
import { GlobalStore } from '../redux/state';
import * as Ledger from './api/ledgerApi';
import { checkOntId } from './api/runtimeApi';
import { getOEP4Token } from './api/tokenApi';
import { BrowserWindow } from 'electron';
import { Rpc, MethodType } from '../utils/rpc';
import { submitRequest } from './redux/transactionRequestsAliases';

// size of the popup
const width = 350;
const height = 452;

export class PopupManager {
  private rpc: Rpc;
  private popupId: number;

  private store: GlobalStore;

  private initialized: Deferred<void>;

  constructor(store: GlobalStore) {
    this.store = store;
    this.show = this.show.bind(this);
    this.callMethod = this.callMethod.bind(this);

    this.rpc = new Rpc({
      receiver: ipcMain,
      sender: {
        send: this.sendMessage.bind(this),
      },
      logMessages: false,
    });

    this.rpc.register('popup_initialized', this.pupupInitialized.bind(this));
    this.rpc.register('check_account_password', this.checkAccountPassword.bind(this));
    this.rpc.register('check_ont_id', this.checkOntId.bind(this));
    this.rpc.register('get_oep4_token', this.getOEP4Token.bind(this));
    this.rpc.register('is_ledger_supported', this.isLedgerSupported.bind(this));
    this.rpc.register('import_ledger_key', this.importLedgerKey.bind(this));
    this.rpc.register('submit_request', this.submitRequest.bind(this));
  }

  private sendMessage(channel: string, ...args: any[]) {
    const popup = this.findPopup();

    if (popup !== undefined) {
      popup.webContents.send(channel, ...args);
    } else {
      console.warn('Message ignored because no PopUp is shown.');
    }
  }
  public async show() {
    let popup = this.findPopup();

    if (popup !== undefined) {
      popup.focus();
    } else {
      this.initialized = new Deferred<void>();

      popup = new BrowserWindow({
        height,
        width,
        icon: path.join(__dirname, '..', '..', 'assets/icons/png/64x64.png'),
      });
      popup.loadFile(path.join(__dirname, '..', 'popup.html'));

      // Open the DevTools.
      // popup.webContents.openDevTools();

      this.popupId = popup.id;

      await this.initialized.promise;
    }
  }

  public async callMethod(method: string, ...params: any[]) {
    return this.rpc.call(method, ...params);
  }

  public registerMethod(name: string, method: MethodType) {
    this.rpc.register(name, method);
  }

  private findPopup() {
    const windows = BrowserWindow.getAllWindows();

    const ownWindows = windows.filter((w) => w.id === this.popupId);

    if (ownWindows.length > 0) {
      return ownWindows[0];
    } else {
      return undefined;
    }
  }

  private pupupInitialized() {
    if (this.initialized !== undefined) {
      this.initialized.resolve();
    }
  }
  private checkAccountPassword(password: string) {
    const encodedWallet = this.store.getState().wallet.wallet;
    if (encodedWallet === null) {
      throw new Error('NO_ACCOUNT');
    }

    try {
      const wallet = getWallet(encodedWallet);
      decryptAccount(wallet, password);

      return true;
    } catch (e) {
      return false;
    }
  }

  private checkOntId(identityEncoded: string, password: string) {
    const identity = Identity.parseJson(identityEncoded);
    return checkOntId(identity, password);
  }

  private getOEP4Token(contract: string) {
    return getOEP4Token(contract);
  }

  private isLedgerSupported() {
    return Ledger.isLedgerSupported();
  }

  private importLedgerKey(index: number, neo: boolean) {
    return Ledger.importLedgerKey(index, neo);
  }

  private submitRequest(requestId: string, password?: string) {
    return submitRequest(requestId, password);
  }
}

export function initPopupManager(store: GlobalStore) {
  return new PopupManager(store);
}
