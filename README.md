# Forge Node.js Boilers

[![Node.js](https://img.shields.io/badge/Node.js-4.4.3-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-2.15.1-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![OSS](https://img.shields.io/badge/OSS-v2-green.svg)](http://developer.autodesk.com/)
[![Model-Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](http://developer.autodesk.com/)

## Description
A collection of node.js-based boiler projects for the [Autodesk Forge Web Services APIs](http://forge.autodesk.com)

## Prerequisites

To run those samples, you need your own Forge API credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, you can use <b>http://localhost:3000/callback/forge</b> as Callback URL. Finally take note of the <b>Client ID</b> and <b>Client Secret</b>.

Install [NodeJS](https://nodejs.org).

Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (<b>Terminal</b> on MacOSX/Linux, <b>Git Shell</b> on Windows):

    git clone https://github.com/Developer-Autodesk/forge-boilers.nodejs


## Boilers Setup

Below are instructions to setup and run locally each boiler project, they may vary based on which project you want to run.

## Project #1 - viewer-offline

You can simply open <b>viewer-offline.html</b> in a browser. This project does not require you to run any server on the machine,
although you may want to server the .html page to get around security restrictions imposed by some browsers, such as Chrome.

In order to do that install a local http server on your machine:

    > sudo npm install -g http-server

navigate to 1 - viewer-offline/

    > http-server

note the local address output by the server, ex: and type to your browser

## Project #2 - viewer-barebone

TODO

## Project #3 - viewer+server
## Project #4 - viewer+server+oss
## Project #5 - viewer+server+oss+derivative

The setup is similar for those 3 projects and they have to be run independently. Navigate with a command shell or terminal to the project you want to run.

Mac OSX/Linux (Terminal)

    npm install
    export FORGE_CLIENTID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    export FORGE_CLIENTSECRET=<<YOUR CLIENT SECRET>>
    npm run build-dev (this runs a dev build and webpack in --watch mode)
    npm run dev (runs the node server, do in another terminal if you want to keep the webpack watcher running)

Windows (use <b>Node.js command line</b> from Start menu)

    npm install
    set FORGE_CLIENTID=<<YOUR CLIENT ID FROM DEVELOPER PORTAL>>
    set FORGE_CLIENTSECRET=<<YOUR CLIENT SECRET>>
    npm run build-dev
    npm run dev

Open the browser: [http://localhost:3000](http://localhost:3000).

<b>Important:</b> do not use <b>npm start</b> locally, this is intended for PRODUCTION only with HTTPS (SSL) secure cookies.

## License

[MIT License](http://opensource.org/licenses/MIT).

## Written by 

Written by [Philippe Leefsma](http://twitter.com/F3lipek)
Autodesk Developer Network.

