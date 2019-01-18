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
import { TokenAmountState } from '../redux/runtime';
import { getAddress } from '../api/accountApi';
import Actions from '../redux/actions';
import { GlobalStore } from '../redux/state';
import { getTransferList } from './api/explorerApi';
import { getBalance, getUnboundOng } from './api/runtimeApi';
import { getTokenBalanceOwn } from './api/tokenApi';

export function initBalanceProvider(store: GlobalStore) {
  setInterval(async () => {
    const state = store.getState();
    const walletEncoded = state.wallet.wallet;
    const tokens = state.settings.tokens;

    if (walletEncoded !== null) {
      let balanceOng = 0;
      let balanceOnt = 0;
      let unboundOng = 0;
      const nepBalance = 0;
      const tokenBalances: TokenAmountState[] = [];

      try {
        const balance = await getBalance();
        unboundOng = await getUnboundOng();

        balanceOng = balance.ong;
        balanceOnt = balance.ont;
      } catch (e) {
        console.warn('Failed to retrieve ONT/ONG balances.');
      }

      for (const token of tokens) {
        try {
          const amount = await getTokenBalanceOwn(token.contract);
          tokenBalances.push({ contract: token.contract, amount });
        } catch (e) {
          // tslint:disable-next-line:no-console
          console.warn('Failed to load balance of token: ', token.contract);
        }
      }

      store.dispatch(Actions.runtime.setBalance(balanceOng, balanceOnt, unboundOng, nepBalance, tokenBalances));

      const address = getAddress(walletEncoded);

      const transfers = await getTransferList(address);

      store.dispatch(Actions.runtime.setTransfers(transfers));
    }
  }, 15000);
}
