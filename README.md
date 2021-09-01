# BIMData viewer SDK

This repo is a pre-configured environment to develop BIMData Viewer plugins.
You can develop, test, build, package and share your plugin easily.

## Setup

First, you must create a BIMData Application (see https://developers.bimdata.io/tutorials/dev_create_an_application.html)
The SDK needs at least `cloud:read` and `ifc:read` scopes.
The default BCF Plugin needs `bcf:read` and `bcf:write` scopes, plus you can add any scope you need for your plugin.

The default redirect URI is http://localhost:8080/oidc-callback

Then you can copy the `.env.example` file and add your `client_id` in it:

```
cp .env.example .env
```

Install SDK dependecies:

```
npm install
```

To have everything working you also need to install all plugins on the first setup.

**Note :** Usualy you only need to do this once, you can then start working on your plugins and install/build them
individually as needed.

```
npm run install-plugins
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Usage

When going on http://localhost:8080, a simple interface will parse your projects and models and let you open the one you want.
You can directly open one by opening an URL using specific Ids: http://localhost:8080/viewer?cloudId=391&projectId=634&ifcId=1491

## Create your first plugin

```
npm run init-plugin
```

This tool asks you a couple of questions about the plugin you develop and generate from your answers basic files for your plugin.

Files are created in the directory `src/plugins/{{name of your plugin}}`.

Then import your newly created plugin `src/viewer/viewer.vue` and add it to the registerPlugin array.

```js
import SnowflakesPlugin from "@/plugins/snowflakes/src/snowflakes.plugin.js";
import SplitPlugin from "@/plugins/split/src/split.plugin.js";

...
mounted() {
  this.$refs.bimdataViewerInstance.registerPlugins([
    SnowflakesPlugin,
    SplitPlugin,
  ]);
}
...
```

## Package your plugin

To load your plugin in a real environment, you want to package and publish your plugin.
The plugin template is pre-configured with a rollup config that let you do this easily:

```bash
cd src/plugins/{your_plugin}
npm install
npm run build
```

This creates a dist/ folder in your plugin directory with a simple js file. This minified file includes the CSS and the assets (encoded in base64). It's not the most performant way, but it's the simplest and the Viewer loads many mega-bytes models anyway.

You can either copy-paste this file in your environment and load it at your convenience, or you can publish it on NPM.
To publish it, update the `package.json` file with the proper information and just run an `npm publish`.

The code is minified to protect your code as much as possible.

### More info about how it works

The SDK itself uses _Webpack_ to build. The packaging uses _Rollup_. If you need a complex JS flow, it may lead to some issues.
To see these issues before deploying, load the packaged version in the SDK:

```bash
cd src/plugins/{your_plugin}
npm run watch
```

And load the dist version of the plugin:

```js
import SplitPlugin from "@/plugins/split/dist/split.plugin.js";

...
mounted() {
  this.$refs.bimdataViewerInstance.registerPlugins([
    SplitPlugin,
  ]);
}
...
```

You can also edit the webpack and rollup config as you want.
