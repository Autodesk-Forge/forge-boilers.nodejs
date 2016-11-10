'use strict';

var _SvcManager = require('../services/SvcManager');

var _SvcManager2 = _interopRequireDefault(_SvcManager);

var _c0nfig = require('c0nfig');

var _findRemove = require('find-remove');

var _findRemove2 = _interopRequireDefault(_findRemove);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
  var _this = this;

  var router = _express2.default.Router();

  //clean up TMP files at startup
  (0, _findRemove2.default)('TMP', {
    age: { seconds: 0 }
  });

  ///////////////////////////////////////////////////////////////////
  // start cleanup task to remove uploaded temp files
  //
  ///////////////////////////////////////////////////////////////////
  setInterval(function () {

    (0, _findRemove2.default)('TMP', {
      age: { seconds: 3600 }
    }), 60 * 60 * 1000;
  });

  //////////////////////////////////////////////////////////////////////////////
  // Initialization upload
  //
  ///////////////////////////////////////////////////////////////////////////////
  var storage = _multer2.default.diskStorage({

    destination: 'TMP/',
    filename: function filename(req, file, cb) {
      _crypto2.default.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err);
        cb(null, raw.toString('hex') + _path2.default.extname(file.originalname));
      });
    }
  });

  var upload = (0, _multer2.default)({ storage: storage });

  /////////////////////////////////////////////////////////////////////////////
  // POST /upload/oss/:bucketKey
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/oss/:bucketKey', upload.any(), function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
      var bucketKey, file, objectKey, forgeSvc, token, ossSvc, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              bucketKey = req.params.bucketKey;
              file = req.files[0];
              objectKey = file.originalname;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context.next = 7;
              return forgeSvc.get2LeggedToken();

            case 7:
              token = _context.sent;
              ossSvc = _SvcManager2.default.getService('OssSvc');
              _context.next = 11;
              return ossSvc.putObject(token.access_token, bucketKey, objectKey, file);

            case 11:
              response = _context.sent;


              res.json(response);
              _context.next = 20;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context['catch'](0);


              console.log(_context.t0);

              res.status(_context.t0.status || 500);
              res.json(_context.t0);

            case 20:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[0, 15]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  return router;
};