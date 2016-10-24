
import ClientAPI from 'ClientAPI'

///////////////////////////////////////////////////////////////////
// OSS Client API to invoke REST API Exposed by the server
// (not the Autodesk one)
///////////////////////////////////////////////////////////////////
export default class OSSAPI extends ClientAPI {

  constructor(opts) {

    super(opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets
  //
  ///////////////////////////////////////////////////////////////////
  getBuckets () {

    var url = `${this.apiUrl}/buckets`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  ///////////////////////////////////////////////////////////////////
  getObjects (bucketKey) {

    var url = `${this.apiUrl}/buckets/${bucketKey}/objects`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  ///////////////////////////////////////////////////////////////////
  getBucketDetails (bucketKey) {

    var url = `${this.apiUrl}/buckets/${bucketKey}/details`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  ///////////////////////////////////////////////////////////////////
  getObjectDetails (bucketKey, objectKey) {

    var url = `${this.apiUrl}/buckets/` +
      `${bucketKey}/objects/` +
      `${objectKey}/details`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  ///////////////////////////////////////////////////////////////////
  deleteObject (bucketKey, objectKey) {

    var url = `${this.apiUrl}/buckets/` +
      `${bucketKey}/objects/` +
      `${objectKey}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  // POST /buckets
  //
  ///////////////////////////////////////////////////////////////////
  createBucket (bucketCreationData) {

    var url = `${this.apiUrl}/buckets`

    var payload = {
      bucketCreationData
    }

    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Download object (default to objectKey if filename not specified)
  //
  /////////////////////////////////////////////////////////////////
  download (bucketKey, objectKey, filename = null) {

    var uri = `${this.apiUrl}/buckets/` +
      `${bucketKey}/objects/${objectKey}`

    var link = document.createElement("a")
    link.download = filename || objectKey
    link.href = uri
    link.click()
  }
}
