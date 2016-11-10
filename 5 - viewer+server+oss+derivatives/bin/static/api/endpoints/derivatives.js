'use strict';

var _SvcManager = require('../services/SvcManager');

var _SvcManager2 = _interopRequireDefault(_SvcManager);

var _c0nfig = require('c0nfig');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = function () {
  var _this = this;

  var router = _express2.default.Router();

  /////////////////////////////////////////////////////////////////////////////
  // POST /job
  // Post a derivative job - generic
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/job', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
      var payload, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              payload = JSON.parse(req.body.payload);
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context.next = 9;
              return derivativesSvc.postJob(token.access_token, payload);

            case 9:
              response = _context.sent;


              res.json(response);

              _context.next = 17;
              break;

            case 13:
              _context.prev = 13;
              _context.t0 = _context['catch'](0);


              res.status(_context.t0.statusCode || 500);
              res.json(_context.t0);

            case 17:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[0, 13]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /formats
  // Get supported formats
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/formats', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
      var forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context2.next = 4;
              return forgeSvc.get2LeggedToken();

            case 4:
              token = _context2.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context2.next = 8;
              return derivativesSvc.getFormats(token.access_token);

            case 8:
              response = _context2.sent;


              res.json(response);

              _context2.next = 16;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2['catch'](0);


              res.status(_context2.t0.statusCode || 500);
              res.json(_context2.t0);

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this, [[0, 12]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /metadata/{urn}
  // Get design metadata
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/metadata/:urn', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
      var urn, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              urn = req.params.urn;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context3.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context3.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context3.next = 9;
              return derivativesSvc.getMetadata(token.access_token, urn);

            case 9:
              response = _context3.sent;


              res.json(response);

              _context3.next = 17;
              break;

            case 13:
              _context3.prev = 13;
              _context3.t0 = _context3['catch'](0);


              res.status(_context3.t0.statusCode || 500);
              res.json(_context3.t0);

            case 17:
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
  // GET /manifest/{urn}
  // Get design manifest
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/manifest/:urn', function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
      var urn, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              urn = req.params.urn;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context4.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context4.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context4.next = 9;
              return derivativesSvc.getManifest(token.access_token, urn);

            case 9:
              response = _context4.sent;


              res.json(response);

              _context4.next = 17;
              break;

            case 13:
              _context4.prev = 13;
              _context4.t0 = _context4['catch'](0);


              res.status(_context4.t0.statusCode || 500);
              res.json(_context4.t0);

            case 17:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[0, 13]]);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /hierarchy/{urn}/{guid}
  // Get hierarchy for design
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hierarchy/:urn/:guid', function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
      var urn, guid, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              urn = req.params.urn;
              guid = req.params.guid;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context5.next = 6;
              return forgeSvc.get2LeggedToken();

            case 6:
              token = _context5.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context5.next = 10;
              return derivativesSvc.getHierarchy(token.access_token, urn, guid);

            case 10:
              response = _context5.sent;


              res.json(response);

              _context5.next = 19;
              break;

            case 14:
              _context5.prev = 14;
              _context5.t0 = _context5['catch'](0);


              console.log(_context5.t0);

              res.status(_context5.t0.statusCode || 500);
              res.json(_context5.t0);

            case 19:
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
  // GET /properties/{urn}/{guid}
  // Get properties for design
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/properties/:urn/:guid', function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
      var urn, guid, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              urn = req.params.urn;
              guid = req.params.guid;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context6.next = 6;
              return forgeSvc.get2LeggedToken();

            case 6:
              token = _context6.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context6.next = 10;
              return derivativesSvc.getProperties(token.access_token, urn, guid);

            case 10:
              response = _context6.sent;


              res.json(response);

              _context6.next = 18;
              break;

            case 14:
              _context6.prev = 14;
              _context6.t0 = _context6['catch'](0);


              res.status(_context6.t0.statusCode || 500);
              res.json(_context6.t0);

            case 18:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this, [[0, 14]]);
    }));

    return function (_x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /manifest/{urn}
  // Delete design manifest
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/manifest/:urn', function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res) {
      var urn, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              urn = req.params.urn;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context7.next = 5;
              return forgeSvc.get2LeggedToken();

            case 5:
              token = _context7.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context7.next = 9;
              return derivativesSvc.deleteManifest(token.access_token, urn);

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
  // GET /download
  // Get download uri for derivative resource
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/download', function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res) {
      var urn, filename, derivativeUrn, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              urn = req.query.urn;
              filename = req.query.filename;
              derivativeUrn = req.query.derivativeUrn;
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context8.next = 7;
              return forgeSvc.get2LeggedToken();

            case 7:
              token = _context8.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context8.next = 11;
              return derivativesSvc.download(token.access_token, urn, derivativeUrn);

            case 11:
              response = _context8.sent;


              res.set('Content-Type', 'application/obj');

              res.set('Content-Disposition', 'attachment filename="' + filename + '"');

              res.end(response);

              _context8.next = 21;
              break;

            case 17:
              _context8.prev = 17;
              _context8.t0 = _context8['catch'](0);


              res.status(_context8.t0.statusCode || 500);
              res.json(_context8.t0);

            case 21:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this, [[0, 17]]);
    }));

    return function (_x15, _x16) {
      return _ref8.apply(this, arguments);
    };
  }());

  /////////////////////////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(req, res) {
      var urn, options, forgeSvc, token, derivativesSvc, response;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              urn = req.params.urn;
              options = {
                width: req.query.width || 100,
                height: req.query.height || 100
              };
              forgeSvc = _SvcManager2.default.getService('ForgeSvc');
              _context9.next = 6;
              return forgeSvc.get2LeggedToken();

            case 6:
              token = _context9.sent;
              derivativesSvc = _SvcManager2.default.getService('DerivativesSvc');
              _context9.next = 10;
              return derivativesSvc.getThumbnail(token.access_token, urn, options);

            case 10:
              response = _context9.sent;


              res.end(response);

              _context9.next = 18;
              break;

            case 14:
              _context9.prev = 14;
              _context9.t0 = _context9['catch'](0);


              res.status(_context9.t0.statusCode || 500);
              res.json(_context9.t0);

            case 18:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this, [[0, 14]]);
    }));

    return function (_x17, _x18) {
      return _ref9.apply(this, arguments);
    };
  }());

  return router;
};