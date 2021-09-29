"use strict";

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const copydir = require("copy-dir");
const inquirer = require("inquirer");
const nunjucks = require("nunjucks");
const isVarName = require("is-valid-var-name");

nunjucks.configure(__dirname + "/templates", { autoescape: true });

const pluginsDir = path.resolve(__dirname, "../src/plugins");

function createPluginStructure(pluginDir, answers) {
  fs.mkdirSync(pluginDir);
  fs.mkdirSync(pluginDir + "/src");
  if (answers.type === "button") {
    copydir.sync(__dirname + "/assets", pluginDir + "/assets");
  }
}

function createRollupConfig(pluginDir, answers) {
  const file = nunjucks.render("rollup.config.js", answers);
  fs.writeFileSync(pluginDir + "/rollup.config.js", file);
}

function createNpmConfig(pluginDir, answers) {
  const file = nunjucks.render("package.json", answers);
  fs.writeFileSync(pluginDir + "/package.json", file);
}

function createPluginFiles(pluginDir, answers) {
  const component = nunjucks.render("Component.vue", answers);
  fs.writeFileSync(`${pluginDir}/src/${answers.UpperCaseName}.vue`, component);

  const plugin = nunjucks.render("plugin.js", answers);
  fs.writeFileSync(`${pluginDir}/src/${answers.name}.plugin.js`, plugin);
}

function askQuestions() {
  const questions = [
    {
      name: "name",
      type: "input",
      message:
        "What is the name of the plugin? (must be a valid javascript variable name)",
      validate: input => {
        if (!isVarName(input)) {
          return "Invalid name. The name must be a valid javascript variable name";
        }
        return true;
      },
    },
    {
      name: "type",
      type: "list",
      choices: [
        {
          name: "A dedicated window (like 2D viewer)",
          value: "window",
        },
        {
          name: "A button (Like the BCF plugin or params plugin)",
          value: "button",
        },
        {
          name: "None of them (My plugin won't have any UI or I'll handle it myself)",
          value: null,
        },
      ],
      message:
        "Is your plugin meant to be a dedicated window, be loaded with a button, none of them (no UI) ?",
    },
    {
      name: "buttonPosition",
      type: "list",
      choices: [
        {
          name: "On the left",
          value: "left",
        },
        {
          name: "On the right",
          value: "right",
        },
      ],
      message: "Where do you want your icon?",
      default: "left",
      when: answers => answers.type === "button",
    },
    {
      name: "menuType",
      type: "list",
      choices: [
        {
          name: "A simple div, I'll handle the HTML in it",
          value: "simple",
        },
        {
          name: "A resizable and movable panel (Like Structures or BCF)",
          value: "panel",
        },
      ],
      message: "What panel kind do you want?",
      default: "simple",
      when: answers => answers.type === "button",
    },
    {
      name: "windowVisibility",
      type: "checkbox",
      choices: [
        {
          name: "The 3D Viewer",
          value: "3dviewer",
        },
        {
          name: "The 2D Viewer",
          value: "2dviewer",
        },
      ],
      message: "On which windows to you want it to be visible?",
      default: ["3dviewer"],
      validate: input => {
        if (input.length === 0) {
          return "You must select at least 1 window or your button won't be shown.";
        }
        return true;
      },
      when: answers => answers.type === "button",
    },
    {
      name: "closeOnUserInteraction",
      type: "confirm",
      message:
        "Should your plugin be closed when the user interacts with the model?",
      default: false,
      when: answers => answers.type === "button",
    },
  ];
  return inquirer.prompt(questions);
}

const run = async () => {
  console.log(
    chalk.green(
      "This tool asks you basic questions and setup a plugin boilerplate"
    )
  );
  console.log(chalk.green("There are many options not covered by this tools"));
  console.log(
    chalk.green("You can will be able to change any value manually later")
  );
  console.log(
    chalk.green(
      "You can find complete examples in the documentation: https://developers.bimdata.io"
    )
  );
  const answers = await askQuestions();

  // Format some data for the template
  if (answers.windowVisibility) {
    answers.windowVisibility = answers.windowVisibility.map(window =>
      window.substring(0, window.indexOf("viewer"))
    );
  }
  answers.UpperCaseName = answers.name.replace(/^\w/, c => c.toUpperCase());
  answers.keepOpen = !answers.closeOnUserInteraction;

  const pluginDir = pluginsDir + "/" + answers.name;

  createPluginStructure(pluginDir, answers);
  createRollupConfig(pluginDir, answers);
  createNpmConfig(pluginDir, answers);
  createPluginFiles(pluginDir, answers);

  console.log();
  console.log();

  console.log(chalk.green("You can now load your plugin to the viewer:"));
  console.log(
    "Open " + chalk.red("src/views/viewer.vue") + " and add the import line:"
  );
  console.log();
  console.log(
    chalk.red("    import ") +
      answers.name +
      chalk.red(" from ") +
      chalk.yellowBright(
        `"@/plugins/${answers.name}/src/${answers.name}.plugin.js"`
      ) +
      ";"
  );
  console.log();
  console.log("And add the plugin with the registerPlugin method: ");
  console.log();
  console.log(
    "    bimdataViewer." + chalk.cyan("registerPlugin") + `(${answers.name});`
  );
  console.log();
};

run();
