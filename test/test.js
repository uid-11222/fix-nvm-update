'use strict'; /* global describe, it  */
describe('fix-nvm-update', function() {

const fs = require('fs'),
      exec = require('child_process').execSync,
      path = require('path'),
      fixNvmUpdate = require('../src/fix-nvm-update');

const CONFIG = path.join(__dirname, `..`, `config.json`),
      TMP = path.join(__dirname, `TMP`),
      SELF = `fix-nvm-update`,
      MAIN = path.join(__dirname, `..`, `src`, `${SELF}.js`);

const OPTIONS = { encoding: `utf8` };

const f1 = `file1`, f2 = `file2`, b1 = `bin1`, b2 = `bin2`;

const libA = path.join(TMP, `A`, `lib`, `node_modules`),
      libB = path.join(TMP, `B`, `lib`, `node_modules`),
      binA = path.join(TMP, `A`, `bin`),
      binB = path.join(TMP, `B`, `bin`),
      npmA = path.join(libA, `npm`),
      npmB = path.join(libB, `npm`),
      nodeA = path.join(binA, `node`),
      nodeB = path.join(binB, `node`),
      bnpmA = path.join(binA, `npm`),
      bnpmB = path.join(binB, `npm`);

const notMoved = [npmA, npmB, nodeA, nodeB, bnpmA, bnpmB],
      files = notMoved.concat(
        path.join(libA, f1), path.join(libA, f2),
        path.join(binA, b1), path.join(binA, b2)
      );

let config, NODES, LAST;

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
 * Read text from file in sync manner.
 * @param  {string} name Filename.
 * @return {string}
 */
const readText = name => fs.readFileSync(name, 'utf8');

/**
 * Sync reading JSON from file.
 * @param  {string} name Filename.
 * @return {?Object} Parse JSON value (null if no such file).
 */
const readJSON = name => {
  try {
    return JSON.parse(readText(name));
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
    if (file === npmA || file === npmB) {
      fs.mkdirSync(file);
    } else {
      fs.writeFileSync(file, getRelative(file));
    }
  }

}

describe('simple API', function() {

  it('exists', function() {

    assert(typeof fixNvmUpdate === 'function');

  });

  it('works with array of string args', function() {

    fixNvmUpdate([`A`, `B`]);

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

    assert(fixNvmUpdate([`A`, `B`]));

  });

  it('return true with one arg', function() {

    config = readJSON(CONFIG);
    if (config) LAST = config.last;

    assert(fixNvmUpdate([`A`]));

  });

  it('has config', function() {

    config = readJSON(CONFIG);
    NODES = config.nodes;

    assert(NODES && typeof NODES === 'string');

    /**
     * HACK Temporary change config here, only for testing.
     */
    config.nodes = TMP;
    config.last  = undefined;
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
        assert(str.startsWith(`usage`));
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
        assert(str.startsWith(`usage`));
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
        assert(str.startsWith(`usage`));
        assert(str.includes(SELF));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([`A`, `B`]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

  it(`show message about the same version`, function() {

    assert(fixNvmUpdate([`A`]));

    const error = console.error;
    const log = console.log;
    let called = 0;

    try {

      console.log = str => {
        assert(str.includes(`A`));
        assert(str.includes(`not`));
        assert(str.includes(`version`));
        ++called;
      };

      console.error = () => assert(false);

      assert(fixNvmUpdate([`A`]));
      assert(called === 1);

    } finally {

      console.error = error;
      console.log = log;

    }

  });

});

describe('moving', function() {

  it('move from old version to new', function() {

    assert(fixNvmUpdate([`B`]));

    for (const file of notMoved) {
      if (file === npmA || file === npmB) {
        assert(fs.statSync(file).isDirectory());
      } else {
        assert(readText(file) === getRelative(file));
      }
    }

    let pt;

    pt = path.join(libB, f1);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));
    pt = path.join(libB, f2);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));

    pt = path.join(binB, b1);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));
    pt = path.join(binB, b2);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));

  });

  it('move again', function() {

    assert(fixNvmUpdate([`A`]));

    for (const file of notMoved) {
      if (file === npmA || file === npmB) {
        assert(fs.statSync(file).isDirectory());
      } else {
        assert(readText(file) === getRelative(file));
      }
    }

    let pt;

    pt = path.join(libA, f1);
    assert(readText(pt) === getRelative(pt));
    pt = path.join(libA, f2);
    assert(readText(pt) === getRelative(pt));

    pt = path.join(binA, b1);
    assert(readText(pt) === getRelative(pt));
    pt = path.join(binA, b2);
    assert(readText(pt) === getRelative(pt));

  });

});

describe('bash command', function() {

  it(`show usage with option "--help"`, function() {

    assert(exec(`${MAIN} --help`, OPTIONS).startsWith(`usage`));

  });

  it(`show usage with empty arg`, function() {

    assert(exec(`${MAIN}`, OPTIONS).startsWith(`usage`));

  });

  it(`show usage with extra args`, function() {

    assert(exec(`${MAIN} A B`, OPTIONS).startsWith(`usage`));

  });

  it('move from old version to new', function() {

    exec(`${MAIN} B`, OPTIONS);

    for (const file of notMoved) {
      if (file === npmA || file === npmB) {
        assert(fs.statSync(file).isDirectory());
      } else {
        assert(readText(file) === getRelative(file));
      }
    }

    let pt;

    pt = path.join(libB, f1);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));
    pt = path.join(libB, f2);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));

    pt = path.join(binB, b1);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));
    pt = path.join(binB, b2);
    assert(readText(pt).replace(`A`, `B`) === getRelative(pt));

  });

  it('move again', function() {

    exec(`${MAIN} A`, OPTIONS);

    for (const file of notMoved) {
      if (file === npmA || file === npmB) {
        assert(fs.statSync(file).isDirectory());
      } else {
        assert(readText(file) === getRelative(file));
      }
    }

    let pt;

    pt = path.join(libA, f1);
    assert(readText(pt) === getRelative(pt));
    pt = path.join(libA, f2);
    assert(readText(pt) === getRelative(pt));

    pt = path.join(binA, b1);
    assert(readText(pt) === getRelative(pt));
    pt = path.join(binA, b2);
    assert(readText(pt) === getRelative(pt));

    /**
     * HACK Restore config. This code should be in last test.
     */
    config.nodes = NODES;
    config.last  = LAST;
    writeJSON(CONFIG, config);

  });

});

});