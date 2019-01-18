import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { client, provider } from 'ontology-dapi-desktop';
import { assetApi as asset } from './asset';
import { identityApi as identity } from './identity';
import { messageApi as message } from './message';
import { networkApi as network } from './network';
import { providerApi } from './provider';
import { smartContractApi as smartContract } from './smartContract';

let app: express.Express;

export function initDApiProvider() {
  // Create Express server
  app = express();

  // Express configuration
  app.set('port', 33879);
  // app.use(compression());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.post(
    '/',
    provider.createProviderRouter({
      provider: {
        asset,
        identity,
        message,
        network,
        provider: providerApi,
        smartContract,
        utils: client.api.utils,
      },
    }),
  );

  app.listen(app.get('port'), () => {
    console.log(`  DApi provider is running at http://127.0.0.1:${app.get('port')} in ${app.get('env')} mode`);
  });
}
