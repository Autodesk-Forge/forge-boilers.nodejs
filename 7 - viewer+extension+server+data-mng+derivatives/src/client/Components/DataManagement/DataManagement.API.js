
import ClientAPI from 'ClientAPI'

///////////////////////////////////////////////////////////////////
// DataManagement Client API to invoke REST API Exposed by the server
// (not the Autodesk one)
///////////////////////////////////////////////////////////////////
export default class DataManagementAPI extends ClientAPI {

  constructor (opts) {

    super(opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs
  //
  ///////////////////////////////////////////////////////////////////
  getHubs () {

    var url = `${this.apiUrl}/hubs`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects
  //
  ///////////////////////////////////////////////////////////////////
  getProjects (hubId) {

    var url = `${this.apiUrl}/hubs/${hubId}/projects`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId
  //
  ///////////////////////////////////////////////////////////////////
  getProject (hubId, projectId) {

    var url = `${this.apiUrl}/hubs/${hubId}/projects/${projectId}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  ///////////////////////////////////////////////////////////////////
  getFolderContent (projectId, folderId) {

    var url = `${this.apiUrl}/projects/${projectId}/folders/${folderId}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/versions
  //
  ///////////////////////////////////////////////////////////////////
  getVersions (projectId, itemId) {

    var url = `${this.apiUrl}/projects/${projectId}/items/${itemId}/versions`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // parse an objectId to return {bucketKey, objectKey} pair
  //
  ///////////////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    var parts = objectId.split('/')

    var bucketKey = parts[0].split(':').pop()

    var objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////////////
  // Download object from version
  //
  /////////////////////////////////////////////////////////////////
  download (version) {

    // retrieves bucketKey/objectKey from storage Id

    var objectId = this.parseObjectId(
      version.relationships.storage.data.id)

    var uri = `${this.apiUrl}/buckets/` +
      `${objectId.bucketKey}/objects/${objectId.objectKey}`

    var link = document.createElement("a")

    link.download = version.attributes.displayName
    link.href = uri
    link.click()
  }
}

