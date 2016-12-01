
import ForgeModelDerivative from 'forge-model-derivative'
import BaseSvc from './BaseSvc'
import request from 'request'

export default class DerivativeSvc extends BaseSvc {

  static get SERVICE_BASE_URL () {

    return 'https://developer.api.autodesk.com/modelderivative/v2'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super(config)

    this._APIAuth =
      ForgeModelDerivative.ApiClient.instance.authentications[
        'oauth2_application']

    this._derivativesAPI = new ForgeModelDerivative.DerivativesApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'DerivativesSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  postJob (token, payload) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.translate (payload, {
      'xAdsForce': payload.output.force
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getFormats (token, opts = {}) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.getFormats(opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getMetadata (token, urn, opts = {}) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.getMetadata(urn, opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getHierarchy (token, urn, guid, opts = {}) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.getModelviewMetadata(
      urn, guid, opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProperties (token, urn, guid, opts = {}) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.getModelviewProperties(
      urn, guid, opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getManifest (token, urn, opts = {}) {

    this._APIAuth.accessToken = token

    return this._derivativesAPI.getManifest (urn, opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteManifest (token, urn) {

    this._APIAuth.accessToken = token

    //TODO SDK KO
    //return this._derivativesAPI.deleteManifest (urn)

    var url = `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
      `${urn}/manifest`

    return requestAsync({
      method: 'DELETE',
      token: token,
      json: false,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  download (token, urn, derivativeURN, opts = {}) {

    // TODO SDK KO
    //this._APIAuth.accessToken = token
    //
    //return this._derivativesAPI.getDerivativeManifest(
    //  urn,
    //  derivativeURN,
    //  opts)

    return new Promise((resolve, reject) => {

      const url =
        `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
        `${encodeURIComponent(urn)}/manifest/` +
        `${encodeURIComponent(derivativeURN)}`

      request({
        url: url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        encoding: null
      }, function(err, response, body) {

        try {

          if (err) {

            return reject(err)
          }

          if (response && [200, 201, 202].indexOf(
              response.statusCode) < 0) {

            return reject(response.statusMessage)
          }

          if (opts.base64) {

            resolve(bufferToBase64(body))

          } else {

            resolve(body)
          }

        } catch(ex) {

          console.log(ex)

          reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getThumbnail (token, urn, options = {width: 100, height: 100}) {

    //TODO: SDK KO

    const url = `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
        `${urn}/thumbnail?` +
        `width=${options.width}&` +
        `height=${options.height}`

    return new Promise((resolve, reject) => {

      request({
        url: url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        encoding: null
      }, (err, response, body) => {

        try {

          if (err) {

            return reject(err)
          }

          if (response && [200, 201, 202].indexOf(
              response.statusCode) < 0) {

            return reject(response.statusMessage)
          }

          resolve(bufferToBase64(body))

        } catch(ex){

          console.log(url)
          console.log(body)

          reject(ex)
        }
      })
    })
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function bufferToBase64 (buffer) {

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = buffer, i, len = bytes.length, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64
}

function requestAsync(params) {

  return new Promise((resolve, reject) => {

    request({

      url: params.url,
      method: params.method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body

    }, (err, response, body) => {

      try {

        if (err) {

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          return reject(body.errors)
        }

        if([200, 201, 202].indexOf(
            response.statusCode) < 0){

          return reject(response)
        }

        return resolve(body || {})

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(response)
      }
    })
  })
}

