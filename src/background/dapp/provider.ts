import { Provider, ProviderApi } from 'ontology-dapi-desktop';
import { version, displayName } from '../../utils/info';

export const providerApi: ProviderApi = {
  getProvider(): Promise<Provider> {
    return Promise.resolve({
      compatibility: ['OEP-6', 'OEP-4'],
      name: displayName,
      version,
    });
  },
};
