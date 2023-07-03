# BIMData Viewer SDK

This repo is a pre-configured environment to develop BIMData Viewer plugins.
You can develop, test, build, package and share your plugin easily.

## Setup

First, you have to clone the sdk repo and install SDK dependencies :

```sh
git clone https://github.com/bimdata/bimdata-viewer-sdk.git
cd bimdata-viewer-sdk
npm install
```

> _Note:_
>
> If you want to create you own application you can copy the `.env.example` file :
>
> ```
> cp .env.example .env
> ```
>
> Then you can read this guide : https://developers.bimdata.io/api/guides/application.html#which-app-will-you-create

### Compiles and hot-reloads for development

```sh
npm run dev
```

### Usage

When going on http://localhost:8080, a simple interface will parse your projects and models and let you open the one you want.
You can directly open one by opening an URL using specific Ids: http://localhost:8080/viewer?cloudId=391&projectId=634&ifcId=1491

## Create your first plugin

```sh
npm run init-plugin
```

This tool asks you a couple of questions about the plugin you develop and generate from your answers basic files for your plugin.

Files are created in the directory `src/plugins/{{name of your plugin}}`.

Then import your newly created plugin and add it to the registerPlugin array.

The SDK utilizes npm workspaces to link your plugin in the root node_modules directory, making it accessible from Viewer.vue as if it were an installed package.

#### **`src/views/Viewer.vue`**

```js
// `myPlugin` is the package name of `package.json`
import myPlugin from "myPlugin";

...
mounted() {
  const bimdataViewer = makeBIMDataViewer({...})

  bimdataViewer.registerPlugin(myPlugin);
}
...
```

And run the following command:

```sh
npm run dev myPlugin
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

## More info about how it works

The SDK itself and the packaging use _Vite_ to build.


The `npm run dev` command facilitates the development process by automatically watching selected plugins while using the Vite build tool.

### Usage

```js
npm run dev [plugin1] [plugin2] ...
```

If no argument, it prompts users to select plugins they want to monitor and launches the necessary processes to watch them simultaneously.

If a `.watch-plugin.rc` file exists in the SDK root's directory, the script will attempt to read the selected plugins from it.
Example:

```sh
> cat .watch-plugin.rc
@bimdata/snowflakes-viewer-plugin
MyPlugin
```

The `npm run dev:only` command disables this behavior.
