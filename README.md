# fix-nvm-update #

[![NPM version][npm-image]][npm-url] ![node][node-image] ![dependencies][dependencies-image] [![License MIT][license-image]](LICENSE)

[![NPM](https://nodei.co/npm/fix-nvm-update.png)](https://nodei.co/npm/fix-nvm-update/)

**fix-nvm-update** quickly move all global npm packages from old Node version to new (only for versions, installed via [NVM](https://github.com/creationix/nvm)), without reinstalling.

## Usage ##
You need a node version >=6.0.0.  
Install **fix-nvm-update** localy or global, and set your current version of Node on first **fix-nvm-update** run:
```bash
$ fix-nvm-update v6.6.0
```
After installing new Node version just run **fix-nvm-update** with this new version:
```bash
$ nvm install v6.7.0
$ fix-nvm-update v6.7.0
```
Usually you can see all installed Node versions in directory **~/.nvm/versions/node**. If on your system this directory has other path, you can change it in field **nodes** of **config.json** file in **fix-nvm-update** directory.  
In **last** field of **config.json** you can manually set Node version (for moving packages from this version to new one).

It's not a problem if **fix-nvm-update** move itself with other global packages.

This will show usage and version:
```bash
$ fix-nvm-update --help
```

## Why ##
[NVM](https://github.com/creationix/nvm) offers a official way of updating: [Migrating global packages while installing](https://github.com/creationix/nvm#migrating-global-packages-while-installing).
```bash
$ nvm install v6.7.0 --reinstall-packages-from=v6.6.0
```
It works, but this solution has a problems:
 - all packages reinstalled -- it's take a long time
 - all packages reinstalled -- so they lose their internal "state" (but may be this is correct behaviour and packages should not have some state)
 - old packages do not deleted, but they could weight more then 100 Mb
 - old bin links do not deleted (but there is no real problem with that)

But simple moving packages to new Node version directory works very quickly. **fix-nvm-update** does it carefully with full logging (in stdout).


## How ##
Let current directory is the path of Node versions, **old** -- your old Node version, and **new** -- the new one. Then **fix-nvm-update** just run commands:
```bash
$ mkdir tmp

$ mv old/lib/node_modules/* tmp
$ mv tmp/npm old/lib/node_modules
$ mv tmp/* new/lib/node_modules

$ mv old/bin/* tmp
$ mv tmp/npm tmp/node nodes/old/bin
$ mv tmp/* new/bin

$ rmdir tmp
```
So, **npm** package, and bin links to **npm** and **node** do not moving.

## Tests ##
18 tests via Mocha:
```bash
$ npm install
$ npm test
```

## License ##
[MIT](LICENSE)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg "license-image"
[dependencies-image]: https://img.shields.io/gemnasium/mathiasbynens/he.svg?maxAge=2592000 "dependencies-image"
[node-image]: https://img.shields.io/badge/node-v6.0.0-brightgreen.svg?maxAge=2592000 "node-image"
[npm-image]: https://img.shields.io/npm/v/fix-nvm-update.svg "npm-image"
[npm-url]: https://www.npmjs.com/package/fix-nvm-update "fix-nvm-update"
