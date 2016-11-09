import { BaseTreeDelegate, TreeNode } from 'TreeView'
import EventsEmitter from 'EventsEmitter'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export class ExportsTreeDelegate
  extends EventsEmitter.Composer (BaseTreeDelegate) {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (urn, designName, manifest, modelGuid, formats, api) {

    super()

    this.designName = designName.split('.')[0]

    this.modelGuid = modelGuid

    this.derivativesAPI = api

    this.manifest = manifest

    this.formats = formats

    this.urn = urn
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = this.guid()

    node.parent = parent

    node.type.split('.').forEach((cls) => {

      parent.classList.add(cls)
    })

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    const labelId = this.guid()

    let label = `
        <div class="label-container">
            <label class="${node.type}" id="${labelId}"
              ${options && options.localize?"data-i18n=" + text : ''}>
              ${text}
            </label>
        </div>
      `

    $(parent).append(label)

    if (node.type.indexOf('-export') > -1) {

      const downloadId = this.guid()

      $(parent).find('icon').before(`
          <div class="cloud-download">
              <button" id="${downloadId}" class="btn c${parent.id}"
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"1000", "hide":"100"}'
                title="Download ${node.objectKey}">
              <span class="glyphicon glyphicon-cloud-download">
              </span>
            </button>
          </div>
        `)

      $(`#${downloadId}`).click(() => {

        if (node.derivative) {

          node.showLoader(true)

          const uri = this.derivativesAPI.getDownloadURI(
            node.input.urn,
            node.derivative.derivativeUrn,
            node.exportFilename)

          this.derivativesAPI.downloadURI(
            uri, node.exportFilename)

          setTimeout(() => {
            node.showLoader(false)
          }, 2000)

        } else {

          this.emit('postJob', node)
        }
      })
    }

    node.setProgress = (progress) => {

      $('#' + labelId).text(text + ' - ' + progress)
    }

    const loadDivId = this.guid()

    node.showLoader = (show) => {

      if(!$('#' + loadDivId).length) {

        $('#' + labelId).after(`
          <div id=${loadDivId} class="label-loader"
            style="display:none;">
            <img> </img>
          </div>
        `)
      }

      $('#' + loadDivId).css(
        'display',
        show ? 'block' : 'none')
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    switch (node.type) {

      case 'formats.root':

        this.formats.forEach((format) => {

          let exportNode = {
            exportFilename: this.designName + '.' + format,
            type: 'formats.' + format + '-export',
            output: { formats:[{type: format}] },
            input: { urn: this.urn },
            id: this.guid(),
            group: true,
            name: format
          }

          if (format === 'obj') {

            if (this.modelGuid) {

              let objFormat =
                exportNode.output.formats[0]

              objFormat.advanced = {
                modelGuid: this.modelGuid,
                objectIds: [-1]
              }

              addChildCallback(exportNode)
            }

          } else {

            addChildCallback(exportNode)
          }

          if (this.manifest) {

            if(this.derivativesAPI.hasDerivative (
                this.manifest, exportNode)) {

              exportNode.parent.classList.add('derivated')

              this.derivativesAPI.getDerivativeURN(
                exportNode).then((derivative) => {

                  exportNode.derivative = derivative
                })
            }
          }
        })

      break
    }
  }

  /////////////////////////////////////////////////////////////////
  // onDerivativeProgress
  //
  /////////////////////////////////////////////////////////////////
  onDerivativeProgress (node) {

    return (progress) => {

      console.log(progress)

      node.setProgress(progress)
    }
  }

  /////////////////////////////////////////////////////////////////
  // getDerivativeNodeProgress
  //
  /////////////////////////////////////////////////////////////////
  getDerivativeNodeProgress (node) {

    this.extension.api.getDerivativeURN(
      node, this.onDerivativeProgress(node)).then(
      (derivativeResult) => {

        console.log('derivativeResult')
        console.log(derivativeResult)

        node.derivativeResult = derivativeResult

        if(derivativeResult.status === 'not found') {

          node.setProgress('0%')

        } else {

          node.setProgress('100%')
        }

      }, (error) => {

        console.log('derivativeResult ERROR')
        console.log(error)

        node.setProgress('0%')

        if(error.status === 'failed') {

          node.setProgress('failed')
        }
      })
  }
}