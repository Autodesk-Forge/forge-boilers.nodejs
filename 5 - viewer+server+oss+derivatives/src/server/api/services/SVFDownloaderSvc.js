import BaseSvc from './BaseSvc'
import request from 'request'
import admZip from 'adm-zip'
import mkdirp from "mkdirp"
import async from 'async'
import path from 'path'
import util from 'util'
import zlib from 'zlib'
import util from 'util'
import _ from 'lodash'
import fs from 'fs'

export default class SVFDownloaderSvc extends BaseSvc {

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

    return 'SVFDownloaderSvc'
  }

  ///////////////////////////////////////////////////////////////////
  //
  // API:
  // GET /viewingservice/v1/items/:encodedURN
  //
  ///////////////////////////////////////////////////////////////////
  getItem = function (urn) {

    var promise = new Promise(function(resolve, reject) {

      var itemUrl = util.format(
        config.endPoints.items, urn);

      request.get({
          url: itemUrl,
          headers: {
            'Authorization': 'Bearer ' + _token
          },
          encoding: null
        },
        function (error, res, body) {

          try {

            if (error || res.statusCode != 200) {

              error = error || {error: res.statusMessage || 'undefined'};

              error.statusCode = res.statusCode;

              reject(error);
            }
            else {

              resolve(body);
            }
          }
          catch(ex) {

            reject({error: ex});
          }
        });
    });

    return promise;
  }
  
  ////////////////////////////////////////////////////////////////////////
  // Download specified model from URN to target directory
  //
  ////////////////////////////////////////////////////////////////////////
  download = function(urn, directory) {

    var promise = new Promise(function(resolve, reject) {

      mkdirp(directory, function (error) {

        if (error) {

          reject(error);
        }
        else {

          async.waterfall([

              function(callback) {

                parseViewable(directory, urn, true, callback);
              },
              function(items, callback) {

                downloadItems(items, directory, 10, callback);
              },
              function (items, callback) {

                parseManifest(items, callback);
              },
              function (uris, callback) {

                downloadItems(uris, directory, 10, callback);
              }
            ],
            function (wfError, items) {

              if(wfError) {

                reject(wfError);
              }
              else {

                resolve(items);
              }
            }
          );
        }
      });
    });

    return promise;
  }

  ////////////////////////////////////////////////////////////////////////
  // Extract items from viewable
  //
  ////////////////////////////////////////////////////////////////////////
  parseViewable(directory, urn, saveViewable, callback) {

    var filename = path.join(
      directory,
      'viewable.json');

    this.getViewable(urn).then(

      function(viewable) {

        if (viewable.progress == 'complete') {

          //optionally saves viewable on disk
          if(saveViewable) {

            fs.writeFile(filename,
              JSON.stringify(viewable, null, 2),
              function (err) {

              });
          }

          var items = getUrnRec(viewable);

          //removes model urn
          while(items[0] === urn) {

            items.shift();
          }

          var views = getViewsRec(viewable, viewable, directory);

          items = items.concat(views);

          // Add manifest & metadata files for f2d file
          items.forEach(function(item) {

            if(typeof item === 'string') {

              if (path.extname(item) == '.f2d') {

                items.push(path.dirname(item) + '/manifest.json.gz');
                items.push(path.dirname(item) + '/metadata.json.gz');
              }
            }
          })

          callback(null, items);
        }
        else {

          callback ({error:'translation incomplete'}, null);
        }
      },
      function(error){

        callback(error, null);
      });
  }

  ////////////////////////////////////////////////////////////////////////
  // Download all items to target directory
  //
  ////////////////////////////////////////////////////////////////////////
  downloadItems(items, directory, maxWorkers, callback) {

    //Download each item asynchronously
    async.mapLimit (items, maxWorkers,
      function (item, mapCallback) {

        if (typeof item != 'string' ) {

          mapCallback(null, item);
        }
        else {

          downloadItem(item, directory, mapCallback);
        }
      },
      //All tasks are done
      function (err, results) {

        if (err) {

          //error during download
          callback(err, null) ;
        }
        else {

          callback(null, results);
        }
      }
    );
  }

  ////////////////////////////////////////////////////////////////////////
  // Grab all urn's from viewable recursively
  //
  ////////////////////////////////////////////////////////////////////////
  function getUrnRec(item) {

    var urn =[];

    if (item.urn !== undefined )
      urn.push(item.urn);

    if(item.children !== undefined) {

      for(var key in item.children)
        urn = urn.concat(getUrnRec(
          item.children[key]));
    }

    return urn;
  }

  ////////////////////////////////////////////////////////////////////////
  // Grab all views recursively
  //
  ////////////////////////////////////////////////////////////////////////
  getViewsRec(item, parentNode, directory) {

    var views = [];

    if(item.urn !== undefined) {

      var ext = path.extname(item.urn);

      if (ext === '.svf' || ext === '.f2d') {

        var fullFileName = path.join(directory,
          item.urn.substring(item.urn.indexOf ('/output/') + 8));

        views.push({
          path: fullFileName,
          name: parentNode.name,
          type: (ext === '.svf' ? '3d' : '2d')
        });
      }
    }

    if(item.children !== undefined ) {

      for(var key in item.children)

        views = views.concat(getViewsRec(
          item.children[key], item, directory));
    }

    return views;
  }

  ////////////////////////////////////////////////////////////////////////
  // Download item to target directory
  //
  ////////////////////////////////////////////////////////////////////////
  downloadItem(item, directory, callback) {

    this.getItem(item).then(

      function(data) {

        var fullFileName = path.join(directory,
          item.substring(item.indexOf ('/output/') + 8));

        try {

          mkdirp (path.dirname(fullFileName), function (err) {

            if(err) {

              callback(err, null);
            }
            else {

              fs.writeFile(fullFileName, data, function (err) {

                callback(null, {
                  urn: item,
                  path: fullFileName
                });
              });
            }
          });

        } catch(err) {

          callback(err, null);
        }
      },

      function(error) {

        console.log('Item Download failed: ' + item);
        console.log(error);

        var fullFileName = path.join(directory,
          item.substring (item.indexOf ('/output/') + 8));

        callback(null, {
          urn: item,
          path: fullFileName,
          error: error
        });
      }
    );
  }

  ////////////////////////////////////////////////////////////////////////
  // Collect additional elements from manifest
  //
  ////////////////////////////////////////////////////////////////////////
  parseManifest(items, callback) {

    async.parallel([

        function (parallelCallback) {

          var svf = filterItems(items, '.*\\.svf$');

          async.map (
            svf,
            function (item, mapCallback) {

              readSvfItem(item, mapCallback);
            },
            function(err, uris) {

              if(err) {

                parallelCallback(err, null) ;
              }
              else {

                var out = [];
                out = out.concat.apply(out, uris);
                parallelCallback(null, out);
              }
            }
          );
        },

        function (parallelCallback) {

          var f2d = filterItems(items, '.*\\.f2d$');

          async.map (
            f2d,
            function (item, mapCallback) {

              readF2dfItem(item, mapCallback);
            },
            function(err, uris) {

              if(err) {

                parallelCallback(err, null) ;
              }
              else {

                var out = [];
                out = out.concat.apply(out, uris);
                parallelCallback(null, out);
              }
            }
          );
        },

        function (parallelCallback) {

          var manifest = filterItems(items, '.*manifest\\.json\\.gz$');

          async.map (
            manifest,
            function (item, mapCallback)
            {
              readManifest(item, mapCallback);
            },
            function(err, uris) {

              if(err) {

                parallelCallback(err, null) ;
              }
              else {

                var out = [];
                out = out.concat.apply(out, uris);
                parallelCallback(null, out);
              }
            }
          );
        }
      ],
      function(err, uris) {

        if(err) {

          callback(err, null);
        }
        else {

          var out = items;
          out = out.concat.apply(out, uris);
          callback(null, out);
        }
      }
    );
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  filterItems(items, filter) {

    return items.filter (function (item) {

      return (new RegExp(filter).test(item.path) && item.urn);
    });
  }

  ////////////////////////////////////////////////////////////////////////
  // Extract URI's from manifest recursively
  //
  ////////////////////////////////////////////////////////////////////////
  getUriRec(manifest, urnParent) {

    var uris = [];

    // embed:/ - Resource embedded into the svf file, so just ignore it
    if(manifest.URI !== undefined && manifest.URI.indexOf('embed:/') != 0)
      uris.push(path.normalize(
        urnParent + '/' + manifest.URI).split(path.sep).join ('/'));

    if(manifest.assets !== undefined) {

      for (var key in manifest.assets)
        uris = uris.concat(getUriRec(
          manifest.assets[key], urnParent)) ;
    }

    return uris;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readSvfItem(item, callback) {

    console.log(item)

    var uris = [];

    // Get manifest file
    fs.readFile(item.path, function (err, content) {

      var zip = new admZip(content);

      var entries = zip.getEntries();

      entries.forEach(function(entry) {

        if (!entry.isDirectory) {

          if (entry.entryName === 'manifest.json' ) {

            var manifest = JSON.parse(entry.getData().toString('utf8'));

            uris = uris.concat(getUriRec(manifest, path.dirname(item.urn)));
          }
        }
      });

      uris = uris.filter(function(uri) {

        return uri.startsWith('urn:');
      });

      callback(null, uris);
    });
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readF2dfItem(item, callback) {

    callback(null, []);
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readManifest(item, callback) {

    fs.readFile(item.path, function (err, content) {

      zlib.unzip (content, function (err, unzipedContent) {

        var manifest = JSON.parse(unzipedContent);

        var uris = getUriRec(manifest, path.dirname(item.urn));

        uris = uris.filter(function(uri) {

          return uri.startsWith('urn:');
        });

        callback(null, uris);
      })
    })
  }
}

