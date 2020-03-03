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

function createPluginStructure(pluginDir) {
  fs.mkdirSync(pluginDir);
  fs.mkdirSync(pluginDir + '/src');
  copydir.sync(__dirname + '/assets', pluginDir + '/assets');
}

function createRollupConfig(pluginDir, answers) {
  const file = nunjucks.render('rollup.config.js', answers);
  fs.writeFileSync(pluginDir + '/rollup.config.js', file);
}

function createNpmConfig(pluginDir, answers) {
  const file = nunjucks.render('package.json', answers);
  fs.writeFileSync(pluginDir + '/package.json', file);
}

function createPluginFiles(pluginDir, answers) {
  const component = nunjucks.render('Component.vue', answers);
  fs.writeFileSync(`${pluginDir}/src/${answers.UpperCaseName}.vue`, component);

  const plugin = nunjucks.render('plugin.js', answers);
  fs.writeFileSync(`${pluginDir}/src/${answers.name}.plugin.js`, plugin);
}

function askQuestions() {
  const questions = [
    {
      name: 'name',
      type: 'input',
      message: 'What is the name of the plugin? (must be a valid javascript variable name)',
      validate: async input => {
        if (!isVarName(input)) {
          return 'Invalid name. The name must be a valid javascript variable name';
        }
        return true;
      }
    },
    {
      name: 'iconPosition',
      type: 'list',
      choices: [
        {
          name: 'On the left panel',
          value: 'left',
        },
        {
          name: 'On the right panel',
          value: 'right',
        },
        {
          name: "I don't want an icon",
          value: null,
        }
       ],
      message: 'Where do you want your icon?',
      default: 'left',
    },
    {
      name: 'content',
      type: 'list',
      choices: [
        {
          name: 'A resizable and movable window',
          value: 'windowed'
        },
        {
          name: 'A simple div that ajusts itself to the content',
          value: 'simple'
        },
        {
          name: "No predefined interface. I will handle it myself",
          value: 'free'
        },
      ],
      message: 'What king of interface do you want?',
      default: 'windowed',
    },
    {
      name: 'closeOnUserInteraction',
      type: 'confirm',
      message: 'Should your plugin be closed when the user interact with the model?',
      default: true,
    },
  ];
  return inquirer.prompt(questions);
};


const run = async () => {
  const answers = await askQuestions();
  answers.UpperCaseName = answers.name.replace(/^\w/, c => c.toUpperCase());
  answers.keepActive = !answers.closeOnUserInteraction;

  const pluginDir = pluginsDir + '/' + answers.name;

  createPluginStructure(pluginDir);
  createRollupConfig(pluginDir, answers);
  createNpmConfig(pluginDir, answers);
  createPluginFiles(pluginDir, answers);

  console.log();
  console.log();

  console.log(chalk.green('You can now load your plugin to the viewer:'));
  console.log(chalk.green('Add the following lines to src/viewer/viewer.vue'));
  console.log(`import test from "@/plugins/${answers.name}/src/${answers.name}.plugin.js";`);
  console.log(`this.$refs.bimdataViewerInstance.registerPlugins([${answers.name}]);`);
};

run();
