'use strict';

var _SvcManager = require('../services/SvcManager');

var _SvcManager2 = _interopRequireDefault(_SvcManager);

var _c0nfig = require('c0nfig');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
  var _this = this;

  var router = _express2.default.Router();

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
      var forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;


              // obtain forge service
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');

              // request 2legged token

              _context.next = 4;
              return forgeSvc.get2LeggedToken();

            case 4:
              token = _context.sent;


              // obtain oss service
              ossSvc = _SvcManager2.default.getService('OssSvc');

              // get list of bucket by passing valid token

              _context.next = 8;
              return ossSvc.getBuckets(token.access_token);

            case 8:
              response = _context.sent;


              // send json-formatted response
              res.json(response);

              _context.next = 17;
              break;

            case 12:
              _context.prev = 12;
              _context.t0 = _context['catch'](0);


              console.log(_context.t0);
              res.status(_context.t0.statusCode || 500);
              res.json(_context.t0);

            case 17:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[0, 12]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/details', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
      var bucketKey, forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              bucketKey = req.params.bucketKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context2.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context2.sent;
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context2.next = 9;
              return ossSvc.getBucketDetails(token.access_token, bucketKey);

            case 9:
              response = _context2.sent;


              res.json(response);

              _context2.next = 17;
              break;

            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2['catch'](0);


              res.status(_context2.t0.statusCode || 500);
              res.json(_context2.t0);

            case 17:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this, [[0, 13]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
      var bucketKey, forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              bucketKey = req.params.bucketKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context3.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context3.sent;
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context3.next = 9;
              return ossSvc.getObjects(token.access_token, bucketKey);

            case 9:
              response = _context3.sent;


              res.send(response);

              _context3.next = 18;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3['catch'](0);


              console.log(_context3.t0);

              res.status(_context3.t0.statusCode || 500);
              res.json(_context3.t0);

            case 18:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this, [[0, 13]]);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey/details', function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
      var bucketKey, objectKey, forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              bucketKey = req.params.bucketKey;
              objectKey = req.params.objectKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context4.next = 6;
              return forgeSvc.get2LeggedToken();

            case 6:
              token = _context4.sent;
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context4.next = 10;
              return ossSvc.getObjectDetails(token.access_token, bucketKey, objectKey);

            case 10:
              response = _context4.sent;


              res.json(response);

              _context4.next = 18;
              break;

            case 14:
              _context4.prev = 14;
              _context4.t0 = _context4['catch'](0);


              res.status(_context4.t0.statusCode || 500);
              res.json(_context4.t0);

            case 18:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[0, 14]]);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey', function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
      var bucketKey, objectKey, forgeSvc, ossSvc, token, object;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              bucketKey = req.params.bucketKey;
              objectKey = req.params.objectKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context5.next = 7;
              return forgeSvc.get2LeggedToken();

            case 7:
              token = _context5.sent;
              _context5.next = 10;
              return ossSvc.getObject(token.access_token, bucketKey, objectKey);

            case 10:
              object = _context5.sent;


              res.end(object);

              _context5.next = 17;
              break;

            case 14:
              _context5.prev = 14;
              _context5.t0 = _context5['catch'](0);


              console.log(_context5.t0);

            case 17:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this, [[0, 14]]);
    }));

    return function (_x9, _x10) {
      return _ref5.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // POST /buckets
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/buckets', function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
      var bucketCreationData, forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              bucketCreationData = req.body.bucketCreationData;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context6.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context6.sent;
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context6.next = 9;
              return ossSvc.createBucket(token.access_token, bucketCreationData);

            case 9:
              response = _context6.sent;


              res.json(response);

              _context6.next = 17;
              break;

            case 13:
              _context6.prev = 13;
              _context6.t0 = _context6['catch'](0);


              res.status(_context6.t0.statusCode || 500);
              res.json(_context6.t0);

            case 17:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this, [[0, 13]]);
    }));

    return function (_x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey', function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res) {
      var bucketKey, forgeSvc, ossSvc, token, response;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              bucketKey = req.params.bucketKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context7.next = 6;
              return forgeSvc.request2LeggedToken('bucket:delete');

            case 6:
              token = _context7.sent;
              _context7.next = 9;
              return ossSvc.deleteBucket(token.access_token, bucketKey);

            case 9:
              response = _context7.sent;


              res.json(response);

              _context7.next = 17;
              break;

            case 13:
              _context7.prev = 13;
              _context7.t0 = _context7['catch'](0);


              res.status(_context7.t0.statusCode || 500);
              res.json(_context7.t0);

            case 17:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this, [[0, 13]]);
    }));

    return function (_x13, _x14) {
      return _ref7.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey/objects/:objectKey', function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res) {
      var bucketKey, objectKey, forgeSvc, ossSvc, token, response;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              bucketKey = req.params.bucketKey;
              objectKey = req.params.objectKey;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context8.next = 7;
              return forgeSvc.get2LeggedToken();

            case 7:
              token = _context8.sent;
              _context8.next = 10;
              return ossSvc.deleteObject(token.access_token, bucketKey, objectKey);

            case 10:
              response = _context8.sent;


              res.json(response);

              _context8.next = 18;
              break;

            case 14:
              _context8.prev = 14;
              _context8.t0 = _context8['catch'](0);


              res.status(_context8.t0.statusCode || 500);
              res.json(_context8.t0);

            case 18:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this, [[0, 14]]);
    }));

    return function (_x15, _x16) {
      return _ref8.apply(this, arguments);
    };
  }());

  return router;
};