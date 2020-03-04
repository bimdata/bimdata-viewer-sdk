BIMData viewer SDK
==================

This repo is a pre-configured environment to develop BIMData Viewer plugins.
You can develop, test, build, package and share your plugin easily.

## Setup
First, you must create a BIMData Application (see https://developers.bimdata.io/tutorials/dev_create_an_application.html)
The SDK needs at least `cloud:read` and `ifc:read` scopes. The default BCF Plugin needs `bcf:read` and `bcf:write` scopes ans you can add any scope you may need for your plugins.

The redirect URI is by default http://localhost:8080/oidc-callback

Then you can copy the .env.example file and add your client_id:
```
npm install
cp .env.example .env
```

Edit .env file with your preferences (your client_id)

### Compiles and hot-reloads for development
```
npm run serve
```

### Usage
When going on http://localhost:8080, a simple interface will parse your projects and models and let you open the one you want.
You can directly open one by opening an URL with specific Ids: http://localhost:8080/viewer?cloudId=391&projectId=634&ifcId=1491

## Create your first plugin

```
npm run init-plugin
```

This tool will ask you some questions about the plugin you want to develop and will generate basic files for your plugin.

Files will be created it `src/plugins/{{name of your plugin}}`.

You just need to import your newly created plugin `src/viewer/viewer.vue` and add it to the registerPlugin array.

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

To load your plugin in a real environment, you may want to package and publish your plugin.
The plugin template is pre-configured with a rollup config that allows you to do this easily:

```bash
cd src/plugins/{your_plugin}
npm install
npm run build
```

This will create a dist folder in your plugin directory with a simple js file. This minified file includes the CSS and the assets (encoded in base64). It's not the most performant way, but it's the simplest and the viewer will load many mega-bytes models anyway.

You can either copy-paste this file in your environment and load it as you want or you can publish it to npm.
To do this, update the package.json file with the information you want and just run an `npm publish`.

The code is minified to protect your code as much as possible.


### More info about how it works
The SDK itself uses *Webpack* to build. The packaging uses *Rollup*. If you need a complex JS flow, it may lead to some issues.
To see these issues before there are deployed, you may want to load the packaged version in the SDK:
```bash
cd src/plugins/{your_plugin}
npm run watch
```
And load the dist version of the plugin
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
