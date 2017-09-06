import * as fs from 'fs';
import mem = require('mem');

export const fileExists = mem(
  (filePath: string): Promise<boolean> =>
    new Promise((resolve, reject) => {
      fs.stat(filePath, (err, value) => {
        if (err) {
          resolve(false);
          return;
        }
        resolve(value.isFile());
      });
    })
);

export const fileExistsSync = mem((filePath: string) => {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (err) {
    return false;
  }
});
