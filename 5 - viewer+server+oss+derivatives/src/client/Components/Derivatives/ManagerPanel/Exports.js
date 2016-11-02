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
  constructor (urn, formats, api) {

    super()

    this.derivativesAPI = api

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

        node.showLoader(true)




        setTimeout(() => {
          node.showLoader(false)
        }, 2000)
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
  forEachChild(node, addChildCallback) {

    switch (node.type) {

      case 'formats.root':

        this.formats.forEach(async(format) => {

          let exportNode = {
            type: 'formats.' + format + '-export',
            filename: 'export' + '.' + format,
            outputType: format,
            id: this.guid(),
            urn: this.urn,
            group: true,
            name: format
          }

          if (format === 'obj') {

            const metadataResponse =
              await this.derivativesAPI.getMetadata(
                this.urn)

            const metadata = metadataResponse.data.metadata

            if (metadata && metadata.length) {

              exportNode.guid = metadata.guid
              exportNode.objectIds = [-1]
            }
          }

          addChildCallback(exportNode)
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