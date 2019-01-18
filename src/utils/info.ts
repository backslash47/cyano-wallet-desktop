import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..', '..');
const contents = fs.readFileSync(root + '/package.json');

let version: string;
let displayName: string;

if (contents) {
  const pjson = JSON.parse(contents.toString());
  version = pjson.version;
  displayName = pjson.displayName;
} else {
  version = 'undefined';
  displayName = 'undefined';
}

export { version, displayName };
