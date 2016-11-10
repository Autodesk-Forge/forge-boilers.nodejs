'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _forgeOss = require('forge-oss');

var _forgeOss2 = _interopRequireDefault(_forgeOss);

var _BaseSvc2 = require('./BaseSvc');

var _BaseSvc3 = _interopRequireDefault(_BaseSvc2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OssSvc = function (_BaseSvc) {
  _inherits(OssSvc, _BaseSvc);

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  function OssSvc(config) {
    _classCallCheck(this, OssSvc);

    var _this = _possibleConstructorReturn(this, (OssSvc.__proto__ || Object.getPrototypeOf(OssSvc)).call(this, config));

    _this._APIAuth = _forgeOss2.default.ApiClient.instance.authentications['oauth2_application'];

    _this._bucketsAPI = new _forgeOss2.default.BucketsApi();
    _this._objectsAPI = new _forgeOss2.default.ObjectsApi();
    return _this;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////


  _createClass(OssSvc, [{
    key: 'name',
    value: function name() {

      return 'OssSvc';
    }

    /////////////////////////////////////////////////////////////////
    // Returns bucket list
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getBuckets',
    value: function getBuckets(token) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


      this._APIAuth.accessToken = token;

      opts = Object.assign({
        limit: 100,
        startAt: null,
        region: 'US' }, opts);

      return this._bucketsAPI.getBuckets(opts);
    }

    /////////////////////////////////////////////////////////////////
    // Returns bucket details
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getBucketDetails',
    value: function getBucketDetails(token, bucketKey) {

      this._APIAuth.accessToken = token;

      return this._bucketsAPI.getBucketDetails(bucketKey);
    }

    /////////////////////////////////////////////////////////////////
    // Returns object list in specific bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getObjects',
    value: function getObjects(token, bucketKey) {
      var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


      this._APIAuth.accessToken = token;

      opts = Object.assign({
        limit: 10,
        startAt: null,
        region: 'US' }, opts);

      return this._objectsAPI.getObjects(bucketKey, opts);
    }

    /////////////////////////////////////////////////////////////////
    // Returns object details
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getObjectDetails',
    value: function getObjectDetails(token, bucketKey, objectKey) {

      this._APIAuth.accessToken = token;

      return this._objectsAPI.getObjectDetails(bucketKey, objectKey, {});
    }

    /////////////////////////////////////////////////////////////////
    // parse objectId into { bucketKey, objectKey }
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'parseObjectId',
    value: function parseObjectId(objectId) {

      var parts = objectId.split('/');

      var bucketKey = parts[0].split(':').pop();

      var objectKey = parts[1];

      return {
        bucketKey: bucketKey,
        objectKey: objectKey
      };
    }

    /////////////////////////////////////////////////////////////////
    // Creates a new bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'createBucket',
    value: function createBucket(token, bucketCreationData) {
      var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


      bucketCreationData.bucketKey = validateBucketKey(bucketCreationData.bucketKey);

      bucketCreationData.policyKey = validatePolicyKey(bucketCreationData.policyKey);

      headers = Object.assign({
        xAdsRegion: 'US' }, headers);

      this._APIAuth.accessToken = token;

      return this._bucketsAPI.createBucket(bucketCreationData, headers);
    }

    /////////////////////////////////////////////////////////////////
    // Uploads object to bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'putObject',
    value: function putObject(token, bucketKey, objectKey, file) {
      var _this2 = this;

      //TODO: Not working yet - need to migrate to SDK

      //return new Promise( async(resolve, reject) => {
      //
      //  try {
      //
      //    let data = await mzfs.readFile(file.path)
      //
      //    let stat = await mzfs.stat(file.path)
      //
      //    this._APIAuth.accessToken = token
      //
      //    return this._objectsAPI.uploadObject (
      //      bucketKey, objectKey, stat.size, data, {})
      //
      //  } catch (ex) {
      //
      //    console.log(ex)
      //
      //    reject(ex)
      //  }
      //})

      return new Promise(function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
          var data, url, response;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return _fs2.default.readFile(file.path);

                case 3:
                  data = _context.sent;
                  url = _util2.default.format('https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s', bucketKey, objectKey);
                  _context.next = 7;
                  return requestAsync({
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/octet-stream',
                      'Authorization': 'Bearer ' + token
                    },
                    body: data,
                    url: url
                  });

                case 7:
                  response = _context.sent;


                  resolve(JSON.parse(response));
                  _context.next = 14;
                  break;

                case 11:
                  _context.prev = 11;
                  _context.t0 = _context['catch'](0);


                  reject(_context.t0);

                case 14:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2, [[0, 11]]);
        }));

        return function (_x4, _x5) {
          return _ref.apply(this, arguments);
        };
      }());
    }

    /////////////////////////////////////////////////////////////////
    // Download object from bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getObject',
    value: function getObject(token, bucketKey, objectKey) {

      //TODO: Not working yet - need to migrate to SDK

      //this._APIAuth.accessToken = token
      //
      //return new Promise((resolve, reject) => {
      //
      //  this._objectsAPI.getObject (
      //    bucketKey,
      //    objectKey,
      //    { encoding: null },
      //    function (err, data, response) {
      //
      //      //console.log(err)
      //      //console.log(data)
      //      //console.log(response)
      //
      //      if(err) {
      //
      //        return reject(err)
      //      }
      //
      //      resolve(response)
      //    })
      //})

      return new Promise(function (resolve, reject) {

        var url = _util2.default.format('https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s', bucketKey, objectKey);

        (0, _request2.default)({
          url: url,
          headers: {
            'Authorization': 'Bearer ' + token
          },
          encoding: null
        }, function (err, response, body) {

          if (err) {

            return reject(err);
          }

          resolve(body);
        });
      });
    }

    /////////////////////////////////////////////////////////////////
    // Deletes bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'deleteBucket',
    value: function deleteBucket(token, bucketKey) {

      this._APIAuth.accessToken = token;

      return this._bucketsAPI.deleteBucket(bucketKey);
    }

    /////////////////////////////////////////////////////////////////
    // Deletes object from bucket
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'deleteObject',
    value: function deleteObject(token, bucketKey, objectKey) {

      this._APIAuth.accessToken = token;

      return this._objectsAPI.deleteObject(bucketKey, objectKey);
    }
  }]);

  return OssSvc;
}(_BaseSvc3.default);

/////////////////////////////////////////////////////////////////
// Validates bucketKey
//
/////////////////////////////////////////////////////////////////


exports.default = OssSvc;
function validateBucketKey(bucketKey) {

  var result = bucketKey.replace(/[&\/\\#,+()$~%. '":*?<>{}]/g, '-');

  return result.toLowerCase();
}

/////////////////////////////////////////////////////////////////
// Validates policyKey
//
/////////////////////////////////////////////////////////////////
function validatePolicyKey(policyKey) {

  policyKey = policyKey.toLowerCase();

  if (['transient', 'temporary', 'persistent'].indexOf(policyKey) < 0) {

    return 'transient';
  }

  return policyKey;
}

/////////////////////////////////////////////////////////////////
// REST request wrapper
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise(function (resolve, reject) {

    (0, _request2.default)({

      url: params.url,
      method: params.method || 'GET',
      headers: params.headers || {
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

        if (response && [200, 201, 202].indexOf(response.statusCode) < 0) {

          return reject(response.statusMessage);
        }

        return resolve(body ? body.data || body : {});
      } catch (ex) {

        console.log(params.url);
        console.log(ex);

        return reject(ex);
      }
    });
  });
}