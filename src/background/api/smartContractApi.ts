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
import { Crypto, TransactionBuilder, utils } from 'ontology-ts-sdk';
import { buildInvokePayload } from 'ontology-ts-test';
import { decryptAccount } from '../../api/accountApi';
import { getWallet } from '../../api/authApi';
import { ScCallReadRequest, ScCallRequest, ScDeployRequest } from '../../redux/transactionRequests';
import { getClient } from '../network';
import { getStore } from '../redux';

import Address = Crypto.Address;

export async function scCall(request: ScCallRequest, password: string) {
  request.parameters = request.parameters !== undefined ? request.parameters : [];
  request.gasPrice = request.gasPrice !== undefined ? request.gasPrice : 500;
  request.gasLimit = request.gasLimit !== undefined ? request.gasLimit : 30000;

  const state = getStore().getState();
  const wallet = getWallet(state.wallet.wallet!);

  const account = wallet.accounts[0].address;
  const privateKey = decryptAccount(wallet, password);

  // convert params
  const params = convertParams(request.parameters);
  const payload = buildInvokePayload(request.contract, request.method, params);

  const tx = TransactionBuilder.makeInvokeTransaction(
    request.method,
    [],
    new Address(utils.reverseHex(request.contract)),
    String(request.gasPrice),
    String(request.gasLimit),
    account,
  );

  (tx.payload as any).code = payload.toString('hex');

  await TransactionBuilder.signTransactionAsync(tx, privateKey);

  const client = getClient();
  return await client.sendRawTransaction(tx.serialize(), false, true);
}

export async function scCallRead(request: ScCallReadRequest) {
  request.parameters = request.parameters !== undefined ? request.parameters : [];

  // convert params
  const params = convertParams(request.parameters);
  const payload = buildInvokePayload(request.contract, request.method, params);

  const tx = TransactionBuilder.makeInvokeTransaction(
    request.method,
    [],
    new Address(utils.reverseHex(request.contract)),
  );

  (tx.payload as any).code = payload.toString('hex');

  const client = getClient();
  return await client.sendRawTransaction(tx.serialize(), true, false);
}

export async function scDeploy(request: ScDeployRequest, password: string) {
  request.gasPrice = request.gasPrice !== undefined ? request.gasPrice : 500;
  request.gasLimit = request.gasLimit !== undefined ? request.gasLimit : 30000;

  const state = getStore().getState();
  const wallet = getWallet(state.wallet.wallet!);

  const account = wallet.accounts[0].address;
  const privateKey = decryptAccount(wallet, password);

  const tx = TransactionBuilder.makeDeployCodeTransaction(
    request.code,
    request.name,
    request.version,
    request.author,
    request.email,
    request.description,
    request.needStorage,
    String(request.gasPrice),
    String(request.gasLimit),
    account,
  );

  await TransactionBuilder.signTransactionAsync(tx, privateKey);

  const client = getClient();
  return await client.sendRawTransaction(tx.serialize(), false, true);
}


function convertParams(parameters?: any[]): any[] {
  if (parameters === undefined) {
    return [];
  }

  return parameters.map(p => {
    if (p.type === 'Boolean') {
      return p.value === true || p.value === 'true';
    } else if (p.type === 'Integer') {
      return Number(p.value);
    } else if (p.type === 'ByteArray') {
      return new Buffer(p.value, 'hex');
    } else if (p.type === 'String') {
      return p.value;
    } else if (p.type === 'Array') {
      return convertParams(p.value);
    } else {
      // send as is, so underlying library can process it
      return p.value;
    }
  })
}
