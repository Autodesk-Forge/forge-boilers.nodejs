import { BaseTreeDelegate, TreeNode } from 'TreeView'
import EventsEmitter from 'EventsEmitter'
import _ from 'lodash'

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

    node.createDownloader = (filename) => {

      const downloadId = this.guid()

      $(parent).find('icon').before(`
          <div class="cloud-download">
              <button" id="${downloadId}" class="btn c${parent.id}"
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"1000", "hide":"100"}'
                title="Download ${filename}">
              <span class="glyphicon glyphicon-cloud-download">
              </span>
            </button>
          </div>
        `)

      const download = (derivativeUrn) => {

        node.showLoader(true)

        const uri = this.derivativesAPI.getDownloadURI(
          node.urn,
          derivativeUrn,
          node.exportFilename)

        this.derivativesAPI.downloadURI(
          uri, node.exportFilename)

        setTimeout(() => {
          node.showLoader(false)
        }, 2000)
      }

      $(`#${downloadId}`).click(() => {

        if (node.derivative) {

          download(node.derivative.urn)

        } else {

          this.emit('postJob', node).then((derivative) => {

            download(derivative.urn)
          })
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

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
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
            job: {
              output: {formats: [{type: format}]},
              input: {urn: this.urn}
            },
            query: { role: format },
            id: this.guid(),
            urn: this.urn,
            group: true,
            name: format
          }

          addChildCallback(exportNode)

          exportNode.collapse()
        })

        let thumbnailsNode = {
          type: 'formats.thumbnails-export',
          name: 'thumbnails',
          id: this.guid(),
          group: true
        }

        addChildCallback(thumbnailsNode)

        thumbnailsNode.collapse()

        break

      case 'formats.obj-export':

        if (this.modelGuid) {

          const objFullNode = {
            exportFilename: this.designName + '.obj',
            type: 'formats.obj-export-full',
            job: {
              output: {
                formats: [{
                  type: 'obj',
                  advanced: {
                    modelGuid: this.modelGuid,
                    objectIds: [-1]
                  }
                }]
              },
              input: {urn: this.urn}
            },
            query: (derivative) => {
              return (
                derivative.role === 'obj' &&
                _.isEqual(derivative.objectIds, [-1])
              )
            },
            name: 'Full Model',
            id: this.guid(),
            urn: this.urn,
            group: true
          }

          addChildCallback(objFullNode)

          const objDerivatives =
            this.derivativesAPI.findDerivatives(
              this.manifest, (derivative) => {
                return (
                derivative.role === 'obj' &&
                !_.isEqual(derivative.objectIds, [-1]))
              })

          objDerivatives.forEach((obj) => {

            const ids = obj.objectIds.join('-')

            let objComponentNode = {
              exportFilename: this.designName + '-' + ids + '.obj',
              name: `Components: [${obj.objectIds.join(', ')}]`,
              type: 'formats.obj-export-component',
              query: { guid: obj.guid },
              id: this.guid(),
              urn: this.urn,
              group: true
            }

            addChildCallback(objComponentNode)
          })
        }

        break

      case 'formats.dwg-export':

        const dwgDerivatives =
          this.derivativesAPI.findDerivatives(
            this.manifest, { role: 'dwg' })

       if (dwgDerivatives.length) {

          dwgDerivatives.forEach((dwg) => {

            const sheet = dwg.urn.split('/').pop(-1)

            const dwgSheetNode = {
              type: 'formats.dwg-export-sheet',
              query: { guid: dwg.guid },
              exportFilename: sheet,
              id: this.guid(),
              urn: this.urn,
              group: true,
              name: sheet
            }

            addChildCallback(dwgSheetNode)
          })

        } else {

          const dwgRequestNode = {
            type: 'formats.dwg-export-sheet',
            job: {
              output: {
                formats: [{
                  type: 'dwg',
                  guid: 0
                }]
              },
              input: {urn: this.urn}
            },
            id: this.guid(),
            group: true,
            name: 'Request dwg exports ... '
          }

          addChildCallback(dwgRequestNode)
        }

        break

      case 'formats.thumbnails-export':

        if (this.manifest) {

          const thumbnailDerivatives =
            this.derivativesAPI.findDerivatives(
              this.manifest, {role: 'thumbnail'})

          thumbnailDerivatives.forEach((thumbnail) => {

            const res =
              thumbnail.resolution[0]
              + ' x ' +
              thumbnail.resolution[1]

            const name =
              (thumbnail.parent.name || this.designName) +
                ' - ' + res

            const thumbnailNode = {
              type: 'formats.thumbnail-export',
              query: {guid: thumbnail.guid},
              exportFilename: name + '.png',
              id: this.guid(),
              urn: this.urn,
              group: true,
              name: name
            }

            addChildCallback(thumbnailNode)
          })
        }

        break

      case 'formats.svf-export':

        if (this.manifest) {

          const derivatives =
            this.derivativesAPI.findDerivatives(
              this.manifest, { type: 'geometry' })

          if(derivatives.length > 0) {

            node.parent.classList.add('derivated')

            node.derivative = derivatives[0]
          }
        }

        break

      default:

        node.createDownloader(node.exportFilename)

        if (this.manifest) {

          const derivatives =
            this.derivativesAPI.findDerivatives(
              this.manifest, node.query)

          if(derivatives.length > 0) {

            node.parent.classList.add('derivated')

            node.derivative = derivatives[0]
          }
        }

        break
    }
  }
}