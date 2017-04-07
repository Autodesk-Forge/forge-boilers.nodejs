///////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////

//full config
import config from 'c0nfig'

//Server stuff
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import path from 'path'

//Endpoints
import DerivativesAPI from './api/endpoints/derivatives'
import LMVProxy from './api/endpoints/lmv-proxy'
import UploadAPI from './api/endpoints/upload'
import SocketAPI from './api/endpoints/socket'
import ForgeAPI from './api/endpoints/forge'
import AppAPI from './api/endpoints/app'
import DMAPI from './api/endpoints/dm'

//Services
import SVFDownloaderSvc from './api/services/SVFDownloaderSvc'
import DerivativesSvc from './api/services/DerivativesSvc'
import ServiceManager from './api/services/SvcManager'
import SocketSvc from './api/services/SocketSvc'
import ForgeSvc from './api/services/ForgeSvc'
import OssSvc from './api/services/OssSvc'
import DMSvc from './api/services/DMSvc'

/////////////////////////////////////////////////////////////////////
// App initialization
//
/////////////////////////////////////////////////////////////////////
var app = express()

app.set('trust proxy', 1)

app.use(session({
  secret: 'autodeskforge',
  cookie: {
    secure: (process.env.NODE_ENV === 'production'), //requires https
    maxAge: 1000 * 60 * 60 * 24 // 24h session
  },
  resave: false,
  saveUninitialized: true
}))

app.use('/resources', express.static(__dirname + '/../../resources'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(helmet())

/////////////////////////////////////////////////////////////////////
// Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/derivatives', DerivativesAPI())
app.use('/api/socket', SocketAPI())
app.use('/api/upload', UploadAPI())
app.use('/api/forge', ForgeAPI())
app.use('/api/app', AppAPI())
app.use('/api/dm', DMAPI())

/////////////////////////////////////////////////////////////////////
// Viewer GET Proxy
//
/////////////////////////////////////////////////////////////////////
app.get('/lmv-proxy/*', LMVProxy.get)

/////////////////////////////////////////////////////////////////////
// Static server setup with hot reloading for DEV
//
/////////////////////////////////////////////////////////////////////
if (process.env.NODE_ENV === 'development') {

  // dynamically require webpack dependencies
  // to keep them in devDependencies (package.json)
  const webpackConfig = require('../../webpack/development.webpack.config')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpack = require('webpack')

  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: webpackConfig.stats,
    progress: true,
    hot: true
  }))

  app.use(webpackHotMiddleware(compiler))

} else {

  app.use('/', express.static(__dirname + '/../../dist/'))
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function runServer() {

  return new Promise((resolve, reject) => {

    try {

      process.on('exit', () => {

      })

      process.on('uncaughtException', (err) => {

        console.log('uncaughtException')
        console.log(err)
        console.error(err.stack)
      })

      process.on('unhandledRejection', (reason, p) => {

        console.log('Unhandled Rejection at: Promise ', p,
          ' reason: ', reason)
      })

      const svfDownloaderSvc = new SVFDownloaderSvc()

      const forgeSvc = new ForgeSvc(
        config.forge)

      const derivativesSvc = new DerivativesSvc()

      const ossSvc = new OssSvc()

      const dmSvc = new DMSvc()

      ServiceManager.registerService(svfDownloaderSvc)
      ServiceManager.registerService(derivativesSvc)
      ServiceManager.registerService(forgeSvc)
      ServiceManager.registerService(ossSvc)
      ServiceManager.registerService(dmSvc)

      var server = app.listen(
        process.env.PORT || config.port || 3000, () => {

          var socketSvc = new SocketSvc({
            session,
            server
          })

          ServiceManager.registerService(socketSvc)

          resolve(server)

          console.log('Server listening on: ')
          console.log(server.address())
          console.log('ENV: ' + process.env.NODE_ENV)
        })

    } catch (ex) {

      console.log('Failed to run server... ')
      console.log(ex)
      reject(ex)
    }
  })
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
runServer()

