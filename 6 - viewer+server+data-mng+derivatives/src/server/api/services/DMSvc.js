
import ForgeDataManagement from 'forge-data-management'
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import request from 'request'
import util from 'util'

export default class DMSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  // DataManagement Service
  //
  /////////////////////////////////////////////////////////////////
  constructor(opts) {

    super(opts)
    
    this._config.endPoints = {

        user:            'https://developer.api.autodesk.com' + '/userprofile/'    + 'v1' + '/users/@me',

        hubs:            'https://developer.api.autodesk.com' + '/project/'        + 'v1' + '/hubs',
        projects:        'https://developer.api.autodesk.com' + '/project/'        + 'v1' + '/hubs/%s/projects',
        project:         'https://developer.api.autodesk.com' + '/project/'        + 'v1' + '/hubs/%s/projects/%s',
        storage:         'https://developer.api.autodesk.com' + '/data/'           + 'v1' + '/projects/%s/storage',
        folderContent:   'https://developer.api.autodesk.com' + '/data/'           + 'v1' + '/projects/%s/folders/%s/contents',
        itemVersions:    'https://developer.api.autodesk.com' + '/data/'           + 'v1' + '/projects/%s/items/%s/versions',
        versions:        'https://developer.api.autodesk.com' + '/data/'           + 'v1' + '/projects/%s/versions',
        items:           'https://developer.api.autodesk.com' + '/data/'           + 'v1' + '/projects/%s/items'
    }

    this._APIAuth =
      ForgeDataManagement.ApiClient.instance.authentications[
        'oauth2_application']

    this._projectsAPI = new ForgeDataManagement.ProjectsApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'DMSvc'
  }

  /////////////////////////////////////////////////////////////////
  // Returns current user profile
  //
  /////////////////////////////////////////////////////////////////
  getUser (token) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = this._config.endPoints.user

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Hubs
  //
  /////////////////////////////////////////////////////////////////
  getHubs (token) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = this._config.endPoints.hubs

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Projects for specific Hub
  //
  /////////////////////////////////////////////////////////////////
  getProjects (token, hubId) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.projects,
      hubId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Project content
  //
  /////////////////////////////////////////////////////////////////
  getProject (token, hubId, projectId) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.project,
      hubId, projectId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder content
  //
  /////////////////////////////////////////////////////////////////
  getFolderContent (token, projectId, folderId) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.folderContent,
      projectId, folderId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Versions for specific Item
  //
  /////////////////////////////////////////////////////////////////
  getVersions (token, projectId, itemId) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.itemVersions,
      projectId, itemId)

    return requestAsync({
      token: token,
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Storage location on OSS for DM
  //
  /////////////////////////////////////////////////////////////////
  createStorage (token, projectId, folderId, filename) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.storage,
      projectId)

    return requestAsync({
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + token
      },
      body: createStoragePayload(folderId, filename),
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Item
  //
  /////////////////////////////////////////////////////////////////
  createItem (
    token, projectId, folderId, objectId, filename, displayName = null) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.items,
      projectId)

    return requestAsync({
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + token
      },
      body: createItemPayload(
        folderId, objectId, filename),
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Version
  //
  /////////////////////////////////////////////////////////////////
  createVersion (
    token, projectId, itemId, objectId, filename) {

    this._APIAuth.accessToken = token

    //TODO: change to SDK code

    var url = util.format(
      this._config.endPoints.versions,
      projectId)

    return requestAsync({
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + token
      },
      body: createVersionPayload(
        itemId, objectId, filename),
      json: true,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Upload file to create new item or new version
  //
  /////////////////////////////////////////////////////////////////
  upload (token, projectId, folderId, file, displayName = null) {

    //TODO: change to SDK code

    return new Promise(async(resolve, reject) => {

      try {

        var filename = file.originalname

        console.log('UPLOAD')

        this._APIAuth.accessToken = token
        this._projectsAPI.postStorage(
          projectId,
          JSON.stringify(createStoragePayload (folderId, filename))).then(
            function (storage) {
              console.log('STORAGE DM')
              console.log(storage)
            })

        var storage = await this.createStorage(
          token, projectId, folderId, filename)

        var ossSvc = ServiceManager.getService('OssSvc')

        var objectId = ossSvc.parseObjectId(storage.id)

        console.log('PUT OBJ')

        var object = await ossSvc.putObject(
          token,
          objectId.bucketKey,
          objectId.objectKey,
          file)

        // look for items with the same displayName
        var items = await this.findItemsWithAttributes(
          token,
          projectId,
          folderId, {
            displayName: filename
          })

        if(items.length > 0) {

          var item = items[0]

          var version = await this.createVersion(
            token,
            projectId,
            item.id,
            storage.id,
            filename)

          var response = {
            version,
            storage,
            object,
            item
          }

          resolve(response)

        } else {

          var item = await this.createItem(
            token,
            projectId,
            folderId,
            storage.id,
            filename,
            displayName)

          var response = {
            storage,
            object,
            item
          }

          resolve(response)
        }

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Items matching search criteria
  //
  /////////////////////////////////////////////////////////////////
  findItemsWithAttributes (
    token, projectId, folderId, attributes, recursive = false) {

    return new Promise(async(resolve, reject) => {

      try {

        var folderItems = await this.getFolderContent(
          token, projectId, folderId)

        var tasks = folderItems.map((folderItem) => {

          if(folderItem.type === 'items') {

            var match = true

            for (var key in attributes) {

              if(attributes[key] !== folderItem.attributes[key]){

                match = false
              }
            }

            if(match) {

              return Promise.resolve(folderItem)

            } else {

              return Promise.resolve(null)
            }

          } else if (folderItem.type === 'folders' && recursive) {

            return findItemsWithAttributes (
              token,
              projectId,
              folderItem.id,
              recursive)

          } else {

            return Promise.resolve(null)
          }
        })

        var items = await Promise.all(tasks)

        items = items.filter((item) => {
          return item !== null
        })

        resolve(items)

      } catch (ex) {

        reject(ex)
      }
    })
  }
}

/////////////////////////////////////////////////////////////////
// Utils
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise( function(resolve, reject) {

    request({

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

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          var error = Array.isArray(body.errors) ?
            body.errors[0] :
            body.errors

          return reject(error)
        }

        if (response && [200, 201, 202].indexOf(
            response.statusCode) < 0) {

          return reject(response.statusMessage)
        }

        return resolve(body.data || body)

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}

/////////////////////////////////////////////////////////////////
// Creates storage payload
//
/////////////////////////////////////////////////////////////////
function createStoragePayload (folderId, filename) {

  return {
    data: {
      type: 'object',
      attributes: {
        name: filename
      },
      relationships: {
        target: {
          data: {
            type: 'folders',
            id: folderId
          }
        }
      }
    }
  }
}

/////////////////////////////////////////////////////////////////
// Creates item payload
//
/////////////////////////////////////////////////////////////////
function createItemPayload (
  folderId, objectId, filename, displayName = null) {
  
  return {
  
    jsonapi: {
      version: '1.0'
    },
    data: [
      {
        type: 'items',
        attributes: {
          name: filename,
          extension: {
            type: 'items:autodesk.core:File',
            version: '1.0'
          }
        },
        relationships: {
          tip: {
            data: {
              type: 'versions',
              id: '1'
            }
          },
          parent: {
            data: {
              type: 'folders',
              id: folderId
            }
          }
        }
      }
    ],
    included: [ {
        type: 'versions',
        id: '1',
        attributes: {
          name: displayName || filename
        },
        relationships: {
          storage: {
            data: {
              type: 'objects',
              id: objectId
            }
          }
        }
      }
    ]
  }
}

/////////////////////////////////////////////////////////////////
// Creates version payload
//
/////////////////////////////////////////////////////////////////
function createVersionPayload (
  itemId, objectId, filename) {

  return {

    jsonapi: {
      version: '1.0'
    },
    data: {
      type: 'versions',
      attributes: {
        name: filename,
        extension: {
          type: 'versions:autodesk.core:File',
          version: '1.0'
        }
      },
      relationships: {
        item: {
          data: {
            type: 'items',
            id: itemId
          }
        },
        storage: {
          data: {
            type: 'objects',
            id: objectId
          }
        }
      }
    }
  }
}