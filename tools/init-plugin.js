'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const copydir = require('copy-dir');
const inquirer = require('inquirer');
const nunjucks = require('nunjucks');
const isVarName = require('is-valid-var-name');

nunjucks.configure(__dirname + '/templates', { autoescape: true });

const pluginsDir = path.resolve(__dirname, '../src/plugins');
console.log(pluginsDir)
function createPluginStructure(pluginDir, name) {
  fs.mkdirSync(pluginDir);
  fs.mkdirSync(pluginDir + '/src');
  copydir.sync(__dirname + '/assets', pluginDir + '/assets');
}

function createRollupConfig(pluginDir, name) {
  const file = nunjucks.render('rollup.config.js', { name });
  fs.writeFileSync(pluginDir + '/rollup.config.js', file);
}

function createNpmConfig(pluginDir, name) {
  const file = nunjucks.render('package.json', { name });
  fs.writeFileSync(pluginDir + '/package.json', file);
}

function createPluginFiles(pluginDir, name) {
  const component = nunjucks.render('Component.vue', { name });
  fs.writeFileSync(`${pluginDir}/src/${name}.vue`, component);

  const plugin = nunjucks.render('plugin.js', { name });
  fs.writeFileSync(`${pluginDir}/src/${name}.plugin.js`, plugin);
}

function askQuestions() {
  const questions = [
    {
      name: "name",
      type: "input",
      message: "What is the name of the plugin? (must be a valid javascript variable name)",
      validate: async input => {
        if (!isVarName(input)) {
          return 'Invalid name. The name must be a valid javascript variable name';
        }
        return true;
      }
    },
  ];
  return inquirer.prompt(questions);
};


const run = async () => {
  const { name } = await askQuestions();

  const pluginDir = pluginsDir + '/' + name;

  createPluginStructure(pluginDir, name);
  createRollupConfig(pluginDir, name);
  createNpmConfig(pluginDir, name);
  createPluginFiles(pluginDir, name);
};

run();
