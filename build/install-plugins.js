"use strict";

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const pluginsDir = path.join(__dirname, '../src/plugins');

fs.readdirSync(pluginsDir)
  .map(dirName => path.join(pluginsDir, dirName))
  .map(dirName => ({dirName, stat: fs.statSync(dirName)}))
  .filter(({dirName, stat}) => stat.isDirectory())
  .filter(({dirName, stat}) => fs.readdirSync(dirName).includes("package.json"))
  .forEach(({dirName}) => execSync('npm install', {cwd: dirName}));
