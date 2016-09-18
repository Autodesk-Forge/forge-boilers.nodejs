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
import {serverConfig as config} from 'c0nfig'

//Server stuff
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import express from 'express'
import helmet from 'helmet'
import path from 'path'

//Endpoints
import ForgeAPI from './api/endpoints/forge'

//Services
import ServiceManager from './api/services/SvcManager'
import ForgeSvc from './api/services/ForgeSvc'

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
app.use(favicon(__dirname + '/../../resources/img/forge.png'))
app.use('/', express.static(__dirname + '/../../dist/'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(helmet())

/////////////////////////////////////////////////////////////////////
// Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/forge', ForgeAPI())

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function runServer() {

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

        var server = app.listen(
          process.env.PORT || config.port || 3000, () => {

              var forgeSvc = new ForgeSvc({
                  config: config.forge
              })

              ServiceManager.registerService(forgeSvc)

              console.log('Server listening on: ')
              console.log(server.address())
              console.log('ENV: ' + process.env.NODE_ENV)
          })

    } catch (ex) {

        console.log('Failed to run server... ')
        console.log(ex)
    }
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
runServer()