import JobPanel from './JobPanel/JobPanel.js'
import ClientAPI from 'ClientAPI'

export default class DerivativesAPI extends ClientAPI {

  constructor (opts) {

    super(opts.apiUrl)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  postJob (payload) {

    const url = `${this.apiUrl}/job`

    const data = {
      payload: JSON.stringify(payload)
    }

    return this.ajax({
      type: 'POST',
      data,
      url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  postJobWithProgress (args) {

    return new Promise(async(resolve, reject) => {

      var jobPanel = new JobPanel(
        args.panelContainer,
        args.designName)

      jobPanel.setVisible(true)

      try {

        var job = await this.postJob({
          input: args.input,
          output:args.output
        })

        if (job.result === 'success' || job.result === 'created') {

          const onProgress = (progress) => {

            jobPanel.updateProgress(progress)
          }

          const derivativeResult = await this.getDerivativeURN ({
              input: args.input,
              output:args.output
            }, onProgress, true)

          jobPanel.done()

          resolve(derivativeResult)

        } else {

          jobPanel.jobFailed(job)

          return reject(job)
        }

      } catch(ex) {

        jobPanel.jobFailed(ex)

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getFormats () {

    const url = `${this.apiUrl}/formats`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getMetadata (urn) {

    const url = `${this.apiUrl}/metadata/${urn}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getManifest (urn) {

    const url = `${this.apiUrl}/manifest/${urn}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getProperties (urn, guid) {

    const url = `${this.apiUrl}/properties/${urn}/${guid}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getHierarchy (urn, guid) {

    const url = `${this.apiUrl}/hierarchy/${urn}/${guid}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getThumbnail(urn, options = { width:100, height:100 }) {

    const query = `width=${options.width}&height=${options.height}`

    const url = `${this.apiUrl}/thumbnails/${urn}?${query}`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  deleteManifest (urn) {

    const url = `${this.apiUrl}/manifest/${urn}`

    return this.ajax({
      type: 'DELETE',
      url
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  findDerivative (manifest, params) {

    var parentDerivative = null

    for(var i = 0; i < manifest.derivatives.length; ++i) {

      var derivative = manifest.derivatives[i]

      if (derivative.outputType === params.output.type) {

        parentDerivative = derivative

        if (derivative.children) {

          for(var j = 0; j < derivative.children.length; ++j) {

            var childDerivative = derivative.children[j]

            if(derivative.outputType !== 'obj'){

              return {
                parent: parentDerivative,
                target: childDerivative
              }
            }

            // match objectId
            else if(_.isEqual(
                childDerivative.objectIds,
                params.output.objectIds)) {

              return {
                parent: parentDerivative,
                target: childDerivative
              }
            }
          }
        }
      }
    }

    return {
      parent: parentDerivative
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  hasDerivative(manifest, params) {

    var derivativeResult = this.findDerivative(
      manifest, params)

    return derivativeResult.target ? true : false
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDerivativeURN (params, onProgress = null, skipNotFound = false) {

    return new Promise(async(resolve, reject) => {

      try {

        while (true) {

          var manifest = await this.getManifest(
            params.input.urn)

          //if(manifest.status === 'failed') {
          //  return reject(manifest)
          //}

          if(!manifest.derivatives) {

            return reject(manifest)
          }

          var derivativeResult = this.findDerivative(
            manifest, params)

          if(derivativeResult.target) {

            var progress = manifest.progress.split(' ')[0]

            progress = (progress === 'complete' ? '100%' : progress)

            onProgress ? onProgress(progress) : ''

            if (derivativeResult.target.status === 'success') {

              onProgress ? onProgress('100%') : ''

              return resolve({
                status: 'success',
                derivativeUrn: derivativeResult.target.urn
              })

            } else if (derivativeResult.target.status === 'failed') {

              onProgress ? onProgress('failed') : ''

              return reject({
                status: 'failed'
              })
            }
          }

          // if no parent -> no derivative of this type
          // OR
          // if parent complete and no target -> derivative not requested

          if(!derivativeResult.parent) {

            onProgress ? onProgress('0%') : ''

            if(!skipNotFound) {

              return resolve({
                status: 'not found'
              })
            }

          } else if(derivativeResult.parent.status === 'success') {

            if(!derivativeResult.target) {

              onProgress ? onProgress('0%') : ''

              if(!skipNotFound) {

                return resolve({
                  status: 'not found'
                })
              }
            }
          }

          await sleep(1000)
        }

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDownloadURI (urn, derivativeUrn, filename) {

    return `${this.apiUrl}/download?` +
      `urn=${urn}&` +
      `derivativeUrn=${encodeURIComponent(derivativeUrn)}&` +
      `filename=${encodeURIComponent(filename)}`
  }

  /////////////////////////////////////////////////////////////////
  // Download util
  //
  /////////////////////////////////////////////////////////////////
  downloadURI (uri, name) {

    var link = document.createElement("a")
    link.download = name
    link.href = uri
    link.click()
  }
}

///////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////
function sleep (ms) {
  return new Promise((resolve)=> {
      setTimeout( ()=>{
        resolve()
      }, ms)
  })
}
