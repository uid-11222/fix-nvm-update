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

const f1 = `file1`, f2 = `file2`, b1 = `bin1`, b2 = `bin2`;

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

const files = [npmA, npmB, nodeA, nodeB, bnpmA, bnpmB,
    path.join(libA, f1), path.join(libA, f2),
    path.join(binA, b1), path.join(binA, b2)
  ];

let config, NODES;

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

/**
 * Sync writing JSON to file.
 * @param {string}  name Filename.
 * @param {?Object} data JSON value.
 */
const writeJSON = (name, data) => {
  fs.writeFileSync(name, JSON.stringify(data));
};

/**
 * Get relative path from TMP to pth
 * @param  {string} pth
 * @return {string}
 */
const getRelative = pth => path.relative(TMP, pth);

try {
  fs.accessSync(TMP);
} catch(e) {

  console.log(`Cannot find TMP dir ("${TMP}"), so create new one.`);

  fs.mkdirSync(TMP);

  fs.mkdirSync(path.join(TMP, `A`));
  fs.mkdirSync(path.join(TMP, `B`));
  fs.mkdirSync(path.join(TMP, `A`, `lib`));
  fs.mkdirSync(path.join(TMP, `B`, `lib`));
  fs.mkdirSync(libA);
  fs.mkdirSync(libB);
  fs.mkdirSync(binA);
  fs.mkdirSync(binB);

  for (const file of files) {
    fs.writeFileSync(file, getRelative(file));
  }

}

describe('simple API', function() {

  it('exists', function() {

    assert(typeof fixNvmUpdate === 'function');

  });

  it('works with array of string args', function() {

    fixNvmUpdate([`foo`, `bar`]);

  });

  it('throw without args array', function() {

    try {
      fixNvmUpdate();
    } catch(e) {
      return;
    }

    assert(false);

  });

  it('return true with array of string args', function() {

    assert(fixNvmUpdate([`foo`, `bar`]));

  });

  it('return true with one arg', function() {

    assert(fixNvmUpdate([`foo`]));

  });

  it('has config', function() {

    config = readJSON(CONFIG);
    NODES = config.nodes;

    assert(NODES && typeof NODES === 'string');

    config.nodes = TMP;
    writeJSON(CONFIG, config);

  });

});

describe('API', function() {

  it('return false with incorrect Node version', function() {

    assert(fixNvmUpdate([` v7.0.0`]) === false);

  });

  it(`show usage with option "--help"`, function() {

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.log = str => {
        assert(str.includes(`usage`));
        assert(str.includes(SELF));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([`--help`]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

  it(`show usage with empty arg`, function() {

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.log = str => {
        assert(str.includes(`usage`));
        assert(str.includes(SELF));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([``]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

  it(`show usage with extra args`, function() {

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.log = str => {
        assert(str.includes(`usage`));
        assert(str.includes(SELF));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([`foo`, `bar`]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

  it(`show message about the same version`, function() {

    assert(fixNvmUpdate([`foo`]));

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.log = str => {
        assert(str.includes(`foo`));
        assert(str.includes(`not`));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([`foo`]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

    config.nodes = NODES;
    writeJSON(CONFIG, config);

  });

});


});