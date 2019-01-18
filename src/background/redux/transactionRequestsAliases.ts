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
import { Identity } from 'ontology-ts-sdk';
import { timeout, TimeoutError } from 'promise-timeout';
import { Dispatch } from 'redux';
import { getWallet } from '../../api/authApi';
import Actions from '../../redux/actions';
import { GlobalState } from '../../redux/state';
import {
  MessageSignRequest,
  RegisterOntIdRequest,
  ScCallReadRequest,
  ScCallRequest,
  ScDeployRequest,
  SwapRequest,
  TransferRequest,
  WithdrawOngRequest,
} from '../../redux/transactionRequests';
import { messageSign } from '../api/messageApi';
import { swapNep } from '../api/neoApi';
import { registerOntId, transfer, withdrawOng } from '../api/runtimeApi';
import { scCall, scCallRead, scDeploy } from '../api/smartContractApi';
import { transferToken } from '../api/tokenApi';
import { getStore } from './index';

export async function submitRequest(requestId: string, password?: string) {
  const store = getStore();

  const state = store.getState();
  const requests = state.transactionRequests.requests;
  const request = requests.find((r) => r.id === requestId);

  if (request === undefined) {
    throw new Error('Request already submited');
  }

  let result: any;
  try {
    switch (request.type) {
      case 'transfer':
        result = await submitTransfer(request as TransferRequest, password!);
        break;
      case 'withdraw_ong':
        result = await submitWithdrawOng(request as WithdrawOngRequest, password!);
        break;
      case 'swap':
        result = await submitSwap(request as SwapRequest, password!);
        break;
      case 'register_ont_id':
        result = await submitRegisterOntId(request as RegisterOntIdRequest, password!, store.dispatch, state);
        break;
      case 'sc_call':
        result = await submitScCall(request as ScCallRequest, password!);
        break;
      case 'sc_call_read':
        result = await submitScCallRead(request as ScCallReadRequest);
        break;
      case 'sc_deploy':
        result = await submitScDeploy(request as ScDeployRequest, password!);
        break;
      case 'message_sign':
        result = await submitMessageSign(request as MessageSignRequest, password!);
        break;
    }

    // resolves request
    store.dispatch(Actions.transactionRequests.resolveRequest(requestId, undefined, result));
  } catch (e) {
    if (e instanceof TimeoutError) {
      // resolves request
      store.dispatch(Actions.transactionRequests.resolveRequest(requestId, 'TIMEOUT'));
    } else {
      let msg: string;

      if (e instanceof Error) {
        msg = e.message;
      } else {
        msg = e;
      }
      // resolves request
      store.dispatch(Actions.transactionRequests.resolveRequest(requestId, 'OTHER', msg));
      // tslint:disable-next-line:no-console
      console.error('Error during submiting transaction', e);
    }
  }
}

async function submitTransfer(request: TransferRequest, password: string) {
  let response: any;

  if (request.asset === 'ONT' || request.asset === 'ONG') {
    response = await timeout(transfer(request, password), 15000);
  } else {
    response = await timeout(transferToken(request, password), 15000);
  }

  if (response.Result.State === 0) {
    throw new Error('OTHER');
  }

  return response.Result.TxHash;
}

function submitWithdrawOng(request: WithdrawOngRequest, password: string) {
  return timeout(withdrawOng(request, password), 15000);
}

function submitSwap(request: SwapRequest, password: string) {
  return timeout(swapNep(request, password), 15000);
}

async function submitRegisterOntId(
  request: RegisterOntIdRequest,
  password: string,
  dispatch: Dispatch,
  state: GlobalState,
) {
  await timeout(registerOntId(request, password), 15000);

  // stores identity in wallet
  const identity = Identity.parseJson(request.identity);
  const wallet = getWallet(state.wallet.wallet!);
  wallet.addIdentity(identity);
  wallet.setDefaultIdentity(identity.ontid);

  await dispatch(Actions.wallet.setWallet(wallet.toJson()));
}

async function submitScCall(request: ScCallRequest, password: string) {
  const response = await timeout(scCall(request, password), 15000);

  if (response.Result.State === 0) {
    throw new Error('OTHER');
  }

  const notify = response.Result.Notify.filter((element: any) => element.ContractAddress === request.contract).map(
    (element: any) => element.States,
  );
  return {
    result: notify,
    transaction: response.Result.TxHash,
  };
}

async function submitMessageSign(request: MessageSignRequest, password: string) {
  return timeout(messageSign(request, password), 15000);
}

async function submitScCallRead(request: ScCallReadRequest) {
  const response = await timeout(scCallRead(request), 15000);

  if (response.Result.State === 0) {
    throw new Error('OTHER');
  }

  return response.Result.Result;
}

function submitScDeploy(request: ScDeployRequest, password: string) {
  return timeout(scDeploy(request, password), 15000);
}
