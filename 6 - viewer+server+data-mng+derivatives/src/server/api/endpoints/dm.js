
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
    }
    catch (ex) {

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
    }
    catch (ex) {

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
    }
    catch (ex) {

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
        token.access_token, hubId, projectId)

      res.json(response)
    }
    catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /projects/{projectId}/folders/{folderId}
  // Get folder content
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/folders/:folderId', async (req, res) => {

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
    }
    catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /project/{projectId}/items/{itemId}/versions
  // Get all item versions
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/projects/:projectId/items/:itemId/versions', async (req, res) => {

    try {
      
      var projectId = req.params.projectId

      var itemId = req.params.itemId

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.getVersions(
        token.access_token, projectId, itemId)

      res.json(response)
    }
    catch (ex) {

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