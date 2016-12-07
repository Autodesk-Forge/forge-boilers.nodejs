
import ForgeDataManagement from 'forge-data-management'
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import request from 'request'
import util from 'util'

export default class DMSvc extends BaseSvc {

  static get SERVICE_BASE_URL () {

    return 'https://developer.api.autodesk.com/data/v1'
  }

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

    const url = 'https://developer.api.autodesk.com' +
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
  // Returns Folder
  //
  /////////////////////////////////////////////////////////////////
  getFolder (token, projectId, folderId) {

    this._APIAuth.accessToken = token

    return this._foldersAPI.getFolder(
      projectId, folderId)
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
  // Returns Item details
  //
  /////////////////////////////////////////////////////////////////
  getItem (token, projectId, itemId) {

    this._APIAuth.accessToken = token

    return this._itemsAPI.getItem(
      projectId, itemId)
  }

  /////////////////////////////////////////////////////////////////
  // Returns Versions for specific Item
  //
  /////////////////////////////////////////////////////////////////
  getItemVersions (token, projectId, itemId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._itemsAPI.getItemVersions(
      projectId, itemId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Item
  //
  /////////////////////////////////////////////////////////////////
  deleteItem (token, projectId, itemId) {

    return new Promise(async(resolve, reject) => {

      try {

        this._APIAuth.accessToken = token

        const versionsRes = await this._itemsAPI.getItemVersions(
          projectId, itemId)

        const deleteTasks = versionsRes.data.map((version) => {

          return this.deleteVersion(
            token, projectId, version.id)
        })

        return Promise.all(deleteTasks)

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Returns Version for specific versionId
  //
  /////////////////////////////////////////////////////////////////
  getVersion (token, projectId, versionId) {

    this._APIAuth.accessToken = token

    return this._versionsAPI.getVersion(
      projectId, versionId)
  }

  /////////////////////////////////////////////////////////////////
  // Delete Version
  //
  /////////////////////////////////////////////////////////////////
  deleteVersion (token, projectId, versionId) {

    return new Promise(async(resolve, reject) => {

      try {

        this._APIAuth.accessToken = token

        const versionsRes = await this._versionsAPI.getVersion(
          projectId, versionId)

        const version = versionsRes.data

        if(version.relationships.storage) {

          const ossSvc = ServiceManager.getService('OssSvc')

          const objectId = ossSvc.parseObjectId(
            version.relationships.storage.data.id)

          return ossSvc.deleteObject (
            token,
            objectId.bucketKey,
            objectId.objectKey)
        }

        return reject('no storage')

      } catch (ex) {

        reject (ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Storage location on OSS for DM
  //
  /////////////////////////////////////////////////////////////////
  createStorage (token, projectId, folderId, filename) {

    this._APIAuth.accessToken = token

    const payload = this.createStoragePayload (
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

    const payload = this.createItemPayload(
      folderId, objectId, filename, displayName)

    return this._projectsAPI.postItem(
      projectId,
      JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Creates new Version
  //
  /////////////////////////////////////////////////////////////////
  createVersion (
    token, projectId, itemId, objectId, filename) {

    this._APIAuth.accessToken = token

    const payload = this.createVersionPayload(
      itemId, objectId, filename)

    return this._projectsAPI.postVersion(
      projectId,
      JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Get Item relationship References
  //
  /////////////////////////////////////////////////////////////////
  getItemRelationshipsRefs (
    token, projectId, itemId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._itemsAPI.getItemRelationshipsRefs(
      projectId, itemId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Create Item relationship reference
  //
  /////////////////////////////////////////////////////////////////
  createItemRelationshipRef (
    token, projectId, targetItemId, refVersionId) {

    this._APIAuth.accessToken = token

    const payload = this.createItemRelationshipRefPayload(
      refVersionId)

    return this._itemsAPI.postItemRelationshipsRef(
      projectId, targetItemId, JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Get Version relationship references
  //
  /////////////////////////////////////////////////////////////////
  getVersionRelationshipsRefs (
    token, projectId, versionId, opts = {}) {

    this._APIAuth.accessToken = token

    return this._versionsAPI.getVersionRelationshipsRefs(
      projectId, versionId, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Create Version relationship reference
  //
  /////////////////////////////////////////////////////////////////
  createVersionRelationshipRef (
    token, projectId, targetVersionId, refVersionId) {

    this._APIAuth.accessToken = token

    const payload = this.createVersionRelationshipRefPayload(
      refVersionId)

    return this._versionsAPI.postVersionRelationshipsRef(
      projectId, targetVersionId, JSON.stringify(payload))
  }

  /////////////////////////////////////////////////////////////////
  // Create new folder
  //
  /////////////////////////////////////////////////////////////////
  createFolder (
    token, projectId, parentFolderId, folderName) {

    const url =
      `${DMSvc.SERVICE_BASE_URL}/projects/` +
      `${projectId}/folders`

    const payload = this.createFolderPayload(
      parentFolderId,
      folderName)

    const headers = {
      'Content-Type': 'application/vnd.api+json',
      'Authorization': 'Bearer ' + token
    }

    return requestAsync({
      method: 'POST',
      body: payload,
      json: true,
      headers,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  // Upload file to create new item or new version
  //
  /////////////////////////////////////////////////////////////////
  upload (token, projectId, folderId, file) {

    return new Promise(async(resolve, reject) => {

      try {

        var displayName = file.originalname

        var storage = await this.createStorage(
          token, projectId, folderId, displayName)

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
            displayName
          })

        if(items.length > 0) {

          const item = items[0]

          const version = await this.createVersion(
            token,
            projectId,
            item.id,
            storage.data.id,
            displayName)

          const response = {
            version: version.data,
            storage: storage.data,
            item: item,
            object
          }

          resolve(response)

        } else {

          const item = await this.createItem(
            token, projectId, folderId,
            storage.data.id,
            displayName)

          const versions = await this.getItemVersions(
            token, projectId, item.data.id)

          const response = {
            version: versions.data[0],
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

  /////////////////////////////////////////////////////////////////
  // Creates storage payload
  //
  /////////////////////////////////////////////////////////////////
  createStoragePayload (folderId, filename) {

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
  createItemPayload (folderId, objectId, displayName) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
          type: 'items',
          attributes: {
            displayName: displayName,
            extension: {
              type: 'items:autodesk.core:File',
              version: '1.0'
            }
          },
          relationships: {
            tip: {
              data: {
                type: 'versions', id: '1'
              }
            },
            parent: {
              data: {
                type: 'folders',
                id: folderId
              }
            }
          }
      },
      included: [ {
        type: 'versions',
        id: '1',
        attributes: {
          name: displayName,
          extension: {
            type: 'versions:autodesk.core:File',
            version: '1.0'
          }
        },
        relationships: {
          storage: {
            data: {
              type: 'objects',
              id: objectId
            }
          }
        }
      }]
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates version payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionPayload (itemId, objectId, displayName) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        attributes: {
          name: displayName,
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
  // Creates item relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createItemRelationshipRefPayload (refVersionId) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        id: refVersionId,
        meta: {
          extension: {
            type: 'auxiliary:autodesk.core:Attachment',
            version: '1.0'
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates version relationship payload
  //
  /////////////////////////////////////////////////////////////////
  createVersionRelationshipRefPayload (refVersionId) {

    return {

      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'versions',
        id: refVersionId,
        meta: {
          extension: {
            type: 'auxiliary:autodesk.core:Attachment',
            version: '1.0'
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates new folder payload
  //
  /////////////////////////////////////////////////////////////////
  createFolderPayload (parentFolderId, folderName) {

    return {
      jsonapi: {
        version: '1.0'
      },
      data: {
        type: 'folders',
        attributes: {
          name: folderName,
          extension: {
            type: 'folders:autodesk.core:Folder',
            version: '1.0'
          }
        },
        relationships: {
          parent: {
            data: {
              type: 'folders',
              id: parentFolderId
            }
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

          console.log('status error: ' +
            response.statusCode)

          console.log(response.statusMessage)

          return reject(response.statusMessage)
        }

        return resolve(body)

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}
