'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _forgeOauth = require('forge-oauth2');

var _forgeOauth2 = _interopRequireDefault(_forgeOauth);

var _BaseSvc2 = require('./BaseSvc');

var _BaseSvc3 = _interopRequireDefault(_BaseSvc2);

var _memoizee = require('memoizee');

var _memoizee2 = _interopRequireDefault(_memoizee);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } ///////////////////////////////////////////////////////////////////////
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


var ForgeSvc = function (_BaseSvc) {
  _inherits(ForgeSvc, _BaseSvc);

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  function ForgeSvc(config) {
    _classCallCheck(this, ForgeSvc);

    var _this = _possibleConstructorReturn(this, (ForgeSvc.__proto__ || Object.getPrototypeOf(ForgeSvc)).call(this, config));

    _this._2leggedAPI = new _forgeOauth2.default.TwoLeggedApi();

    // will return same result if query arguments are
    // identical { sessionId, refreshToken }

    _this.__refresh3LeggedTokenMemo = (0, _memoizee2.default)(function (session, scope) {

      return _this.__refresh3LeggedToken(session, scope);
    }, {

      normalizer: function normalizer(args) {

        var memoId = {
          refreshToken: args[0].forge.refreshToken,
          socketId: args[0].socketId
        };

        return JSON.stringify(JSON.stringify(memoId));
      },
      promise: true
    });
    return _this;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////


  _createClass(ForgeSvc, [{
    key: 'name',
    value: function name() {

      return 'ForgeSvc';
    }

    /////////////////////////////////////////////////////////////////
    // Return token expiry in seconds
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getExpiry',
    value: function getExpiry(token) {

      var age = (0, _moment2.default)().diff(token.time_stamp, 'seconds');

      return token.expires_in - age;
    }

    /////////////////////////////////////////////////////////////////
    // Stores 2Legged token
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'set2LeggedToken',
    value: function set2LeggedToken(token) {

      //store current time
      token.time_stamp = (0, _moment2.default)().format();

      this._2LeggedToken = token;
    }

    /////////////////////////////////////////////////////////////////
    // return master token (full privileges),
    // refresh automatically if expired
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'get2LeggedToken',
    value: function get2LeggedToken() {
      var _this2 = this;

      return new Promise(function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
          var token;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  token = _this2._2LeggedToken;

                  if (token) {
                    _context.next = 7;
                    break;
                  }

                  _context.next = 5;
                  return _this2.request2LeggedToken(_this2._config.oauth.scope.join(' '));

                case 5:
                  token = _context.sent;


                  _this2.set2LeggedToken(token);

                case 7:
                  if (!(_this2.getExpiry(token) < 60)) {
                    _context.next = 12;
                    break;
                  }

                  _context.next = 10;
                  return _this2.request2LeggedToken(_this2._config.oauth.scope.join(' '));

                case 10:
                  token = _context.sent;


                  _this2.set2LeggedToken(token);

                case 12:

                  resolve(token);

                  _context.next = 18;
                  break;

                case 15:
                  _context.prev = 15;
                  _context.t0 = _context['catch'](0);


                  reject(_context.t0);

                case 18:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2, [[0, 15]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }

    /////////////////////////////////////////////////////////////////
    // Request new 2-legged with specified scope
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'request2LeggedToken',
    value: function request2LeggedToken(scope) {

      return this._2leggedAPI.authenticate(this._config.oauth.clientId, this._config.oauth.clientSecret, 'client_credentials', {
        scope: scope
      });
    }

    /////////////////////////////////////////////////////////////////
    // Stores 3Legged token
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'set3LeggedTokenMaster',
    value: function set3LeggedTokenMaster(session, token) {

      //store current time
      token.time_stamp = (0, _moment2.default)().format();

      session.forge = session.forge || {
        refreshToken: token.refresh_token
      };

      session.forge.masterToken = token;
    }

    /////////////////////////////////////////////////////////////////
    // Get 3Legged token
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'get3LeggedTokenMaster',
    value: function get3LeggedTokenMaster(session) {
      var _this3 = this;

      return new Promise(function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var token;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;

                  if (session.forge) {
                    _context2.next = 3;
                    break;
                  }

                  return _context2.abrupt('return', reject({
                    status: 404,
                    msg: 'Not Found'
                  }));

                case 3:
                  token = session.forge.masterToken;

                  if (!(_this3.getExpiry(token) < 60)) {
                    _context2.next = 9;
                    break;
                  }

                  _context2.next = 7;
                  return _this3.refresh3LeggedToken(session, _this3._config.oauth.scope.join(' '));

                case 7:
                  token = _context2.sent;


                  _this3.set3LeggedTokenMaster(session, token);

                case 9:

                  resolve(token);

                  _context2.next = 15;
                  break;

                case 12:
                  _context2.prev = 12;
                  _context2.t0 = _context2['catch'](0);


                  reject(_context2.t0);

                case 15:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this3, [[0, 12]]);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }

    /////////////////////////////////////////////////////////////////
    // Stores 3Legged token for client (reduced privileges)
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'set3LeggedTokenClient',
    value: function set3LeggedTokenClient(session, token) {

      //store current time
      token.time_stamp = (0, _moment2.default)().format();

      session.forge.clientToken = token;
    }

    /////////////////////////////////////////////////////////////////
    // Get 3Legged token for client (reduced privileges)
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'get3LeggedTokenClient',
    value: function get3LeggedTokenClient(session) {
      var _this4 = this;

      return new Promise(function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(resolve, reject) {
          var clientToken, token;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;

                  if (session.forge) {
                    _context3.next = 5;
                    break;
                  }

                  return _context3.abrupt('return', reject({
                    status: 404,
                    msg: 'Not Found'
                  }));

                case 5:
                  if (session.forge.clientToken) {
                    _context3.next = 10;
                    break;
                  }

                  _context3.next = 8;
                  return _this4.refresh3LeggedToken(session, 'data:read');

                case 8:
                  clientToken = _context3.sent;


                  _this4.set3LeggedTokenClient(session, clientToken);

                case 10:
                  token = session.forge.clientToken;

                  if (!(_this4.getExpiry(token) < 60)) {
                    _context3.next = 16;
                    break;
                  }

                  _context3.next = 14;
                  return _this4.refresh3LeggedToken(session, 'data:read');

                case 14:
                  token = _context3.sent;


                  _this4.set3LeggedTokenClient(session, token);

                case 16:

                  resolve(token);

                  _context3.next = 22;
                  break;

                case 19:
                  _context3.prev = 19;
                  _context3.t0 = _context3['catch'](0);


                  reject(_context3.t0);

                case 22:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this4, [[0, 19]]);
        }));

        return function (_x5, _x6) {
          return _ref3.apply(this, arguments);
        };
      }());
    }

    /////////////////////////////////////////////////////////////////
    // Delete 3 legged token (user logout)
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'delete3LeggedToken',
    value: function delete3LeggedToken(session) {

      session.forge = null;
    }

    /////////////////////////////////////////////////////////////////
    // Ensure returned token has requested scope
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'refresh3LeggedToken',
    value: function refresh3LeggedToken(session, requestedScope) {
      var _this5 = this;

      return new Promise(function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(resolve, reject) {
          var token;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  token = null;

                case 2:
                  if (!true) {
                    _context4.next = 13;
                    break;
                  }

                  _context4.next = 5;
                  return _this5.__refresh3LeggedTokenMemo(session, requestedScope);

                case 5:
                  token = _context4.sent;

                  if (!(token.scope !== requestedScope)) {
                    _context4.next = 10;
                    break;
                  }

                  _this5.sleep(1000);

                  _context4.next = 11;
                  break;

                case 10:
                  return _context4.abrupt('break', 13);

                case 11:
                  _context4.next = 2;
                  break;

                case 13:

                  resolve(token);

                  _context4.next = 19;
                  break;

                case 16:
                  _context4.prev = 16;
                  _context4.t0 = _context4['catch'](0);


                  reject(_context4.t0);

                case 19:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this5, [[0, 16]]);
        }));

        return function (_x7, _x8) {
          return _ref4.apply(this, arguments);
        };
      }());
    }

    /////////////////////////////////////////////////////////////////
    // Refresh 3-legged token with specified scope
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: '__refresh3LeggedToken',
    value: function __refresh3LeggedToken(session, scope) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {

        var url = _this6._config.oauth.baseUri + _this6._config.oauth.refreshTokenUri;

        (0, _request2.default)({
          url: url,
          method: "POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          json: true,
          form: {
            client_secret: _this6._config.oauth.clientSecret,
            client_id: _this6._config.oauth.clientId,
            refresh_token: session.forge.refreshToken,
            grant_type: 'refresh_token',
            scope: scope
          }

        }, function (err, response, body) {

          try {

            if (err) {

              console.log('error: ' + url);
              console.log(err);

              return reject(err);
            }

            if (body && body.errors) {

              console.log('body error: ' + url);
              console.log(body.errors);

              return reject(body.errors);
            }

            if ([200, 201, 202].indexOf(response.statusCode) < 0) {

              return reject(response);
            }

            session.forge.refreshToken = body.refresh_token;

            body.scope = scope;

            return resolve(body);
          } catch (ex) {

            return reject(ex);
          }
        });
      });
    }

    ///////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////

  }, {
    key: 'sleep',
    value: function sleep(ms) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, ms);
      });
    }
  }]);

  return ForgeSvc;
}(_BaseSvc3.default);

exports.default = ForgeSvc;