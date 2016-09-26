# Roomedit3dv3

[![Node.js](https://img.shields.io/badge/Node.js-4.4.3-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-2.15.1-blue.svg)](https://www.npmjs.com/)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)

## Description

Forge Viewer extension to move building elements and update the Revit BIM in real-time using [socket.io](http://socket.io).

This is a [node.js](https://nodejs.org) web server implementing a Forge Viewer extension.

- [Forge Components](#1)
- [Prerequisites and Sample Setup](#2)
- [Round-Trip BIM Manipulaton via Forge and Roomedit3dv3](#3)
- [Connecting desktop and cloud](#4)
- [Interactive model modification in the Forge Viewer](#5)
- [Communication Back from Viewer Client to Node.js Web Server to Desktop BIM](#6)
- [Authors](#98)
- [License](#99)


## <a name="1"></a>Forge Components

`Roomedit3dv3` is based
on [Philippe Leefsma](http://twitter.com/F3lipek)'s
[`forge-boilers.nodejs` node.js-based boilerplate projects](https://github.com/Autodesk-Forge/forge-boilers.nodejs) for
the [Autodesk Forge Web Services APIs](http://forge.autodesk.com).

The following Forge APIs and components are used to manipuate a Revit BIM model:

- Authenticate and authorise the user &ndash; [Authentication (OAuth)](https://developer.autodesk.com/en/docs/oauth/v2)
- Access and download a RVT project file from A360 &ndash; [Data Management API](https://developer.autodesk.com/en/docs/data/v2)
- Translate and access its geometry and metadata &ndash; [Model Derivative API](https://developer.autodesk.com/en/docs/model-derivative/v2)
- Display to the user &ndash; [Viewer](https://developer.autodesk.com/en/docs/viewer/v2)

Just as Philippe original boilerplate code, this sample illustrates use of the following Forge npm packages:

- [forge.oauth2-js](https://github.com/Autodesk-Forge/forge.oauth2-js)
- [forge.oss-js](https://github.com/Autodesk-Forge/forge.oss-js)
- [forge.model.derivative-js](https://github.com/Autodesk-Forge/forge.model.derivative-js)
- [forge.data.management-js](https://github.com/Autodesk-Forge/forge.data.management-js)


## <a name="2"></a>Prerequisites and Sample Setup

For a full detailed description of the steps required to set up your own Forge account,
install and modify the sample to use your credentials and deploy as a local server or on a platform such
as [Heroku](https://heroku.com),
please refer to Philippe's original documentation for the
boilerplate [prerequisites](https://github.com/Autodesk-Forge/forge-boilers.nodejs#prerequisites)
and [sample setup](https://github.com/Autodesk-Forge/forge-boilers.nodejs#boilers-setup).

In brief:

This project uses [Webpack](https://webpack.github.io) and NPM packages to build and generate the frontend code, so an extra build step is required.

On Mac OSX and Linux, run the following in Terminal:

    > npm install
    > export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    > export FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    > npm run build-dev (this runs a dev build and webpack in --watch mode)
    > npm run dev (runs the node server, do in another terminal if you want to keep the webpack watcher running)

Under Windows, replace `export` by `set`.

Open your browser at [http://localhost:3000](http://localhost:3000).

<b>Important:</b> the `npm start` command is intended for <b>PRODUCTION</b> with HTTPS (SSL) secure cookies.

To run a production build, you can use start command:

    > npm start

This will run a production build and start the server.

The production build code is minified and function names are mangled, making it smaller and impractical for debugging or reverse engineering.

To download and view files stored in the OSS, you need a valid callback url to achieve 3-legged oauth authentication.
 
I recommend you create two separate sets of Forge API keys, one for DEVELOPMENT and one for PRODUCTION, because each set has a different callback url.

To run the project locally (using the DEV API keys):

- Make sure the callback url for your DEV Forge API Keys is set to <b>http://localhost:3000/api/forge/callback/oauth</b>.

![forge-dev](resources/img/forge-dev.png)

Run the following commands (mind the DEV!):

    > npm install
    > set FORGE_DEV_CLIENT_ID=<<YOUR DEV CLIENT ID FROM DEVELOPER PORTAL>>
    > set FORGE_DEV_CLIENT_SECRET=<<YOUR DEV CLIENT SECRET>>
    > npm run build-dev
    > npm run dev

To run in production, the callback url defined for your Forge App needs to match the host url, so, for example, if you run your app from <b>https://mydomain.com</b>:

    > npm install
    > set HOST_URL=https://mydomain.com
    > set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    > set FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>>
    > npm start

To deploy this project to Heroku, click on the button below at the Heroku Create New App page:

- Set your Client ID & Client Secret with your Forge API keys.
- Specify the HOST_URL env variable based on the name of your Heroku App, e.g., `MyApp` would map to `HOST_URL=https://MyApp.herokuapp.com`.
- Your Forge App callback must be set to <b>https://MyApp.herokuapp.com/api/forge/callback/oauth</b>.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jeremytammik/roomedit3dv3)

The result will look like this, displaying a treeview of your Autodesk Cloud storage that lets you upload designs and perform actions from the context menu:

![Project6](resources/img/Project6.png)

To load a design in the viewer:

- Right-click the nodes to get options from the context menu.
- Upload a design file to a folder (supports file selection dialog or drag & drop).
- Upon successful upload, the file appears under the parent node in the tree, right-click and select <b>Generate viewable</b>.
- Upon successful translation of the design, double-click the file to load it into the viewer.



## <a name="2"></a>Round-Trip BIM Manipulaton via Forge and Roomedit3dv3

The `roomedit3dv3` viewer extension enables interactive selection and movement of selected BIM elements in the model on screen.

The updated elements and their new locations are transferred back from the viewer client to the web server via a REST API call.

The server in turn uses [socket.io](http://socket.io) to broadcast the updates to the rest of the universe.

This broadcast is picked up by the [Roomedit3dApp](https://github.com/jeremytammik/Roomedit3dApp) C# .NET Revit add-in client.

This version supersedes its precursor [roomedit3d](https://github.com/jeremytammik/roomedit3d), which was hardwired for a specific model.

In `roomedit3dv3`, any model can be selected.

Todo: add a project identifier to the broadcasts to enable the C# add-in broadcoast receivers to ignore all messages not pertaining to the current Revit BIM.

The selected element is identified via its Revit UniqueId.


## <a name="3"></a>Connecting Desktop and Cloud

`Roomedit3dv3` is a member of the suite of samples connecting the desktop and the cloud.

Each of the samples consists of a C# .NET Revit API desktop add-in and a web server:

- [RoomEditorApp](https://github.com/jeremytammik/RoomEditorApp) and  the [roomeditdb](https://github.com/jeremytammik/roomedit) CouchDB
	database and web server demonstrating real-time round-trip graphical editing of furniture family instance location and rotation plus textual editing of element properties in a simplified 2D representation of the 3D BIM.
- [FireRatingCloud](https://github.com/jeremytammik/FireRatingCloud) and
	the [fireratingdb](https://github.com/jeremytammik/firerating) node.js
	MongoDB web server demonstrating real-time round-trip editing of Revit element shared parameter values.
- [Roomedit3dApp](https://github.com/jeremytammik/Roomedit3dApp) and
  the first [roomedit3d](https://github.com/jeremytammik/roomedit3d) Forge Viewer extension demonstrating translation of furniture family instances in the viewer and updating the Revit BIM in real time via a socket.io broadcast with a hard-coded sample model.
- [Roomedit3dApp](https://github.com/jeremytammik/Roomedit3dApp) and
  the [roomedit3dv3](https://github.com/jeremytammik/roomedit3d) Forge Viewer extension demonstrating the same functionality with a user selected model stored in A360.


## <a name="4"></a>Interactive Model Modification in the Forge Viewer

The `Roomedit3dTranslationTool` implements a viewer extension that enables the user to select a component and interactively move it around on the screen, defining a translation to be applied to it and communicated back to the source CAD model.


## <a name="5"></a>Communication Back from Viewer Client to Node.js Web Server to Desktop BIM

![Roomedit3dv3 architecture](img/roomedit3dv3_architecture.png "Roomedit3dv3 architecture and communication path")

The Forge Viewer itself provides viewing functionality only, no editing.

The pre-defined Forge communication path is one-way only, from the desktop to the cloud, from the source 'seed' CAD model to the translated Forge API bucket and JSON data bubble stream.

This sample demonstrates an interactive modification of the [three.js](http://threejs.org) graphics presented by the viewer and a communication path to send updated element location information back to the desktop product in real time.

In this case, the source desktop CAD model is a Revit BIM, and the modifications applied are building element translations.

The viewer client in the browser uses [fetch](https://github.com/github/fetch) to implement a REST API POST call to communicate the modified element external id and translation back to the node.js server.

The node.js server uses a [socket.io](http://socket.io) broadcast to notify the desktop of the changes.

The dedicated C# .NET Revit add-in [Roomedit3dApp](https://github.com/jeremytammik/Roomedit3dApp) subscribes to the socket.io channel, retrieves the updating data and raises an external event to obtain a valid Revit API context and apply it to the BIM.


## <a name="98"></a>Authors

- [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html),
[Autodesk](http://www.autodesk.com) [Forge Partner Development](http://forge.autodesk.com)
- Jeremy Tammik,
[The Building Coder](http://thebuildingcoder.typepad.com) and
[The 3D Web Coder](http://the3dwebcoder.typepad.com),
[ADN](http://www.autodesk.com/adn)
[Open](http://www.autodesk.com/adnopen),
[Forge Partner Development](http://forge.autodesk.com),
[Autodesk Inc.](http://www.autodesk.com)


## <a name="99"></a>License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for full details.


<hr>


## Description
A collection of node.js-based boiler projects for the [Autodesk Forge Web Services APIs](http://forge.autodesk.com).

Those samples illustrates how to use the following Forge npm packages:

 * [forge.oauth2-js](https://github.com/Autodesk-Forge/forge.oauth2-js)
 * [forge.oss-js](https://github.com/Autodesk-Forge/forge.oss-js)
 * [forge.model.derivative-js](https://github.com/Autodesk-Forge/forge.model.derivative-js)
 * [forge.data.management-js](https://github.com/Autodesk-Forge/forge.data.management-js)

## Prerequisites

To run those samples, you need your own Forge API credentials:

 * Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account
 * [Create a new App](https://developer.autodesk.com/myapps/create)
 * For this new App, you can use <b>http://localhost:3000/api/forge/callback/oauth</b> as Callback URL.
 * Take note of the <b>Client ID</b> and <b>Client Secret</b>, those are your API keys that must remain hidden
 * Install the latest release of [NodeJS](https://nodejs.org)
 * Clone this or download this project. It's recommended to install a git client such as [GitHub desktop](https://desktop.github.com/) or [SourceTree](https://www.sourcetreeapp.com/)
 * To clone it via command line, use the following (<b>Terminal</b> on MacOSX/Linux, <b>Git Shell</b> on Windows):

    > git clone https://github.com/Autodesk-Forge/forge-boilers.nodejs


## Boilers Setup

Below are instructions to setup and run locally each boiler project, they may vary based on which project you want to run.

## Project #1 - viewer-offline

You can simply open <b>viewer-offline.html</b> in a browser. This project will load the local model from <b>/v8</b> directoryand  does not require you to run any server on the machine,
although you may want to serve the .html page to get around security restrictions imposed by some browsers (such as Chrome) when reading local files.

 * In order to do that install a local http server on your machine, you can use the following:

    > sudo npm install -g http-server

 * Navigate to <b>"/1 - viewer-offline"</b> directory and start the server:

    > http-server

 * Note the local address output by the server (ex: <b>http://127.0.0.1:8080</b>) and type in your browser: <b>http://127.0.0.1:8080/viewer-offline.html</b>

 * This project does not require any internet connection or Forge API credentials and can be used for testing the viewer API locally

 * You can also run that sample the following links, which in that case requires an internet connection:

    * [Engine](https://autodesk-forge.github.io/forge-boilers.nodejs/1%20-%20viewer-offline/viewer-offline.html)
    * [Copter](https://autodesk-forge.github.io/forge-boilers.nodejs/1%20-%20viewer-offline/viewer-offline.html?path=./copter/0.svf)

![Project1](resources/img/Project1.png)

## Project #2 - viewer-barebone

Samples in this project do not require you to implement a server, but they rely on hardcoded token and URN in the JavaScript code, so they are for testing purpose only.

 * You will need to generate a valid [2-legged OAuth token](https://developer.autodesk.com/en/docs/oauth/v2/tutorials/get-2-legged-token/) and upload a model to your account, which you can do using that website for now: [https://models.autodesk.io](https://models.autodesk.io)

 * Once you have a token and the URN of your model, replace in the hardcoded fields in <b>viewer.html</b> and <b>viewingApp.html</b>:

     var token = '<< Place your token here >>'

     var urn = '<< Place your URN here >>'

 * You can open the files directly in browser or serve similar to project #1. The <b>viewer.html</b> is using the plain JavaScript viewer API,
 whereas <b>viewingApp.html</b> is using an extra layer of code from Autodesk which adds a UI to switch between viewables (for designs translated from Revit .rvt files), see screenshot below:

 ![Multiple Views](resources/img/Project2.png)

## Project #3 - viewer+server
## Project #4 - viewer+server+oss
## Project #5 - viewer+server+oss+derivatives

The setup is similar for those 3 projects and they have to be run independently.

Those projects are using [Webpack](https://webpack.github.io), a module bundler and NPM packages to build and generate the frontend code, so an extra build step is required.

Navigate with a command shell or terminal to the project you want to run and type the following commands:

Mac OSX/Linux (Terminal)

    > npm install
    > export FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>
    > export FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>
    > npm run build-dev (this runs a dev build and webpack in --watch mode)
    > npm run dev (runs the node server, do in another terminal if you want to keep the webpack watcher running)

Windows (use <b>Node.js command line</b> from Start menu)

    > npm install
    > set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>
    > set FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>
    > npm run build-dev
    > npm run dev

Open your browser at:
[http://localhost:3000](http://localhost:3000)

<b>Important:</b> the <b>npm start</b> command, this is intended for <b>PRODUCTION</b> with HTTPS (SSL) secure cookies.

To run a production build you can use start command:

    > npm start

Which will run a production build and start the server. A production build code is minified and function names are mangled which make it much smaller and impractical for debugging or reverse engineering.


### Deploy Project #5 on Heroku

To deploy this project to Heroku, simply click on the button below, at the Heroku Create New App page:

 * Set your Client ID & Client Secret with your Forge API keys

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Forge/forge-boilers.nodejs/tree/project5)

The result will look like below: a treeview of the OSS storage that lets you upload designs and perform actions from the context menu.

To load a design in the viewer:

 * Right-click the root node to create a new bucket if you do not have any
 * Upload the design file to the bucket (supports file selection dialog or drag & drop)
 * Upon successful upload, the file appears in the bucket, right-click and select <b>Generate viewable</b>
 * Upon successful translation of the design, double-click the file and it will get loaded in the viewer

 ![Project5](resources/img/Project5.png)

## Project #6 - viewer+server+data-mng+derivatives

Same setup than for projects #3, #4, #5 but you also need a valid callback url to achieve 3-legged oauth authentication.
I recommend you create 2 sets of Forge API keys, one for DEVELOPMENT and one for PRODUCTION because each set has a different callback url.

To run the project locally (using the DEV API keys):

 * Make sure the callback url for your DEV Forge API Keys is set to <b>http://localhost:3000/api/forge/callback/oauth</b>

![forge-dev](resources/img/forge-dev.png)

Run the following commands (mind the DEV!):

    > npm install
    > set FORGE_DEV_CLIENT_ID=<<YOUR DEV CLIENT ID FROM DEVELOPER PORTAL>
    > set FORGE_DEV_CLIENT_SECRET=<<YOUR DEV CLIENT SECRET>
    > npm run build-dev
    > npm run dev


To run in production, the callback url defined in your Forge App needs to match the host url, so if you run your app from <b>https://mydomain.com</b>:

    > npm install
    > set HOST_URL=https://mydomain.com
    > set FORGE_CLIENT_ID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>
    > set FORGE_CLIENT_SECRET=<<YOUR CLIENT SECRET>
    > npm start

### Deploy Project #6 on Heroku

To deploy this project to Heroku, simply click on the button below, at the Heroku Create New App page:

 * Set your Client ID & Client Secret with your Forge API keys
 * Specify HOST_URL env variable based on the name of your Heroku App:
 ex You used "MyApp" -> HOST_URL=https://MyApp.herokuapp.com
 * Your Forge App callback must be set to <b>https://MyApp.herokuapp.com/api/forge/callback/oauth</b>

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Autodesk-Forge/forge-boilers.nodejs/tree/project6)

The result will look like below: a treeview of your Autodesk Cloud storage that lets you upload designs and perform actions from the context menu.

To load a design in the viewer:

 * Right-click the nodes to get options from the context menu
 * Upload a design file to a folder (supports file selection dialog or drag & drop)
 * Upon successful upload, the file appears under the parent node in the tree, right-click and select <b>Generate viewable</b>
 * Upon successful translation of the design, double-click the file and it will get loaded in the viewer

 ![Project6](resources/img/Project6.png)


# Tips & tricks

For local development/testing, consider use [nodemon](https://www.npmjs.com/package/nodemon) package, which auto restarts your node application after any modification on your code. To install it, use:

    sudo npm install -g nodemon

Then, instead of <b>npm run dev</b>, use the following:

    npm run nodemon

Which executes <b>nodemon bin/run.js --config nodemon.js</b>, where the <b>nodemon.js</b> is the nodemon config file where you can define which directories and file types are being watched, along with other configuration options.
See [nodemon](https://github.com/remy/nodemon) for more details.

## License

[MIT License](http://opensource.org/licenses/MIT)

## Written by 

Written by [Philippe Leefsma](http://twitter.com/F3lipek)

Forge Partner Development - [http://forge.autodesk.com](http://forge.autodesk.com)

