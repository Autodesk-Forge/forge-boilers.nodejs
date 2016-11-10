"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SvcManager = function () {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  function SvcManager() {
    _classCallCheck(this, SvcManager);

    this._services = {};
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////


  _createClass(SvcManager, [{
    key: "registerService",
    value: function registerService(svc) {

      this._services[svc.name()] = svc;
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: "getService",
    value: function getService(name) {

      if (this._services[name]) {

        return this._services[name];
      }

      return null;
    }
  }]);

  return SvcManager;
}();

var TheSvcManager = new SvcManager();

exports.default = TheSvcManager;