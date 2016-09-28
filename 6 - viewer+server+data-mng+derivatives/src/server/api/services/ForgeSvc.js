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
import ForgeOAuth from 'forge-oauth2'
import BaseSvc from './BaseSvc'
import request from 'request'
import moment from 'moment'

export default class ForgeSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this._2leggedAPI = new ForgeOAuth.TwoLeggedApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'ForgeSvc'
  }

  /////////////////////////////////////////////////////////////////
  // Return token expiry in seconds
  //
  /////////////////////////////////////////////////////////////////
  getExpiry (token) {

    var age = moment().diff(token.time_stamp, 'seconds')

    return token.expires_in - age
  }

  /////////////////////////////////////////////////////////////////
  // Stores 2Legged token
  //
  /////////////////////////////////////////////////////////////////
  set2LeggedToken (token) {

    //store current time
    token.time_stamp = moment().format()

    this._2LeggedToken = token
  }

  /////////////////////////////////////////////////////////////////
  // return master token (full privileges),
  // refresh automatically if expired
  //
  /////////////////////////////////////////////////////////////////
  get2LeggedToken () {

    return new Promise(async(resolve, reject) => {

      try {

        var token = this._2LeggedToken

        if (!token) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope.join(' '))

          this.set2LeggedToken(token)
        }

        if (this.getExpiry(token) < 60) {

          token = await this.request2LeggedToken(
            this._config.oauth.scope.join(' '))

          this.set2LeggedToken(token)
        }

        resolve(token)

      } catch (ex){

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Request new 2-legged with specified scope
  //
  /////////////////////////////////////////////////////////////////
  request2LeggedToken (scope) {

    return this._2leggedAPI.authenticate (
      this._config.oauth.clientId,
      this._config.oauth.clientSecret,
      'client_credentials', {
        scope: scope
      })
  }

  /////////////////////////////////////////////////////////////////
  // Stores 3Legged token
  //
  /////////////////////////////////////////////////////////////////
  set3LeggedTokenMaster (session, token) {

    //store current time
    token.time_stamp = moment().format()

    session.forge = session.forge || {}

    session.forge.masterToken =
      token

    session.forge.refreshToken =
      token.refresh_token
  }

  /////////////////////////////////////////////////////////////////
  // Get 3Legged token
  //
  /////////////////////////////////////////////////////////////////
  get3LeggedTokenMaster (session) {

    return new Promise(async(resolve, reject) => {

      try {

        if (!session.forge) {

          throw { status:404, msg: 'Not Found' }
        }

        var token = session.forge.masterToken

        if(this.getExpiry(token) < 60) {

          token = await this.refresh3LeggedToken (
            token,  this._config.oauth.scope.join(' '))

          this.set3LeggedTokenMaster(
            session, token)
        }

        resolve(token)

      } catch (ex){

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Stores 3Legged token for client (reduced privileges)
  //
  /////////////////////////////////////////////////////////////////
  set3LeggedTokenClient (session, token) {

    //store current time
    token.time_stamp = moment().format()

    session.forge = session.forge || {}

    session.forge.clientToken =
      token

    session.forge.refreshToken =
      token.refresh_token
  }

  /////////////////////////////////////////////////////////////////
  // Get 3Legged token for client (reduced privileges)
  //
  /////////////////////////////////////////////////////////////////
  get3LeggedTokenClient (session) {

    return new Promise(async(resolve, reject) => {

      try {

        if (!session.forge) {

          throw { status:404, msg: 'Not Found' }
        }

        var token = session.forge.clientToken

        if(this.getExpiry(token) < 60) {

          token = await this.refresh3LeggedToken (
            token, 'data:read')

          this.set3LeggedTokenClient(
            session, token)
        }

        resolve(token)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Delete 3 legged token (user logout)
  //
  /////////////////////////////////////////////////////////////////
  delete3LeggedToken (session) {

    session.forge = null
  }

  /////////////////////////////////////////////////////////////////
  // Refresh 3-legged token with specified scope
  //
  /////////////////////////////////////////////////////////////////
  refresh3LeggedToken (token, scope) {

    return new Promise((resolve, reject) => {

      var url = this._config.oauth.baseUri +
        this._config.oauth.refreshTokenUri

      request({
        url: url,
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true,
        form: {
          client_secret: this._config.oauth.clientSecret,
          client_id: this._config.oauth.clientId,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token',
          scope: scope
        }

      }, (err, response, body) => {

        try {

          if (err) {

            console.log('error: ' + url)
            console.log(err)

            return reject(err)
          }

          if (body && body.errors) {

            console.log('body error: ' + url)
            console.log(body.errors)

            return reject(body.errors)
          }

          if([200, 201, 202].indexOf(
              response.statusCode) < 0){

            return reject(response)
          }

          return resolve(body.data || body)
        }
        catch(ex){

          return reject(response)
        }
      })
    })
  }
}
