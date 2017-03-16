import recursive from 'recursive-readdir'
import archiver from 'archiver'
import BaseSvc from './BaseSvc'
import request from 'request'
import admZip from 'adm-zip'
import mkdirp from 'mkdirp'
import async from 'async'
import mzfs from 'mz/fs'
import path from 'path'
import util from 'util'
import zlib from 'zlib'
import _ from 'lodash'
import fs from 'fs'

export default class SVFDownloaderSvc extends BaseSvc {

  static get SERVICE_BASE_URL () {

    return 'https://developer.api.autodesk.com/viewingservice/v1'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'SVFDownloaderSvc'
  }

  ///////////////////////////////////////////////////////////////////
  // GET /viewingservice/v1/items/:encodedURN
  //
  ///////////////////////////////////////////////////////////////////
  getItem (token, urn) {

    var promise = new Promise((resolve, reject) => {

      const url = `${SVFDownloaderSvc.SERVICE_BASE_URL}/items/${urn}`

      request.get({
          url: url,
          headers: {
            'Authorization': 'Bearer ' + token
          },
          encoding: null

        }, (error, res, body) => {

          try {

            if (error || res.statusCode != 200) {

              error = error || {error: res.statusMessage || 'undefined'};

              error.statusCode = res.statusCode;

              reject(error)

            } else {

              resolve(body);
            }

          } catch(ex) {

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
  download (token, urn, directory) {

    var promise = new Promise((resolve, reject) => {

      mkdirp(directory, (error) => {

        if (error) {

          reject(error)

        } else {

          async.waterfall([

            (callback) => {

              this.parseViewable(token, directory, urn, true, callback)
            },

            (items, callback) => {

              this.downloadItems(token, items, directory, 10, callback)
            },

            (items, callback) => {

              this.parseManifest(items, callback)
            },

            (uris, callback) => {

              this.downloadItems(token, uris, directory, 10, callback)
            }
          ],

          (wfError, items) => {

            if (wfError) {

              reject(wfError)

            } else {

              this.readDir(directory).then((files) => {

                resolve(files)
              })
            }
          })
        }
      })
    })

    return promise
  }

  ////////////////////////////////////////////////////////////////////////
  // Extract items from viewable
  //
  ////////////////////////////////////////////////////////////////////////
  getViewable (token, urn, option, guid) {

    var promise = new Promise((resolve, reject) => {

      const url = `${SVFDownloaderSvc.SERVICE_BASE_URL}/${urn}`

      var parameters = (guid ? '?guid=' + guid : '');

      var optionStr = "";

      switch (option) {

        case 'status':
          optionStr = "/status";
          break;

        case 'all':
          optionStr = "/all";
          break;

        default:
          break;
      }

      request.get({
          url: url + optionStr + parameters,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        }, (error, res, body) => {

          this.handleResponse(
            error, res, body,
            resolve, reject)
        });
    });

    return promise
  }

  ////////////////////////////////////////////////////////////////////////
  // Extract items from viewable
  //
  ////////////////////////////////////////////////////////////////////////
  parseViewable (token, directory, urn, saveViewable, callback) {

    var filename = path.join(directory, 'viewable.json')

    this.getViewable(token, urn).then((viewable) => {

      if (viewable.progress == 'complete') {

        //optionally saves viewable on disk
        if(saveViewable) {

          fs.writeFile(filename,
            JSON.stringify(viewable, null, 2),
            (err) => { })
        }

        var items = this.getUrnRec(viewable)

        //removes model urn
        while(items[0] === urn) {

          items.shift();
        }

        var views = this.getViewsRec(
          viewable, viewable, directory)

        items = items.concat(views);

        // Add manifest & metadata files for f2d file
        items.forEach((item) => {

          if(typeof item === 'string') {

            if (path.extname(item) == '.f2d') {

              items.push(path.dirname(item) + '/manifest.json.gz');
              items.push(path.dirname(item) + '/metadata.json.gz');
            }
          }
        })

        callback(null, items)

      } else {

        callback ({error:'translation incomplete'}, null);
      }

    }, (error) =>{

      callback (error, null)
    })
  }

  ////////////////////////////////////////////////////////////////////////
  // Download all items to target directory
  //
  ////////////////////////////////////////////////////////////////////////
  downloadItems (token, items, directory, maxWorkers, callback) {

    //Download each item asynchronously
    async.mapLimit (items, maxWorkers, (item, mapCallback) => {

        if (typeof item != 'string' ) {

          mapCallback(null, item)

        } else {

          this.downloadItem(token, item, directory, mapCallback)
        }
      },
      //All tasks are done
      (err, results) => {

        if (err) {

          //error during download
          callback(err, null)

        } else {

          callback(null, results)
        }
      })
  }

  ////////////////////////////////////////////////////////////////////////
  // Grab all urn's from viewable recursively
  //
  ////////////////////////////////////////////////////////////////////////
  getUrnRec (item) {

    var urn =[];

    if (item.urn !== undefined) {

      urn.push(item.urn)
    }

    if(item.children !== undefined) {

      for(var key in item.children) {

        urn = urn.concat(this.getUrnRec(item.children[key]))
      }
    }

    return urn
  }

  ////////////////////////////////////////////////////////////////////////
  // Grab all views recursively
  //
  ////////////////////////////////////////////////////////////////////////
  getViewsRec (item, parentNode, directory) {

    var views = [];

    if (item.urn !== undefined) {

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

    if (item.children !== undefined ) {

      for(var key in item.children) {

        views = views.concat(this.getViewsRec(
          item.children[key], item, directory))
      }
    }

    return views
  }

  ////////////////////////////////////////////////////////////////////////
  // Download item to target directory
  //
  ////////////////////////////////////////////////////////////////////////
  downloadItem (token, item, directory, callback) {

    this.getItem(token, item).then((data) => {

      var fullFileName = path.join(directory,
        item.substring(item.indexOf ('/output/') + 8));

      try {

        mkdirp (path.dirname(fullFileName), (err) => {

          if(err) {

            callback(err, null)

          } else {

            fs.writeFile(fullFileName, data, (err) => {

              callback(null, {
                urn: item,
                path: fullFileName
              });
            });
          }
        })

      } catch(err) {

        callback(err, null);
      }
    }, (error) => {

      console.log('Item Download failed: ' + item);
      console.log(error);

      var fullFileName = path.join(directory,
        item.substring (item.indexOf ('/output/') + 8));

      callback(null, {
        urn: item,
        path: fullFileName,
        error: error
      });
    })
  }

  ////////////////////////////////////////////////////////////////////////
  // Collect additional elements from manifest
  //
  ////////////////////////////////////////////////////////////////////////
  parseManifest (items, callback) {

    async.parallel([

      (parallelCallback) => {

        var svf = this.filterItems(items, '.*\\.svf$');

        async.map (svf, (item, mapCallback) => {

          this.readSvfItem(item, mapCallback)

        }, (err, uris) => {

          if(err) {

            parallelCallback(err, null)

          } else {

            var out = [];
            out = out.concat.apply(out, uris);
            parallelCallback(null, out);
          }
        })
      },

      (parallelCallback) => {

        var f2d = this.filterItems(items, '.*\\.f2d$');

        async.map (f2d, (item, mapCallback) => {

          this.readF2dfItem(item, mapCallback)

        }, (err, uris) => {

          if(err) {

            parallelCallback(err, null)

          } else {

            var out = [];
            out = out.concat.apply(out, uris);
            parallelCallback(null, out);
          }
        })
      },

      (parallelCallback) => {

          var manifest = this.filterItems(items, '.*manifest\\.json\\.gz$');

          async.map (manifest, (item, mapCallback) => {

            this.readManifest(item, mapCallback)

          }, (err, uris) => {

            if(err) {

              parallelCallback(err, null)

            } else {

              var out = [];
              out = out.concat.apply(out, uris);
              parallelCallback(null, out);
            }
          })
        }
      ],

      (err, uris) => {

        if(err) {

          callback(err, null)

        } else {

          var out = items;
          out = out.concat.apply(out, uris);
          callback(null, out);
        }
      })
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  filterItems (items, filter) {

    return items.filter ((item) => {

      return (new RegExp(filter).test(item.path) && item.urn)
    })
  }

  ////////////////////////////////////////////////////////////////////////
  // Extract URI's from manifest recursively
  //
  ////////////////////////////////////////////////////////////////////////
  getUriRec (manifest, urnParent) {

    var uris = [];

    // embed:/ - Resource embedded into the svf file, so just ignore it
    if(manifest.URI !== undefined && manifest.URI.indexOf('embed:/') != 0)
      uris.push(path.normalize(
        urnParent + '/' + manifest.URI).split(path.sep).join ('/'));

    if(manifest.assets !== undefined) {

      for (var key in manifest.assets) {

        uris = uris.concat(this.getUriRec(
          manifest.assets[key], urnParent))
      }
    }

    return uris
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readSvfItem (item, callback) {

    var uris = [];

    // Get manifest file
    fs.readFile(item.path, (err, content) => {

      var zip = new admZip(content)

      var entries = zip.getEntries()

      entries.forEach((entry) => {

        if (!entry.isDirectory) {

          if (entry.entryName === 'manifest.json' ) {

            var manifest = JSON.parse(entry.getData().toString('utf8'));

            uris = uris.concat(this.getUriRec(
              manifest, path.dirname(item.urn)))
          }
        }
      })

      uris = uris.filter((uri) => {

        return uri.startsWith('urn:')
      })

      callback(null, uris)
    })
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readF2dfItem (item, callback) {

    callback(null, [])
  }

  ////////////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////////////
  readManifest (item, callback) {

    fs.readFile(item.path, (err, content) => {

      zlib.unzip (content, (err, data) => {

        if(err || !data) {

          callback(null, [])
        }

        var manifest = JSON.parse(data)

        var uris = this.getUriRec(manifest, path.dirname(item.urn));

        uris = uris.filter((uri) =>{

          return uri.startsWith('urn:');
        })

        callback(null, uris)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
   handleResponse(error, res, body, resolve, reject) {

    if (error || res.statusCode != 200) {

      try {

        if(res) {

          error = error || {error: res.statusMessage}

          error.statusCode = res.statusCode || 204

          reject(error)

        } else {

          reject({
            statusCode: 204,
            message: 'Unspecified Error'
          });
        }

      } catch(ex) {

        reject(ex)
      }

    } else {

      try {

        resolve(body ? JSON.parse(body) : '')

      } catch(ex) {

        reject(ex)
      }
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createZip (root, files, zipfile) {

    return new Promise((resolve, reject) => {

      try{

        var output = mzfs.createWriteStream(zipfile)

        var archive = archiver('zip');

        output.on('close', function() {

          return resolve();
        });

        archive.on('error', function(err) {

          return reject(err);
        });

        archive.pipe(output);

        if (files) {

          files.forEach((file) => {

            try{

              var rs = mzfs.createReadStream(file)

              archive.append(rs, {
                name: file.replace(root, '')
              })

            } catch(ex){

              console.log(ex)
            }
          })

        } else {

          archive.bulk([ {
            expand: false,
            src: [root + '/*']
          }])

          //archive.glob('**/*', {
          //  cwd: root
          //}, {})
        }

        archive.finalize()

      } catch (ex) {

        return reject(ex);
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  readDir (path, opts = null) {

    return new Promise((resolve, reject) => {

      recursive(path, (err, files) => {

        if (err) {

          return reject(err)
        }

        resolve (files)
      })
    })
  }
}

