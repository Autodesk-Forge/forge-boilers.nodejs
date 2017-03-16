
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

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getUser(token)

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

      const forgeSvc = ServiceManager.getService('ForgeSvc');

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getHubs(token)

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

      const hubId = req.params.hubId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getProjects(token, hubId)

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

      const hubId = req.params.hubId

      const projectId = req.params.projectId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getProject(
        token, hubId, projectId)

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

      const projectId = req.params.projectId

      const folderId = req.params.folderId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getFolder(
        token, projectId, folderId)

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

      const projectId = req.params.projectId

      const folderId = req.params.folderId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getFolderContent(
        token, projectId, folderId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/items/{itemId}
  // Get item details
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId',
    async (req, res) => {

    try {

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getItem(
        token, projectId, itemId)

      res.json(response)

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

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getItemVersions(
        token, projectId, itemId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/items/{itemId}/tip
  // Get item tip version (most recent version)
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/tip',
    async (req, res) => {

    try {

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getItemTip(
        token, projectId, itemId)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /project/{projectId}/items/{itemId}
  // Delete item
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/projects/:projectId/items/:itemId',
    async (req, res) => {

    try {

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.deleteItem(
        token, projectId, itemId)

      res.json(response)

    } catch (ex) {

      console.log(ex)

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

      const projectId = req.params.projectId

      const versionId = req.params.versionId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getVersion(
        token, projectId, versionId)

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

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getItemRelationshipsRefs(
        token, projectId, itemId)

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

      const projectId = req.params.projectId

      const versionId = req.params.versionId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.getVersionRelationshipsRefs(
        token, projectId, versionId)

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

      const payload = JSON.parse(req.body.payload)

      const projectId = req.params.projectId

      const itemId = req.params.itemId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.createItemRelationshipRef(
        token, projectId, itemId, payload.refVersionId)

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

      const payload = JSON.parse(req.body.payload)

      const projectId = req.params.projectId

      const versionId = req.params.versionId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.createVersionRelationshipRef(
        token, projectId, versionId, payload.refVersionId)

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

      const payload = JSON.parse(req.body.payload)

      const projectId = req.params.projectId

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.createFolder(
        token, projectId, payload.parentFolderId, payload.folderName)

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
  router.get('/projects/:projectId/folders/:folderId/search/:filter', async (req, res) => {

    try {

      const projectId = req.params.projectId

      const folderId = req.params.folderId

      const filter = req.params.filter

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const dmSvc = ServiceManager.getService('DMSvc')

      const response = await dmSvc.searchFolder(
        token, projectId, folderId, filter)

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

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get3LeggedTokenMaster(req.session)

      const object = await ossSvc.getObject(
        token, bucketKey, objectKey)

      res.end(object)

    } catch(ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}


