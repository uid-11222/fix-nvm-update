#!/usr/bin/env node

'use strict'; /* globals process */

const fs = require('fs'),
      path = require('path'),
      exec = require('child_process').execSync;

const SELF = `fix-nvm-update`,
      TMP = `__TMP_NODE`,
      MV = `mv -v`;

const OPTIONS = { encoding: `utf8` };

const DEFAULT_NODES = path.join(`~`, `.nvm`, `versions`, `node`),
      CONFIG = path.join(__dirname, `..`, `config.json`),
      PACKAGE = path.join(__dirname, `..`, `package.json`);

/**
 * Move global package from old Node.js version to new.
 * @param  {string[]} args List of string arguments.
 * @return {boolean} false, if some unexpected happened.
 */
const fixNvmUpdate = module.exports = args => {

  const to = String(args[0] || ``);

  if (args.length !== 1 || !to || to === `--help`) {
    console.log(
      `usage: ${SELF} <new-version>` +
      `${SELF} version ${readJSON(PACKAGE).version}`
    );
    return true;
  }

  if (!/^[a-z0-9-.]+$/i.test(to)) {
    console.error(`Wrong new Node version format ("${to}").`);
    return false;
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

  if (from === to) {
    console.log(`"${to}" is not a new version.`);
    return true;
  }

  if (!from || typeof from !== `string`) {
    console.error(`Wrong config.last format (in "${CONFIG}"): "${from}".`);
    return false;
  }

  const tmp = path.join(nodes, TMP);

  try {
    fs.accessSync(tmp);
    console.error(`TMP directory already exists ("${tmp}").`);
    return false;
  } catch (e) {}

  console.log(`Create TMP directory ("${tmp}").`);
  fs.mkdirSync(tmp);

  const tmpAll  = path.join(tmp, `*`),
        tmpNpm  = path.join(tmp, `npm`),
        tmpNode = path.join(tmp, `node`),

        fromLib = path.join(nodes, from, `lib`, `node_modules`),
          toLib = path.join(nodes,   to, `lib`, `node_modules`),
         libAll = path.join(fromLib, `*`),

        fromBin = path.join(nodes, from, `bin`),
          toBin = path.join(nodes,   to, `bin`),
         binAll = path.join(fromBin, `*`);

  const commands = [

    [MV, libAll, tmp],
    [MV, tmpNpm, fromLib],
    [MV, tmpAll, toLib],

    [MV, binAll, tmp],
    [MV, tmpNpm, tmpNode, fromBin],
    [MV, tmpAll, toBin]

  ];

  for (const command of commands) {

    const run = command.join(` `);

    console.log(`Exec "${run}".`);
    exec(run, OPTIONS);
  }

  config.last = to;
  console.log(`Write version "${to}" to config as last installed.`);
  writeJSON(CONFIG, config);

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