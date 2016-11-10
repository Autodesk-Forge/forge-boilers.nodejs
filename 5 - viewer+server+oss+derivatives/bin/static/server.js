'use strict';

require('babel-polyfill');

var _c0nfig = require('c0nfig');

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _derivatives = require('./api/endpoints/derivatives');

var _derivatives2 = _interopRequireDefault(_derivatives);

var _upload = require('./api/endpoints/upload');

var _upload2 = _interopRequireDefault(_upload);

var _forge = require('./api/endpoints/forge');

var _forge2 = _interopRequireDefault(_forge);

var _oss = require('./api/endpoints/oss');

var _oss2 = _interopRequireDefault(_oss);

var _DerivativesSvc = require('./api/services/DerivativesSvc');

var _DerivativesSvc2 = _interopRequireDefault(_DerivativesSvc);

var _SvcManager = require('./api/services/SvcManager');

var _SvcManager2 = _interopRequireDefault(_SvcManager);

var _ForgeSvc = require('./api/services/ForgeSvc');

var _ForgeSvc2 = _interopRequireDefault(_ForgeSvc);

var _OssSvc = require('./api/services/OssSvc');

var _OssSvc2 = _interopRequireDefault(_OssSvc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/////////////////////////////////////////////////////////////////////
// App initialization
//
/////////////////////////////////////////////////////////////////////


//Services


//Endpoints
var app = (0, _express2.default)();

//Server stuff
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

// async support


app.set('trust proxy', 1);

app.use((0, _expressSession2.default)({
  secret: 'autodeskforge',
  cookie: {
    secure: process.env.NODE_ENV === 'production', //requires https
    maxAge: 1000 * 60 * 60 * 24 // 24h session
  },
  resave: false,
  saveUninitialized: true
}));

app.use('/resources', _express2.default.static(__dirname + '/../../resources'));
app.use((0, _serveFavicon2.default)(__dirname + '/../../resources/img/forge.png'));
app.use('/', _express2.default.static(__dirname + '/../../dist/'));
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use(_bodyParser2.default.json());
app.use((0, _cookieParser2.default)());
app.use((0, _helmet2.default)());

/////////////////////////////////////////////////////////////////////
// Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/derivatives', (0, _derivatives2.default)());
app.use('/api/upload', (0, _upload2.default)());
app.use('/api/forge', (0, _forge2.default)());
app.use('/api/oss', (0, _oss2.default)());

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function runServer() {

  try {

    process.on('exit', function () {});

    process.on('uncaughtException', function (err) {

      console.log('uncaughtException');
      console.log(err);
      console.error(err.stack);
    });

    process.on('unhandledRejection', function (reason, p) {

      console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
    });

    var forgeSvc = new _ForgeSvc2.default(_c0nfig.serverConfig.forge);

    var derivativesSvc = new _DerivativesSvc2.default();

    var ossSvc = new _OssSvc2.default();

    _SvcManager2.default.registerService(derivativesSvc);
    _SvcManager2.default.registerService(forgeSvc);
    _SvcManager2.default.registerService(ossSvc);

    var server = app.listen(process.env.PORT || _c0nfig.serverConfig.port || 3000, function () {

      console.log('Server listening on: ');
      console.log(server.address());
      console.log('ENV: ' + process.env.NODE_ENV);
    });
  } catch (ex) {

    console.log('Failed to run server... ');
    console.log(ex);
  }
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
runServer();