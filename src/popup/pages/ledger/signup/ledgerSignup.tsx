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
import { timeout } from 'promise-timeout';
import * as React from 'react';
import { RouterProps } from 'react-router';
import { getBackgroundManager } from '../../../backgroundManager';
import { lifecycle, withProps, withState } from '../../../compose';
import { LedgerSignupView, Props } from './ledgerSignupView';

interface State {
  supported: boolean;
  timer?: NodeJS.Timer;
}

const defaultState = {
  supported: false,
  timer: undefined,
};

const enhancer = (Component: React.ComponentType<Props>) => (props: RouterProps) =>
  withState<State>(defaultState, (state, setState, getState) =>
    lifecycle(
      {
        componentDidMount: async () => {
          async function checkStatus() {
            try {
              const supported = await timeout(getBackgroundManager().isLedgerSupported(), 2000);
              setState({ ...getState(), supported });
            } catch (e) {
              setState({ ...getState(), supported: false });
            }
          }

          const timer = setInterval(checkStatus, 3000);
          setState({ ...state, timer });

          await checkStatus();
        },

        componentWillUnmount: () => {
          const timer = getState().timer;

          if (timer !== undefined) {
            clearInterval();
          }
        },
      },
      () =>
        withProps(
          {
            handleCancel: () => {
              props.history.goBack();
            },
            handleCreate: () => {
              props.history.push('/ledger/create');
            },
            handleImport: () => {
              props.history.push('/ledger/import');
            },
          },
          (injectedProps) => <Component {...injectedProps} supported={state.supported} />,
        ),
    ),
  );

export const LedgerSignup = enhancer(LedgerSignupView);
