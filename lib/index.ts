#!/usr/bin/env node

import meow from 'meow';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { generator } from './generator';

const cli = meow({
  help: `
  Usage
    ng-alain-plugin-theme
  Example
    ng-alain-plugin-theme -c=ng-alain.json
  Options
    -c, --config  A filepath of NG-ALAIN config script
  `,
  flags: {
    config: {
      type: 'string',
      default: 'ng-alain.json',
      alias: 'c',
    },
  },
});

let config: { theme: any };

try {
  const configFile = resolve(process.cwd(), cli.flags.config);
  if (existsSync(configFile)) {
    config = require(configFile);
  } else {
    console.error(`The config file '${cli.flags.config}' will not found`);
    process.exit(1);
  }
} catch (err) {
  console.error('Invalid config file', err);
  process.exit(1);
}

generator(config.theme || {});
