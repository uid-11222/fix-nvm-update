#!/usr/bin/env node

'use strict'; /* globals process */

const fs = require('fs'),
      path = require('path'),
      execFile = require('child_process').execFile;

const DEFAULT_NODES = `~/.nvm/versions/node`;

const CONFIG = path.join(__dirname, `..`, `config.json`);

/**
 * Move global package from old Node.js version to new.
 * @param  {string[]} args List of string arguments.
 * @return {boolean} false, if some unexpected happened.
 */
const fixNvmUpdate = args => {

  const to = String(args[0] || ``);

  if (args.length !== 1 || !to || to === `--help`) {
    console.log(`usage: fix-nvm-update <new-version>`);
    return true;
  }

  try {
    fs.accessSync(CONFIG);
  } catch(e) {
    console.log(`Cannot find config ("${CONFIG}"). Create new config file.`);
    writeJSON(CONFIG, {});
  }

  const config = readJSON(CONFIG);

  if (!(config instanceof Object)) {
    console.error(`Wrong config format (in "${CONFIG}").`);
    return false;
  }

  if (!hasOwn.call(config), `nodes`) {
    config.nodes = DEFAULT_NODES;
    writeJSON(CONFIG, config);
  }

  const nodes = config.nodes;

  if (!nodes || typeof nodes !== `string`) {
    console.error(`Wrong config.nodes format (in "${CONFIG}"): "${nodes}".`);
    return false;
  }

  if (!hasOwn.call(config, `last`)) {
    config.last = to;
    console.log(`No last field in "${CONFIG}", so write "${to}" as last.`);
    writeJSON(CONFIG, config);
    return true;
  }

  const from = config.last;

  if (!from || typeof from !== `string`) {
    console.error(`Wrong config.last format (in "${CONFIG}"): "${from}".`);
    return false;
  }



};

const hasOwn = ({}).hasOwnProperty;

/**
 * Sync reading JSON from filesystem.
 * @param  {string}  name Filename.
 * @return {?Object} Parse JSON value (null if no such file).
 */
const readJSON = name => {
  try {
    return JSON.parse(fs.readFileSync(name, 'utf8'));
  } catch(e) { return null; }
};

/**
 * Sync writing JSON to file.
 * @param {string} name Filename.
 * @param {?Object} data JSON value.
 */
const writeJSON = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

/**
 * If called from command line, execute with it args.
 */
if (require.main && require.main.id === module.id) {
  fixNvmUpdate(process.argv.slice(2));
}