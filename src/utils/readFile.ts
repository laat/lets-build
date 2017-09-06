import * as fs from 'fs';
import mem = require('mem');
import stripBom = require('strip-bom');

export const readFile = mem(
  (filePath: string): Promise<string> =>
    new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stripBom(data));
      });
    })
);

export const readFileSync = mem((filePath: string) =>
  stripBom(fs.readFileSync(filePath, 'utf8'))
);
