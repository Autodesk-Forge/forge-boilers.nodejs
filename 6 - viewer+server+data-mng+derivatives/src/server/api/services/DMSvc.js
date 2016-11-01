
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
  constructor(config) {

    super(config)

    this._APIAuth =
      ForgeDataManagement.ApiClient.instance.authentications[
        'oauth2_access_code']

    this._projectsAPI = new ForgeDataManagement.ProjectsApi()
    this._versionsAPI = new ForgeDataManagement.VersionsApi()
    this._foldersAPI = new ForgeDataManagement.FoldersApi()
    this._itemsAPI = new ForgeDataManagement.ItemsApi()
    this._hubsAPI = new ForgeDataManagement.HubsApi()
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

    let url = 'https://developer.api.autodesk.com' +
      '/userprofile/v1/users/@me'

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
  getHubs (token, opts = {}) {

    this._APIAuth.accessToken = token

    return this._hubsAPI.getHubs(opts)
  }

  /////////////////////////////////////////////////////////////////
  // Returns list of Projects for specific Hub
  //
  /////////////////////////////////////////////////////////////////
  getProjects (token, hubId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._hubsAPI.getHubProjects(hubId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Project content
  //
  /////////////////////////////////////////////////////////////////
  getProject (token, hubId, projectId) {

    this._APIAuth.accessToken = token

    return this._projectsAPI.getProject(hubId, projectId)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Folder content
  //
  /////////////////////////////////////////////////////////////////
  getFolderContent (token, projectId, folderId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._foldersAPI.getFolderContents(
      projectId, folderId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Versions for specific Item
  //
  /////////////////////////////////////////////////////////////////
  getVersions (token, projectId, itemId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._itemsAPI.getItemVersions(
      projectId, itemId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Storage location on OSS for DM
  //
  /////////////////////////////////////////////////////////////////
  createStorage (token, projectId, folderId, filename) {

    this._APIAuth.accessToken = token

    let payload = createStoragePayload (
      folderId, filename)

    return this._projectsAPI.postStorage(
      projectId, JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Item
  //
  /////////////////////////////////////////////////////////////////
  createItem (
    token, projectId, folderId, objectId, filename, displayName = null) {

    this._APIAuth.accessToken = token

    let payload = createItemPayload(
      folderId, objectId, filename)

    return this._projectsAPI.postItem(
      projectId, JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Version
  //
  /////////////////////////////////////////////////////////////////
  createVersion (
    token, projectId, itemId, objectId, filename) {

    this._APIAuth.accessToken = token

    let payload = createVersionPayload(
      itemId, objectId, filename)

    return this._projectsAPI.postVersion(
      projectId, JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Upload file to create new item or new version
  //
  /////////////////////////////////////////////////////////////////
  upload (token, projectId, folderId, file, displayName = null) {

    return new Promise(async(resolve, reject) => {

      try {

        var filename = file.originalname

        var storage = await this.createStorage(
          token, projectId, folderId, filename)

        var ossSvc = ServiceManager.getService('OssSvc')

        var objectId = ossSvc.parseObjectId(storage.data.id)

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
            storage.data.id,
            filename)

          var response = {
            version: version.data,
            storage: storage.data,
            item: item,
            object
          }

          resolve(response)

        } else {

          var item = await this.createItem(
            token,
            projectId,
            folderId,
            storage.data.id,
            filename,
            displayName)

          var response = {
            storage: storage.data,
            item: item.data,
            object
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

        var tasks = folderItems.data.map((folderItem) => {

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
// Creates storage payload
//
/////////////////////////////////////////////////////////////////
function createStoragePayload (folderId, filename) {

  return {
    data: {
      type: 'objects',
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