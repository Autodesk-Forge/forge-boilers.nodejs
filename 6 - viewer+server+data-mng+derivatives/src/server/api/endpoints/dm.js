
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // GET /user
  // Get current user
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/user', async (req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getUser(
        token.access_token)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hubs
  // Get all hubs
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs', async (req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')
      
      var response = await dmSvc.getHubs(
        token.access_token)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hubs/{hubId}/projects
  // Get all hub projects
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects', async (req, res) => {

    try {
      
      var hubId = req.params.hubId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProjects(
        token.access_token, hubId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  //  GET /hubds/{hubId}/projects/{projectId}
  //  Get project content
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hubs/:hubId/projects/:projectId', async (req, res) => {

    try {
      
      var hubId = req.params.hubId

      var projectId = req.params.projectId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getProject(
        token.access_token,
        hubId, projectId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/folders/{folderId}
  // Get folder
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId',
    async (req, res) => {

    try {

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getFolder(
        token.access_token,
        projectId, folderId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/folders/{folderId}/content
  // Get folder content
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId/content',
    async (req, res) => {

    try {
      
      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getFolderContent(
        token.access_token, projectId, folderId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/folders/{folderId}/items/{itemId}
  // Get item details
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId/items/:itemId',
    async (req, res) => {

    try {

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var itemId = req.params.itemId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getFolderContent(
        token.access_token, projectId, folderId)

      const items = response.data.filter((folderItem) => {

        return folderItem.id === itemId
      })

      const item = items.length ? items[0] : null

      res.status(item ? 200 : 404)

      res.json(item)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/items/{itemId}/versions
  // Get all item versions
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions',
    async (req, res) => {

    try {
      
      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getItemVersions(
        token.access_token, projectId, itemId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/versions/{versionId}
  // Get version by Id
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/versions/:versionId', async (req, res) => {

    try {

      var projectId = req.params.projectId

      var versionId = req.params.versionId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getVersion(
        token.access_token, projectId, versionId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/items/{itemId}/relationships/refs
  // Get item relationship references
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/relationships/refs',
    async (req, res) => {

    try {

      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getItemRelationshipsRefs(
        token.access_token, projectId, itemId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/versions/{versionId}/relationships/refs
  // Get version relationship references
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/versions/:versionId/relationships/refs',
    async (req, res) => {

    try {

      var projectId = req.params.projectId

      var versionId = req.params.versionId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getVersionRelationshipsRefs(
        token.access_token, projectId, versionId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /project/{projectId}/items/{itemId}/relationships/refs
  // Create item relationship ref
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/projects/:projectId/items/:itemId/relationships/refs',
    async (req, res) => {

    try {

      var payload = JSON.parse(req.body.payload)

      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.createItemRelationshipRef(
        token.access_token, projectId, itemId,
        payload.refVersionId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /project/{projectId}/versions/{versionId}/relationships/refs
  // Create version relationship ref
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/projects/:projectId/versions/:versionId/relationships/refs',
    async (req, res) => {

    try {

      var payload = JSON.parse(req.body.payload)

      var projectId = req.params.projectId

      var versionId = req.params.versionId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.createVersionRelationshipRef(
        token.access_token, projectId, versionId,
        payload.refVersionId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /project/{projectId}/folders
  // Create new folder
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/projects/:projectId/folders', async (req, res) => {

    try {

      var payload = JSON.parse(req.body.payload)

      var projectId = req.params.projectId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.createFolder(
        token.access_token,
        projectId,
        payload.parentFolderId,
        payload.folderName)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey
  // Download an item version based on { bucketKey, objectKey }
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var object = await ossSvc.getObject(
        token.access_token,
        bucketKey,
        objectKey)

      res.end(object)

    } catch(ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}


