
import ClientAPI from 'ClientAPI'

///////////////////////////////////////////////////////////////////
// DataManagement Client API to invoke REST API Exposed by the server
// (not the Autodesk one)
///////////////////////////////////////////////////////////////////
export default class DataManagementAPI extends ClientAPI {

  constructor (opts) {

    super (opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs
  //
  ///////////////////////////////////////////////////////////////////
  getHubs () {

    const url = `${this.apiUrl}/hubs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects
  //
  ///////////////////////////////////////////////////////////////////
  getProjects (hubId) {

    const url = `${this.apiUrl}/hubs/${hubId}/projects`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId
  //
  ///////////////////////////////////////////////////////////////////
  getProject (hubId, projectId) {

    const url = `${this.apiUrl}` +
      `/hubs/${hubId}/projects/${projectId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /hubs/:hubId/projects/:projectId/topFolders
  //
  ///////////////////////////////////////////////////////////////////
  getProjectTopFolders (hubId, projectId) {

    const url = `${this.apiUrl}` +
      `/hubs/${hubId}/projects/${projectId}/topFolders`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  ///////////////////////////////////////////////////////////////////
  getFolder (projectId, folderId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/folders/${folderId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/folders/:folderId
  //
  ///////////////////////////////////////////////////////////////////
  getFolderContent (projectId, folderId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/folders/${folderId}/content`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId
  //
  ///////////////////////////////////////////////////////////////////
  getItem (projectId, itemId) {
    
    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // DELETE /projects/:projectId/items/:itemId
  //
  ///////////////////////////////////////////////////////////////////
  deleteItem (projectId, itemId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}`

    return this.ajax({
      type: 'DELETE',
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/versions
  //
  ///////////////////////////////////////////////////////////////////
  getItemVersions (projectId, itemId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}/versions`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/tip
  //
  ///////////////////////////////////////////////////////////////////
  getItemTip (projectId, itemId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}/tip`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/versions/:versionId
  //
  ///////////////////////////////////////////////////////////////////
  getVersion (projectId, versionId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/versions/${encodeURIComponent(versionId)}`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/items/:itemId/relationships/refs
  //
  ///////////////////////////////////////////////////////////////////
  getItemRelationshipsRefs (projectId, itemId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}/relationships/refs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /projects/:projectId/versions/:versionId/relationships/refs
  //
  ///////////////////////////////////////////////////////////////////
  getVersionRelationshipsRefs (projectId, versionId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/versions/` +
      `${encodeURIComponent(versionId)}/relationships/refs`

    return this.ajax ({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // POST /projects/:projectId/items/:itemId/relationships
  //
  ///////////////////////////////////////////////////////////////////
  postItemRelationshipRef (projectId, itemId, refVersionId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/items/${itemId}/relationships/refs`

    const data = {
      payload: JSON.stringify({
        refVersionId
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // POST /projects/:projectId/versions/:versionId/relationships
  //
  ///////////////////////////////////////////////////////////////////
  postVersionRelationshipRef (projectId, versionId, refVersionId) {

    const url = `${this.apiUrl}` +
      `/projects/${projectId}/versions/` +
      `${encodeURIComponent(versionId)}/relationships/refs`

    const data = {
      payload: JSON.stringify({
        refVersionId
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // POST /projects/:projectId/folders
  //
  ///////////////////////////////////////////////////////////////////
  postFolder (projectId, parentFolderId, folderName) {

    const url = `${this.apiUrl}/projects/${projectId}/folders`

    const data = {
      payload: JSON.stringify({
        parentFolderId,
        folderName
      })
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
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

    var link = document.createElement('a')

    link.download = version.attributes.displayName
    link.href = uri
    link.click()
  }
}

