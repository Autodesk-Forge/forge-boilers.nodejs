
import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'
import rmdir from 'rmdir'
import mzfs from 'mz/fs'
import path from 'path'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////
  // POST /job
  // Post a derivative job - generic
  //
  /////////////////////////////////////////////////////////
  router.post('/job', async (req, res) => {

    try {

      const payload = JSON.parse(req.body.payload)

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.postJob(
        token, payload)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /formats
  // Get supported formats
  //
  /////////////////////////////////////////////////////////
  router.get('/formats', async (req, res) => {

    try {

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getFormats(token)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /metadata/{urn}
  // Get design metadata
  //
  /////////////////////////////////////////////////////////
  router.get('/metadata/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getMetadata(
        token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /manifest/{urn}
  // Get design manifest
  //
  /////////////////////////////////////////////////////////
  router.get('/manifest/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getManifest(
        token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /hierarchy/{urn}/{guid}
  // Get hierarchy for design
  //
  /////////////////////////////////////////////////////////
  router.get('/hierarchy/:urn/:guid', async (req, res) => {

    try {

      const urn = req.params.urn

      const guid = req.params.guid

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getHierarchy(
        token, urn, guid)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /properties/{urn}/{guid}
  // Get properties for design
  //
  /////////////////////////////////////////////////////////
  router.get('/properties/:urn/:guid', async (req, res) => {

    try {

      const urn = req.params.urn

      const guid = req.params.guid

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getProperties(
        token, urn, guid)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // DELETE /manifest/{urn}
  // Delete design manifest
  //
  /////////////////////////////////////////////////////////
  router.delete('/manifest/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.deleteManifest(
        token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /download
  // Get download uri for derivative resource
  //
  /////////////////////////////////////////////////////////
  router.get('/download', async (req, res) => {

    try {

      const filename = req.query.filename || 'download'

      const derivativeUrn = req.query.derivativeUrn

      const base64 = req.query.base64

      const urn = req.query.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.download(
        token, urn, derivativeUrn, {
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

  /////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const options = {
        width: req.query.width || 100,
        height: req.query.height || 100
      }

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getThumbnail(
        token, urn, options)

      res.end(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // POST /svf/extract
  //
  /////////////////////////////////////////////////////////
  router.post('/svf/extract', async (req, res) => {

    try {

      const payload = JSON.parse(req.body.payload)

      const name = payload.name

      const urn = payload.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const getToken = () => forgeSvc.get2LeggedToken()

      const extractorSvc = ServiceManager.getService(
        'ExtractorSvc')

      const dir = path.resolve(__dirname,
        `../../../../TMP/${name}`)

      const files = await extractorSvc.download(
        getToken, payload.urn, dir)

      const zipfile = dir + '.zip'

      await extractorSvc.createZip(
        dir, zipfile + '.tmp', name, files)

      mzfs.rename(zipfile + '.tmp', zipfile)

      rmdir(dir)

      res.json('done')

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /svf/status/:name
  //
  /////////////////////////////////////////////////////////
  router.get('/svf/status/:name', async (req, res) => {

    try {

      const name = req.params.name

      const filename = path.resolve(__dirname,
        `../../../../TMP/${name}.zip`)

      await mzfs.stat(filename)

      res.json('ok')

    } catch (ex) {

      res.status(404)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /svf/download/:name
  //
  /////////////////////////////////////////////////////////
  router.get('/svf/download/:name', async (req, res) => {

    try {

      const name = req.params.name

      const filename = path.resolve(__dirname,
        `../../../../TMP/${name}.zip`)

      await mzfs.stat(filename)

      res.download(filename)

      //res.set('Content-Type', 'application/octet-stream')
      //
      //const stream = mzfs.createReadStream(filename, {
      //  bufferSize: 64 * 64 * 1024
      //})
      //
      //stream.pipe(res)

    } catch (ex) {

      res.status(404)
      res.json(ex)
    }
  })

  return router
}
