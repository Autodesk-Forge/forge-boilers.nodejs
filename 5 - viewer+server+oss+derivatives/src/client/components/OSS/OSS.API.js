
import ClientAPI from 'ClientAPI'

///////////////////////////////////////////////////////////////////
// OSS Client API to invoke REST API Exposed by the server
// (not the Autodesk one)
///////////////////////////////////////////////////////////////////
export default class OSSAPI extends ClientAPI {

  constructor(opts) {

    super (opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets
  //
  ///////////////////////////////////////////////////////////////////
  getBuckets (query = null) {

    var url = `${this.apiUrl}/buckets`
      + this.toQueryString(query)

    return this.ajax({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  ///////////////////////////////////////////////////////////////////
  getObjects (bucketKey, query = null) {

    var url =
      `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}/objects` +
      this.toQueryString(query)

    return this.ajax({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  ///////////////////////////////////////////////////////////////////
  getAllObjects (bucketKey, query = null) {

    let lastObjectKey = undefined

    let items = []

    const getObjectsRec = async(_query) => {

      try {

        const __query = Object.assign({},
          _query, query, {
            limit: 100
          })

        const response = await this.getObjects(
          bucketKey, __query)

        items = [...items, response.items]

        return (response.items.length === 100)
          ? getObjectsRec ({
            startAt: response.items[99].objectKey
          })
          : items

      } catch (ex) {

        return ex
      }
    }

    return getObjectsRec()
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  ///////////////////////////////////////////////////////////////////
  getBucketDetails (bucketKey) {

    var url =
      `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}/details`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey
  //
  ///////////////////////////////////////////////////////////////////
  deleteBucket (bucketKey) {

    var url = `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}`

    return this.ajax({
      type: 'DELETE',
      url: url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  ///////////////////////////////////////////////////////////////////
  getObjectDetails (bucketKey, objectKey) {

    var url = `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}/objects/` +
      `${encodeURIComponent(objectKey)}/details`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  ///////////////////////////////////////////////////////////////////
  deleteObject (bucketKey, objectKey) {

    var url = `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}/objects/` +
      `${encodeURIComponent(objectKey)}`

    return this.ajax({
      type: 'DELETE',
      url: url
    })
  }

  ///////////////////////////////////////////////////////////////////
  // POST /buckets
  //
  ///////////////////////////////////////////////////////////////////
  createBucket (bucketCreationData, query = null) {

    var url = `${this.apiUrl}/buckets`
      + this.toQueryString(query)

    var payload = {
      bucketCreationData
    }

    return this.ajax({
      method: 'POST',
      rawBody: true,
      url: url,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Download object (default to objectKey if filename not specified)
  //
  /////////////////////////////////////////////////////////////////
  download (bucketKey, objectKey, filename = null) {

    var uri = `${this.apiUrl}/buckets/` +
      `${encodeURIComponent(bucketKey)}/objects/` +
      `${encodeURIComponent(objectKey)}`

    var link = document.createElement("a")
    link.download = filename || objectKey
    link.href = uri
    link.click()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    const parts = objectId.split('/')

    const bucketKey = parts[0].split(':').pop()

    const objectKey = parts[1]

    return {
      bucketKey: decodeURIComponent(bucketKey),
      objectKey: decodeURIComponent(objectKey)
    }
  }
}
