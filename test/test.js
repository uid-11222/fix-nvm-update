'use strict'; /* global describe, it  */
describe('fix-nvm-update', function() {

const fs = require('fs'),
      exec = require('child_process').execSync,
      inspect = require('util').inspect,
      path = require('path'),
      fixNvmUpdate = require('../src/fix-nvm-update');

const CONFIG = path.join(__dirname, `..`, `config.json`),
      TMP = path.join(__dirname, `TMP`),
      SELF = `fix-nvm-update`,
      MAIN = `src/${SELF}.js`;

const OPTIONS = { encoding: `utf8` };

const libA = path.join(TMP, `A`, `lib`, `node_modules`),
      libB = path.join(TMP, `B`, `lib`, `node_modules`),
      binA = path.join(TMP, `A`, `bin`),
      binB = path.join(TMP, `B`, `bin`),
      npmA = path.join(libA, `npm`),
      npmB = path.join(libB, `npm`),
      nodeA = path.join(libA, `node`),
      nodeB = path.join(libB, `node`),
      bnpmA = path.join(binA, `npm`),
      bnpmB = path.join(binB, `npm`);



/**
 * Throw error, if value is not true.
 * @param  {*} value
 * @param  {string} msg
 * @throws {Error}
 */
const assert = (value, msg) => {
  if (value !== true) throw Error('Assert ' + (msg || ''));
};

/**
 * Sync reading JSON from file.
 * @param  {string} name Filename.
 * @return {?Object} Parse JSON value (null if no such file).
 */
const readJSON = name => {
  try {
    return JSON.parse(fs.readFileSync(name, 'utf8'));
  } catch(e) { return null; }
};


try {
  fs.accessSync(TMP);
} catch(e) {

  console.log(`Cannot find TMP dir ("${TMP}"), so create new one.`);

  fs.mkdirSync(TMP);



}

describe('API', function() {

  it('exists', function() {

    assert(typeof fixNvmUpdate === 'function');

  });

  it('works with array of string args', function() {

    fixNvmUpdate([`foo`, `bar`]);

  });

  it('throw without args array', function() {

    try {
      npmStatistic();
    } catch(e) {
      return;
    }

    assert(false);

  });

  it('throw with string arg', function() {

    try {
      npmStatistic(`string`);
    } catch(e) {
      return;
    }

    assert(false);

  });

  it(`get error with unknown command`, function() {

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.error = str => {
        assert(str.includes(NOT_A_COMMAND));
        assert(str.includes(`Unknown`));
        ++called;
      };

      console.log = () => assert(false);

      npmStatistic([NOT_A_COMMAND]);
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

});

});