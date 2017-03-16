
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import fs from 'fs'

module.exports = function() {

  const router = express.Router()

  //////////////////////////////////////////////////////////////
  // GET /buckets
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets', async (req, res) =>{

    try {

      // obtain forge service
      const forgeSvc = ServiceManager.getService('ForgeSvc')

      // request 2legged token
      const token = await forgeSvc.get2LeggedToken()

      // obtain oss service
      const ossSvc = ServiceManager.getService('OssSvc')

      const options = {
        region: req.query.region || 'US',
        startAt: req.query.startAt || 0,
        limit: req.query.limit || 100
      }

      const response = await ossSvc.getBuckets(
        token, options)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/details', async (req, res) =>{

    try {

      const bucketKey = req.params.bucketKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const ossSvc = ServiceManager.getService('OssSvc')

      const response = await ossSvc.getBucketDetails(
        token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects', async(req, res) => {

    try {

      const bucketKey = req.params.bucketKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const ossSvc = ServiceManager.getService('OssSvc')
  
      const options = {
        region: req.query.region || 'US',
        startAt: req.query.startAt || 0,
        limit: req.query.limit || 100
      }
      
      const response = await ossSvc.getObjects(
        token, bucketKey, options)

      res.send(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey/details', async (req, res) =>{

    try {

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const ossSvc = ServiceManager.getService('OssSvc')

      const response = await ossSvc.getObjectDetails(
        token, bucketKey, objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const object = await ossSvc.getObject(
        token, bucketKey, objectKey)

      res.end(object)

    } catch(ex) {

      console.log(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // POST /buckets
  //
  //
  //////////////////////////////////////////////////////////////
  router.post('/buckets', async (req, res) => {

    try {

      const bucketCreationData = req.body.bucketCreationData

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const ossSvc = ServiceManager.getService('OssSvc')

      const options = {
        xAdsRegion: req.query.region || 'US'
      }

      const response = await ossSvc.createBucket(
        token, bucketCreationData, options)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey
  //
  //
  //////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey', async (req, res) =>{

    try {

      const bucketKey = req.params.bucketKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const response = await ossSvc.deleteBucket(
        token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  //
  //////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const response = await ossSvc.deleteObject(
        token, bucketKey, objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}