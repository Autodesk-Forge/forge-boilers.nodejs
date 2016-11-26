
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // POST /job
  // Post a derivative job - generic
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/job', async (req, res) => {

    try {
      
      var payload = JSON.parse(req.body.payload)

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)
      
      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.postJob(
        token.access_token,
        payload)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /formats
  // Get supported formats
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/formats', async (req, res) => {

    try {

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getFormats(
        token.access_token)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /metadata/{urn}
  // Get design metadata
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/metadata/:urn', async (req, res) => {

    try {
      
      var urn = req.params.urn

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getMetadata(
        token.access_token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /manifest/{urn}
  // Get design manifest
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/manifest/:urn', async (req, res) => {

    try {

      var urn = req.params.urn

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getManifest(
        token.access_token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /hierarchy/{urn}/{guid}
  // Get hierarchy for design
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/hierarchy/:urn/:guid', async (req, res) => {

    try {
      
      var urn = req.params.urn

      var guid = req.params.guid

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getHierarchy(
        token.access_token, urn, guid)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /properties/{urn}/{guid}
  // Get properties for design
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/properties/:urn/:guid', async (req, res) => {

    try {

      var urn = req.params.urn

      var guid = req.params.guid

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getProperties(
        token.access_token, urn, guid)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /manifest/{urn}
  // Delete design manifest
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/manifest/:urn', async (req, res) => {

    try {

      var urn = req.params.urn

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.deleteManifest(
        token.access_token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /download
  // Get download uri for derivative resource
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/download', async (req, res) => {

    try {

      var filename = req.query.filename || 'download'

      var derivativeUrn = req.query.derivativeUrn

      var base64 = req.query.base64

      var urn = req.query.urn

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.download(
        token.access_token, urn, derivativeUrn, {
          base64: base64
        })

      res.set('Content-Type', 'application/octet-stream')

      res.set('Content-Disposition',
        `attachment filename="${filename}"`)

      res.end(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', async (req, res) => {

    try {
      
      var urn = req.params.urn

      var options = {
        width: req.query.width || 100,
        height: req.query.height || 100
      }

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      var response = await derivativesSvc.getThumbnail(
        token.access_token, urn, options)

      res.end(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}