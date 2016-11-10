'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _forgeModelDerivative = require('forge-model-derivative');

var _forgeModelDerivative2 = _interopRequireDefault(_forgeModelDerivative);

var _BaseSvc2 = require('./BaseSvc');

var _BaseSvc3 = _interopRequireDefault(_BaseSvc2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DerivativeSvc = function (_BaseSvc) {
  _inherits(DerivativeSvc, _BaseSvc);

  _createClass(DerivativeSvc, null, [{
    key: 'SERVICE_BASE_URL',
    get: function get() {

      return 'https://developer.api.autodesk.com/modelderivative/v2';
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }]);

  function DerivativeSvc(config) {
    _classCallCheck(this, DerivativeSvc);

    var _this = _possibleConstructorReturn(this, (DerivativeSvc.__proto__ || Object.getPrototypeOf(DerivativeSvc)).call(this, config));

    _this._APIAuth = _forgeModelDerivative2.default.ApiClient.instance.authentications['oauth2_application'];

    _this._derivativesAPI = new _forgeModelDerivative2.default.DerivativesApi();
    return _this;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////


  _createClass(DerivativeSvc, [{
    key: 'name',
    value: function name() {

      return 'DerivativesSvc';
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'postJob',


    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    value: function postJob(token, payload) {

      this._APIAuth.accessToken = token;

      return this._derivativesAPI.translate(payload, {
        'xAdsForce': true
      });
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getFormats',
    value: function getFormats(token) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getFormats(opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getMetadata',
    value: function getMetadata(token, urn) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getMetadata(urn, opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getHierarchy',
    value: function getHierarchy(token, urn, guid) {
      var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getModelviewMetadata(urn, guid, opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getProperties',
    value: function getProperties(token, urn, guid) {
      var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getModelviewProperties(urn, guid, opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getManifest',
    value: function getManifest(token, urn) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getManifest(urn, opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'deleteManifest',
    value: function deleteManifest(token, urn) {

      this._APIAuth.accessToken = token;

      //TODO: not working?
      //return this._derivativesAPI.deleteManifest (urn)

      var url = _util2.default.format(DerivativeSvc.SERVICE_BASE_URL + '/designdata/%s/manifest', urn);

      return requestAsync({
        method: 'DELETE',
        token: token,
        json: false,
        url: url
      });
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'download',
    value: function download(token, urn, derivativeURN) {
      var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


      this._APIAuth.accessToken = token;

      return this._derivativesAPI.getDerivativeManifest(urn, derivativeURN, opts);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getThumbnail',
    value: function getThumbnail(token, urn) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { width: 100, height: 100 };


      //TODO: change to SDK code

      var url = _util2.default.format(DerivativeSvc.SERVICE_BASE_URL + '/designdata/%s/thumbnail?width=%s&height=%s', urn, options.width, options.height);

      return new Promise(function (resolve, reject) {

        (0, _request2.default)({
          url: url,
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token
          },
          encoding: null
        }, function (err, response, body) {

          try {

            if (err) {
              return reject(err);
            }

            if (response && [200, 201, 202].indexOf(response.statusCode) < 0) {

              return reject(response.statusMessage);
            }

            return resolve(arrayToBase64(body));
          } catch (ex) {

            console.log(params.url);
            console.log(body);

            return reject(ex);
          }
        });
      });
    }
  }, {
    key: 'jobOutputBuilder',
    get: function get() {

      return {

        svf: function svf() {
          var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


          return {
            destination: {
              region: opts.region || 'us'
            },
            formats: [{
              type: 'svf',
              views: opts.views || ['2d', '3d']
            }]
          };
        },

        obj: function obj() {
          var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


          return {
            destination: {
              region: opts.region || 'us'
            },
            formats: [{
              type: 'obj',
              advanced: {
                modelGuid: opts.modelGuid,
                objectIds: opts.objectIds
              }
            }]
          };
        },

        defaultOutput: function defaultOutput() {
          var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


          return {
            destination: {
              region: opts.region || 'us'
            },
            formats: [{
              type: opts.outputType
            }]
          };
        }
      };
    }
  }]);

  return DerivativeSvc;
}(_BaseSvc3.default);

///////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////


exports.default = DerivativeSvc;
function arrayToBase64(arraybuffer) {

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = arraybuffer,
      i,
      len = bytes.length,
      base64 = "";

  for (i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
    base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
    base64 += chars[bytes[i + 2] & 63];
  }

  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64;
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise(function (resolve, reject) {

    (0, _request2.default)({

      url: params.url,
      method: params.method || 'GET',
      headers: {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body

    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + params.url);
          console.log(err);

          return reject(err);
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url);
          console.log(body.errors);

          return reject(body.errors);
        }

        if ([200, 201, 202].indexOf(response.statusCode) < 0) {

          return reject(response);
        }

        return resolve(body || {});
      } catch (ex) {

        console.log(params.url);
        console.log(ex);

        return reject(response);
      }
    });
  });
}