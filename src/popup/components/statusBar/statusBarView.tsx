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
import * as path from 'path';
import * as React from 'react';
import { NetworkState } from '../../../redux/status';
import { Filler, View } from '../view';

export interface Props {
  netName: string;
  status: NetworkState;
}

export const StatusBarView: React.SFC<Props> = (props) => (
  <View className="statusBar gradient">
    <View>{props.netName}</View>
    <Filler />
    {props.status === 'CONNECTED' ? (
      <img
        title="Connected"
        className="icon"
        height="18"
        src={path.join(__dirname, '..', '..', '..', '..', 'assets/connectedIcon.svg')}
      />
    ) : (
      <img
        title="Disconnected"
        className="icon"
        height="18"
        src={path.join(__dirname, '..', '..', '..', '..', 'assets/disconnectedIcon.svg')}
      />
    )}
  </View>
);
