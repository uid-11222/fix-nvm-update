# fix-nvm-update

[![NPM version][npm-image]][npm-url] ![node][node-image] ![dependencies][dependencies-image] [![License MIT][license-image]](LICENSE)

[![NPM](https://nodei.co/npm/npm-statistic.png)](https://nodei.co/npm/fix-nvm-update/)

https://github.com/creationix/nvm#migrating-global-packages-while-installing

## Migrating global packages while installing

If you want to install a new version of Node.js and migrate npm packages from a previous version:
```bash
nvm install node --reinstall-packages-from=node
```
This will first use "nvm version node" to identify the current version you're migrating packages from. Then it resolves the new version to install from the remote server and installs it. Lastly, it runs "nvm reinstall-packages" to reinstall the npm packages from your prior version of Node to the new one.

You can also install and migrate npm packages from specific versions of Node like this:
```bash
nvm install 6 --reinstall-packages-from=5
nvm install v4.2 --reinstall-packages-from=iojs
```

But this solution has a problems:
 - all packages reinstalled -- it's take a long time
 - old packages do not deleted, but is's more then 100 Mb
 - old bin links do not deleted (but there is no real problem with that)

That's why we need a simple update script:
 - let $NODES be ~/.nvm/versions/node
 - let $NEW read from process.args (like "v6.5.0")
 - 
 - If $OLD === "" then { $OLD = $NEW, return; }
 - 
 - mv $NODES/$OLD/lib/node_modules/* $NODES/__TMP
 - mv $NODES/__TMP/npm $NODES/$OLD/lib/node_modules
 - mv $NODES/__TMP/* $NODES/$NEW/lib/node_modules
 - 
 - mv $NODES/$OLD/bin/* $NODES/__TMP
 - mv $NODES/__TMP/npm $NODES/__TMP/node $NODES/$OLD/bin
 - mv $NODES/__TMP/* $NODES/$NEW/bin
 - 
 - $OLD = $NEW

## Tests ##
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
