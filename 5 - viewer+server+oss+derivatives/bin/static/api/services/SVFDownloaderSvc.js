'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseSvc2 = require('./BaseSvc');

var _BaseSvc3 = _interopRequireDefault(_BaseSvc2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SVFDownloaderSvc = function (_BaseSvc) {
  _inherits(SVFDownloaderSvc, _BaseSvc);

  _createClass(SVFDownloaderSvc, null, [{
    key: 'SERVICE_BASE_URL',
    get: function get() {

      return 'https://developer.api.autodesk.com/modelderivative/v2';
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }]);

  function SVFDownloaderSvc(config) {
    _classCallCheck(this, SVFDownloaderSvc);

    var _this = _possibleConstructorReturn(this, (SVFDownloaderSvc.__proto__ || Object.getPrototypeOf(SVFDownloaderSvc)).call(this, config));

    _this._APIAuth = ForgeModelDerivative.ApiClient.instance.authentications['oauth2_application'];

    _this._derivativesAPI = new ForgeModelDerivative.DerivativesApi();
    return _this;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////


  _createClass(SVFDownloaderSvc, [{
    key: 'name',
    value: function name() {

      return 'SVFDownloaderSvc';
    }

    ///////////////////////////////////////////////////////////////////
    //
    // API:
    // GET /viewingservice/v1/items/:encodedURN
    //
    ///////////////////////////////////////////////////////////////////

  }, {
    key: 'getItem',
    value: function getItem(urn) {

      var promise = new Promise(function (resolve, reject) {

        var itemUrl = _util2.default.format(config.endPoints.items, urn);

        _request2.default.get({
          url: itemUrl,
          headers: {
            'Authorization': 'Bearer ' + _token
          },
          encoding: null
        }, function (error, res, body) {

          try {

            if (error || res.statusCode != 200) {

              error = error || { error: res.statusMessage || 'undefined' };

              error.statusCode = res.statusCode;

              reject(error);
            } else {

              resolve(body);
            }
          } catch (ex) {

            reject({ error: ex });
          }
        });
      });

      return promise;
    }

    ////////////////////////////////////////////////////////////////////////
    // Download specified model from URN to target directory
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'download',
    value: function download(urn, directory) {

      var promise = new Promise(function (resolve, reject) {

        (0, _mkdirp2.default)(directory, function (error) {

          if (error) {

            reject(error);
          } else {

            _async2.default.waterfall([function (callback) {

              parseViewable(directory, urn, true, callback);
            }, function (items, callback) {

              downloadItems(items, directory, 10, callback);
            }, function (items, callback) {

              parseManifest(items, callback);
            }, function (uris, callback) {

              downloadItems(uris, directory, 10, callback);
            }], function (wfError, items) {

              if (wfError) {

                reject(wfError);
              } else {

                resolve(items);
              }
            });
          }
        });
      });

      return promise;
    }

    ////////////////////////////////////////////////////////////////////////
    // Extract items from viewable
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'parseViewable',
    value: function parseViewable(directory, urn, saveViewable, callback) {

      var filename = _path2.default.join(directory, 'viewable.json');

      this.getViewable(urn).then(function (viewable) {

        if (viewable.progress == 'complete') {

          //optionally saves viewable on disk
          if (saveViewable) {

            _fs2.default.writeFile(filename, JSON.stringify(viewable, null, 2), function (err) {});
          }

          var items = getUrnRec(viewable);

          //removes model urn
          while (items[0] === urn) {

            items.shift();
          }

          var views = getViewsRec(viewable, viewable, directory);

          items = items.concat(views);

          // Add manifest & metadata files for f2d file
          items.forEach(function (item) {

            if (typeof item === 'string') {

              if (_path2.default.extname(item) == '.f2d') {

                items.push(_path2.default.dirname(item) + '/manifest.json.gz');
                items.push(_path2.default.dirname(item) + '/metadata.json.gz');
              }
            }
          });

          callback(null, items);
        } else {

          callback({ error: 'translation incomplete' }, null);
        }
      }, function (error) {

        callback(error, null);
      });
    }

    ////////////////////////////////////////////////////////////////////////
    // Download all items to target directory
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'downloadItems',
    value: function downloadItems(items, directory, maxWorkers, callback) {

      //Download each item asynchronously
      _async2.default.mapLimit(items, maxWorkers, function (item, mapCallback) {

        if (typeof item != 'string') {

          mapCallback(null, item);
        } else {

          downloadItem(item, directory, mapCallback);
        }
      },
      //All tasks are done
      function (err, results) {

        if (err) {

          //error during download
          callback(err, null);
        } else {

          callback(null, results);
        }
      });
    }

    ////////////////////////////////////////////////////////////////////////
    // Grab all urn's from viewable recursively
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getUrnRec',
    value: function (_getUrnRec) {
      function getUrnRec(_x) {
        return _getUrnRec.apply(this, arguments);
      }

      getUrnRec.toString = function () {
        return _getUrnRec.toString();
      };

      return getUrnRec;
    }(function (item) {

      var urn = [];

      if (item.urn !== undefined) urn.push(item.urn);

      if (item.children !== undefined) {

        for (var key in item.children) {
          urn = urn.concat(getUrnRec(item.children[key]));
        }
      }

      return urn;
    })

    ////////////////////////////////////////////////////////////////////////
    // Grab all views recursively
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getViewsRec',
    value: function (_getViewsRec) {
      function getViewsRec(_x2, _x3, _x4) {
        return _getViewsRec.apply(this, arguments);
      }

      getViewsRec.toString = function () {
        return _getViewsRec.toString();
      };

      return getViewsRec;
    }(function (item, parentNode, directory) {

      var views = [];

      if (item.urn !== undefined) {

        var ext = _path2.default.extname(item.urn);

        if (ext === '.svf' || ext === '.f2d') {

          var fullFileName = _path2.default.join(directory, item.urn.substring(item.urn.indexOf('/output/') + 8));

          views.push({
            path: fullFileName,
            name: parentNode.name,
            type: ext === '.svf' ? '3d' : '2d'
          });
        }
      }

      if (item.children !== undefined) {

        for (var key in item.children) {

          views = views.concat(getViewsRec(item.children[key], item, directory));
        }
      }

      return views;
    })

    ////////////////////////////////////////////////////////////////////////
    // Download item to target directory
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'downloadItem',
    value: function downloadItem(item, directory, callback) {

      this.getItem(item).then(function (data) {

        var fullFileName = _path2.default.join(directory, item.substring(item.indexOf('/output/') + 8));

        try {

          (0, _mkdirp2.default)(_path2.default.dirname(fullFileName), function (err) {

            if (err) {

              callback(err, null);
            } else {

              _fs2.default.writeFile(fullFileName, data, function (err) {

                callback(null, {
                  urn: item,
                  path: fullFileName
                });
              });
            }
          });
        } catch (err) {

          callback(err, null);
        }
      }, function (error) {

        console.log('Item Download failed: ' + item);
        console.log(error);

        var fullFileName = _path2.default.join(directory, item.substring(item.indexOf('/output/') + 8));

        callback(null, {
          urn: item,
          path: fullFileName,
          error: error
        });
      });
    }

    ////////////////////////////////////////////////////////////////////////
    // Collect additional elements from manifest
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'parseManifest',
    value: function parseManifest(items, callback) {

      _async2.default.parallel([function (parallelCallback) {

        var svf = filterItems(items, '.*\\.svf$');

        _async2.default.map(svf, function (item, mapCallback) {

          readSvfItem(item, mapCallback);
        }, function (err, uris) {

          if (err) {

            parallelCallback(err, null);
          } else {

            var out = [];
            out = out.concat.apply(out, uris);
            parallelCallback(null, out);
          }
        });
      }, function (parallelCallback) {

        var f2d = filterItems(items, '.*\\.f2d$');

        _async2.default.map(f2d, function (item, mapCallback) {

          readF2dfItem(item, mapCallback);
        }, function (err, uris) {

          if (err) {

            parallelCallback(err, null);
          } else {

            var out = [];
            out = out.concat.apply(out, uris);
            parallelCallback(null, out);
          }
        });
      }, function (parallelCallback) {

        var manifest = filterItems(items, '.*manifest\\.json\\.gz$');

        _async2.default.map(manifest, function (item, mapCallback) {
          readManifest(item, mapCallback);
        }, function (err, uris) {

          if (err) {

            parallelCallback(err, null);
          } else {

            var out = [];
            out = out.concat.apply(out, uris);
            parallelCallback(null, out);
          }
        });
      }], function (err, uris) {

        if (err) {

          callback(err, null);
        } else {

          var out = items;
          out = out.concat.apply(out, uris);
          callback(null, out);
        }
      });
    }

    ////////////////////////////////////////////////////////////////////////
    //
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'filterItems',
    value: function filterItems(items, filter) {

      return items.filter(function (item) {

        return new RegExp(filter).test(item.path) && item.urn;
      });
    }

    ////////////////////////////////////////////////////////////////////////
    // Extract URI's from manifest recursively
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getUriRec',
    value: function (_getUriRec) {
      function getUriRec(_x5, _x6) {
        return _getUriRec.apply(this, arguments);
      }

      getUriRec.toString = function () {
        return _getUriRec.toString();
      };

      return getUriRec;
    }(function (manifest, urnParent) {

      var uris = [];

      // embed:/ - Resource embedded into the svf file, so just ignore it
      if (manifest.URI !== undefined && manifest.URI.indexOf('embed:/') != 0) uris.push(_path2.default.normalize(urnParent + '/' + manifest.URI).split(_path2.default.sep).join('/'));

      if (manifest.assets !== undefined) {

        for (var key in manifest.assets) {
          uris = uris.concat(getUriRec(manifest.assets[key], urnParent));
        }
      }

      return uris;
    })

    ////////////////////////////////////////////////////////////////////////
    //
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'readSvfItem',
    value: function readSvfItem(item, callback) {

      console.log(item);

      var uris = [];

      // Get manifest file
      _fs2.default.readFile(item.path, function (err, content) {

        var zip = new _admZip2.default(content);

        var entries = zip.getEntries();

        entries.forEach(function (entry) {

          if (!entry.isDirectory) {

            if (entry.entryName === 'manifest.json') {

              var manifest = JSON.parse(entry.getData().toString('utf8'));

              uris = uris.concat(getUriRec(manifest, _path2.default.dirname(item.urn)));
            }
          }
        });

        uris = uris.filter(function (uri) {

          return uri.startsWith('urn:');
        });

        callback(null, uris);
      });
    }

    ////////////////////////////////////////////////////////////////////////
    //
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'readF2dfItem',
    value: function readF2dfItem(item, callback) {

      callback(null, []);
    }

    ////////////////////////////////////////////////////////////////////////
    //
    //
    ////////////////////////////////////////////////////////////////////////

  }, {
    key: 'readManifest',
    value: function readManifest(item, callback) {

      _fs2.default.readFile(item.path, function (err, content) {

        _zlib2.default.unzip(content, function (err, unzipedContent) {

          var manifest = JSON.parse(unzipedContent);

          var uris = getUriRec(manifest, _path2.default.dirname(item.urn));

          uris = uris.filter(function (uri) {

            return uri.startsWith('urn:');
          });

          callback(null, uris);
        });
      });
    }
  }]);

  return SVFDownloaderSvc;
}(_BaseSvc3.default);

exports.default = SVFDownloaderSvc;