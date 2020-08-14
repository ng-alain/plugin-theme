#!/usr/bin/env node

import meow from 'meow';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { buildThemeCSS } from './theme-css';
import { genColorLess } from './color-less';

const cli = meow({
  help: `
  Usage
    ng-alain-plugin-theme
  Example
    ng-alain-plugin-theme -t=themeCss -c=ng-alain.json
  Options
    -t, --type    Can be set 'themeCss', 'colorLess'
    -c, --config  A filepath of NG-ALAIN config script
  `,
  flags: {
    type: {
      type: 'string',
      default: 'themeCss',
      alias: 't',
    },
    config: {
      type: 'string',
      default: 'ng-alain.json',
      alias: 'c',
    },
  },
});

let config: { theme: any; colorLess: any };

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

if (cli.flags.type === 'themeCss') {
  buildThemeCSS(config.theme || {});
} else if (cli.flags.type === 'colorLess') {
  genColorLess(config.colorLess || {});
} else {
  throw new Error(`Invalid type, can be set themeCss or colorLess value`);
}
