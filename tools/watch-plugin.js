"use strict";

const inquirer = require("inquirer");
const fs = require("node:fs");
const path = require("path");
const { spawn } = require("node:child_process");

const PLUGIN_FILE_RC = ".watch-plugin.rc";

const askPluginSelection = async plugins => {
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

const readSelectedPluginsFromFile = availablePlugins => {
  try {
    const file = fs.readFileSync(PLUGIN_FILE_RC, { encoding: "utf8" });
    const args = file.split("\n").filter(Boolean);
    return availablePlugins
      .filter(plugin => args.includes(plugin.name))
      .map(plugin => plugin.value);
  } catch {
    return [];
  }
};

const parseCommandArguments = availablePlugins => {
  const args = process.argv.slice(2);
  return availablePlugins
    .filter(plugin => args.includes(plugin.name))
    .map(plugin => plugin.value);
};

const getAvailablePlugins = () => {
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
};

const start = async () => {
  const availablePlugins = getAvailablePlugins();

  let selected_plugins = parseCommandArguments(availablePlugins);
  if (selected_plugins.length === 0) {
    selected_plugins = readSelectedPluginsFromFile(availablePlugins);
  }
  if (selected_plugins.length === 0) {
    selected_plugins = await askPluginSelection(availablePlugins);
  }

  const processes = [];
  processes.push(
    spawn("vite", {
      stdio: ["ignore", "inherit", "inherit"],
    })
  );
  selected_plugins.forEach(plugin => {
    processes.push(
      spawn("npm", ["run", "watch", `--workspace=${plugin}`], {
        stdio: ["ignore", "inherit", "inherit"],
      })
    );
  });

  const cleanupProcesses = () => {
    processes.forEach(process => process.kill());
    process.exit(0);
  };
  process.on("SIGTERM", cleanupProcesses);
  process.on("SIGINT", cleanupProcesses);
};

start();
