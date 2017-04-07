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
import ServiceManager from '../services/SvcManager'
import { OAuth2 } from 'oauth'
import express from 'express'
import config from 'c0nfig'

module.exports = function() {

  var router = express.Router()

  ///////////////////////////////////////////////////////////////////////////
  // 2-legged client token: exposes a 'data:read' only token to client App
  //
  ///////////////////////////////////////////////////////////////////////////
  router.get('/token/2legged', async(req, res) => {

    try {

      var forgeSvc = ServiceManager.getService('ForgeSvc')

      var token = await forgeSvc.request2LeggedToken('data:read')

      res.json(token)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // Initialize OAuth library
  //
  /////////////////////////////////////////////////////////////////////////////

  var oauth2 = new OAuth2(
    config.forge.oauth.clientId,
    config.forge.oauth.clientSecret,
    config.forge.oauth.baseUri,
    config.forge.oauth.authorizationUri,
    config.forge.oauth.accessTokenUri,
    null)

  /////////////////////////////////////////////////////////////////////////////
  // login endpoint
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/login', function (req, res) {

    var authURL = oauth2.getAuthorizeUrl({
      redirect_uri: config.forge.oauth.redirectUri,
      scope: config.forge.oauth.scope.join(' ')
    })

    res.json(authURL + '&response_type=code')
  })

  /////////////////////////////////////////////////////////////////////////////
  // logout endpoint
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/logout', (req, res) => {

    var forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    forgeSvc.delete3LeggedToken(req.session)

    res.json('success')
  })

  /////////////////////////////////////////////////////////////////////////////
  // Reply looks as follow:
  //
  //  access_token: "fk7dd21P4FAhJWl6MptumGkXIuei",
  //  refresh_token: "TSJpg3xSXxUEAtevo3lIPEmjQUxXbcqNT9AZHRKYM3",
  //  results: {
  //    token_type: "Bearer",
  //    expires_in: 86399,
  //    access_token: "fk7dd21P4FAhJWl6MptumGkXIuei"
  //  }
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/callback/oauth', (req, res) => {

    var socketSvc = ServiceManager.getService(
      'SocketSvc')

    // filter out errors (access_denied, ...)
    if (req.query && req.query.error) {

      if (req.session.socketId) {

        socketSvc.broadcast(
          'callback', req.query.error,
          req.session.socketId)
      }

      res.json(req.query.error)
      return
    }

    if(!req.query || !req.query.code) {

      res.status(401)
      res.json('invalid request')
      return
    }

    oauth2.getOAuthAccessToken(
      req.query.code, {
        grant_type: 'authorization_code',
        redirect_uri: config.forge.oauth.redirectUri
      },
      function (err, access_token, refresh_token, results) {

        try {

          var forgeSvc = ServiceManager.getService(
            'ForgeSvc')

          var token = {
            scope: config.forge.oauth.scope,
            expires_in: results.expires_in,
            refresh_token: refresh_token,
            access_token: access_token
          }

          forgeSvc.set3LeggedTokenMaster(
            req.session, token)

          if(req.session.socketId) {

            socketSvc.broadcast(
              'callback',
              'success',
              req.session.socketId)
          }

          res.end('success')

        } catch (ex) {

          res.status(500)
          res.end(ex)
        }
      }
    )
  })

  /////////////////////////////////////////////////////////////////////////////
  // logout route
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/logout', (req, res) => {

    var forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    forgeSvc.logout(req.session)

    res.json('success')
  })

  ///////////////////////////////////////////////////////////////////////////
  // 3-legged client token: exposes a 'data:read' only token to client App
  //
  ///////////////////////////////////////////////////////////////////////////
  //router.get('/token/3legged', async (req, res) => {
  //
  //  var forgeSvc = ServiceManager.getService(
  //    'ForgeSvc')
  //
  //  try {
  //
  //    var token = await forgeSvc.get3LeggedTokenClient(
  //      req.session)
  //
  //    res.json({
  //      expires_in: forgeSvc.getExpiry(token),
  //      access_token: token.access_token,
  //      scope: token.scope
  //    })
  //
  //  } catch (error) {
  //
  //    forgeSvc.logout(req.session)
  //
  //    res.status(error.statusCode || 404)
  //    res.json(error)
  //  }
  //})

  return router
}