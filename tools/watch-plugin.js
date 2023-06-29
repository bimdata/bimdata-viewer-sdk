"use strict";

const util = require("node:util");
const inquirer = require("inquirer");
const fs = require("node:fs");
const path = require("path");
const exec = util.promisify(require("node:child_process").exec);
const { spawn } = require("node:child_process");

const PLUGIN_FILE_RC = "./.watch-plugin.rc";

const sleep = ms => new Promise(r => setTimeout(r, ms));

const askQuestion = async plugins => {
  const question = [
    {
      name: "name",
      type: "checkbox",
      choices: plugins,
      message: "Which plugin(s) do you want to watch while developing ?",
    },
  ];
  const answers = await inquirer.prompt(question);
  return answers.name;
};

const readPluginsFile = async availablePlugins => {
  const file = fs.readFileSync(PLUGIN_FILE_RC, { encoding: "utf8" });
  const plugins = file.split("\n").filter(Boolean);
  plugins.forEach(plugin => {
    if (!availablePlugins.find(p => p.value === plugin)) {
      console.log(`Plugin ${plugin} not found`);
      throw new Error();
    }
  });
  return plugins;
};

const getAvailablePlugins = async () => {
  try {
    const { stdout } = await exec("npm query .workspace");
    return JSON.parse(stdout).map(plugin => {
      const split = plugin.name.split("/");
      return {
        name: split[split.length - 1],
        value: plugin.name,
      };
    });
  } catch (error) {
    const pluginsDir = path.resolve(__dirname, "../src/plugins");
    const files = fs.readdirSync(pluginsDir);
    const plugins = [];
    files.forEach(file => {
      if (!fs.existsSync(pluginsDir + "/" + file + "/package.json")) {
        return;
      }
      const packageJson = fs.readFileSync(
        pluginsDir + "/" + file + "/package.json",
        { encoding: "utf8" }
      );
      plugins.push({
        name: file,
        value: JSON.parse(packageJson).name,
      });
    });
    return plugins;
  }
};

const start = async () => {
  const availablePlugins = await getAvailablePlugins();
  let selected_plugins = [];
  try {
    selected_plugins = await readPluginsFile(availablePlugins);
  } catch (error) {
    selected_plugins = await askQuestion(availablePlugins);
  }

  const processes = [];
  processes.push(
    spawn("vite", {
      stdio: ["ignore", "inherit", "inherit"],
    })
  );
  sleep(1000);
  selected_plugins.forEach(plugin => {
    processes.push(
      spawn("npm", ["run", "watch", `--workspace=${plugin}`], {
        stdio: ["ignore", "inherit", "inherit"],
      })
    );
  });

  process.on("SIGTERM", () => {
    processes.forEach(process => process.kill("SIGTERM"));
    process.exit(0);
  });
  process.on("SIGINT", () => {
    processes.forEach(process => process.kill("SIGINT"));
    process.exit(0);
  });
};

start();
