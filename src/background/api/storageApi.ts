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

import * as storage from 'electron-json-storage';

export async function storageGet(key: string) {
  return new Promise<any>((resolve, reject) => {
    storage.get('cyano', (error, result) => {
      if (error !== undefined) {
        reject(error);
      }

      const data = (result as any)[key];
      resolve(data !== undefined ? data : null);
    });
  });
}

export async function storageSet(key: string, value: string) {
  return new Promise<any>((resolve, reject) => {
    storage.get('cyano', (error, result) => {
      if (error !== undefined) {
        reject(error);
      }

      (result as any)[key] = value;

      storage.set('cyano', result, (error2) => {
        if (error2 !== undefined) {
          reject(error2);
        }

        resolve();
      });
    });
  });
}

export async function storageClear(key: string) {
  return new Promise<any>((resolve, reject) => {
    storage.set('cyano', {}, (error) => {
      if (error !== undefined) {
        reject(error);
      }

      resolve();
    });
  });
}
