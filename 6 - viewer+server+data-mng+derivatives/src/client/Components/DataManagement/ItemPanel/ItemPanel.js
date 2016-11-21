/////////////////////////////////////////////////////////////////////
// ItemPanel Panel
// by Philippe Leefsma, November 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import {API as DerivativesAPI} from 'Derivatives'
import ContextMenu from './ContextMenu'
import UIComponent from 'UIComponent'
import TabManager from 'TabManager'
import Dropzone from 'dropzone'
import DMAPI from '../API'
import './ItemPanel.scss'

export default class ItemPanel extends UIComponent {

  constructor (
    dmApiUrl = '/api/dm',
    derivativesApiUrl = '/api/derivatives') {

    super()

    this.onNodeDblClickHandler = (node) => {

      this.onNodeDblClick (node)
    }

    this.domElement = document.createElement('div')

    this.domElement.classList.add('item-panel')

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: derivativesApiUrl
    })

    this.dmAPI = new DMAPI({
      apiUrl: dmApiUrl
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initialize (container, appContainer, viewerContainer) {

    $(container).append(this.domElement)

    this.viewerContainer = viewerContainer

    this.appContainer = appContainer

    this.TabManager = new TabManager(
      this.domElement)

    this.createItemDetailsTab()

    this.createVersionsTab()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async load (item) {

    this.item = item

    this.loadVersions(item)

    await this.loadItemDetails(item)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createItemDetailsTab () {

    const btnShowInTabId = this.guid()

    this.TabManager.addTab({
      name: 'Item details',
      html: `
        <div class="item-tab-container item-details">
          <div class="item-json-view">
          </div>
          <div class="controls">
            <button id="${btnShowInTabId}" class="btn">
              <span class="glyphicon glyphicon-share-alt">
              </span>
              Show in new tab ...
            </button>
          </div>
       </div>`
    })

    $('#' + btnShowInTabId).click(() => {

      const uri = `${this.dmAPI.apiUrl}/projects/` +
        `${this.item.projectId}/folders/` +
        `${this.item.folderId}/items/` +
        `${this.item.itemId}`

      this.showPayload(uri)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async loadItemDetails (item) {

    const details = await this.dmAPI.getItem(
      item.projectId,
      item.folderId,
      item.itemId)

    $(`.item-json-view`).JSONView(details, {
      collapsed: false
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createVersionsTab () {

    const btnShowInTabId = this.guid()

    this.TabManager.addTab({
      name: 'Versions',
      active: true,
      html: `
       <div class="item-tab-container item-versions">
         <div class="item-versions-tree">
         </div>
         <div class="controls">
          <button id="${btnShowInTabId}" class="btn">
            <span class="glyphicon glyphicon-share-alt">
            </span>
            Show in new tab ...
          </button>
         </div>
       </div>`
    })

    $('#' + btnShowInTabId).click(() => {

      const uri = `${this.dmAPI.apiUrl}/projects/` +
        `${this.item.projectId}/items/` +
        `${this.item.itemId}/versions`

      this.showPayload(uri)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadVersions (item) {

    $('.item-versions-tree').empty()

    const delegate = new ItemVersionsTreeDelegate(
      item, this.dmAPI, this.derivativesAPI)

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('setActiveVersion', (node) => {

      this.emit('setActiveVersion', node)
    })

    delegate.on('itemCreated', (data) => {

      this.emit('itemCreated', data)
    })

    const rootNode = {
      projectId: item.projectId,
      folderId: item.folderId,
      type: 'versions.root',
      itemId: item.itemId,
      hubId: item.hubId,
      name: item.name,
      id: this.guid(),
      group: true
    }

    const domContainer = $('.item-versions-tree')[0]

    this.versionsTree = new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, domContainer, {
        excludeRoot: false
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeDblClick (node) {

    if (node.type === 'versions.file' && node.manifest) {

      if (this.derivativesAPI.hasDerivative(
          node.manifest, { type: 'geometry'})) {

        node.showLoader(true)

        this.emit('loadVersion', node.version).then(() => {

          node.showLoader(false)

        }, (err) => {

          node.showLoader(false)
        })
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class ItemVersionsTreeDelegate extends BaseTreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (item, dmAPI, derivativesAPI) {

    super ()

    this.derivativesAPI = derivativesAPI

    this.dmAPI = dmAPI

    this.item = item
  }
  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getVersionURN (version) {

    if (version.relationships.storage) {

      var urn = window.btoa(
        version.relationships.storage.data.id)

      return urn.replace(new RegExp('=', 'g'), '')

    } else {

      return null
    }
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

    if (node.tooltip) {

      const html = `
        <div class="label-container">
            <label id="${labelId}"
              class="tooltip-container ${node.type}"
              ${options && options.localize?"data-i18n=" + text : ''}
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"800", "hide":"100"}'
                title="loading item ...">
              ${text}
            </label>
        </div>
      `

      $(parent).append(html)

      const $tooltipTarget = $(parent).find(
        '[data-toggle="tooltip"]')

      $tooltipTarget.tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })

      node.setTooltip = (title) => {

        $(parent).find('.tooltip-container')
          .attr('title', title)
          .tooltip('fixTitle')
          .tooltip('setContent')
      }

    } else {

      let label = `
        <div class="label-container">
            <label class="${node.type}" id="${labelId}"
              ${options && options.localize?"data-i18n=" + text : ''}>
              ${text}
            </label>
        </div>
      `

      $(parent).append(label)
    }

    switch (node.type) {

      case 'versions.attachments':

        $(parent).find('icon').before(`
          <div class="cloud-upload">
            <button" class="btn c${parent.id}"
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"800", "hide":"100"}'
                title="Upload attachment to that version">
              <span class="glyphicon glyphicon-cloud-upload">
              </span>
            </button>
          </div>
        `)

        $(`#${labelId}`).css({
          'pointer-events': 'none'
        })

        const container = this.container

        $(parent).dropzone({
          url: `/api/upload/dm/${node.projectId}/${node.folderId}`,
          clickable: `.btn.c${parent.id}`,
          dictDefaultMessage: ' - upload',
          previewTemplate: '<div></div>',
          parallelUploads: 20,
          autoQueue: true,
          init: function() {

            const dropzone = this

            dropzone.on('dragenter', () => {
              $(parent).addClass('drop-target')

              $(container).find(
                '.container').addClass('hover')
            })

            dropzone.on('dragleave', () => {
              $(parent).removeClass('drop-target')
            })

            dropzone.on('dragend', () => {
              $(parent).removeClass('drop-target')
            })

            dropzone.on('drop', () => {
              $(parent).removeClass('drop-target')
            })

            dropzone.on('addedfile', (file) => {

              node.showLoader(true)

              console.log(file)
            })

            dropzone.on('uploadprogress', (file, progress) => {

            })
          },
          success: (file, response) => {

            console.log(response)

            this.dmAPI.postVersionRelationshipRef (
              node.projectId,
              node.versionId,
              response.version.id).then((refRes) => {

                console.log(refRes)

                this.emit('itemCreated', {
                  version: response.version,
                  item: response.item,
                  node
                })

                const refVersion = response.version

                const refVerNum = refVersion.id.split('=')[1]

                const attachmentNode = {
                  name: refVersion.attributes.displayName +
                  ` (v${refVerNum})`,
                  type: 'versions.attachment',
                  projectId: node.projectId,
                  versionId: node.versionId,
                  folderId: node.folderId,
                  refVersion: refVersion,
                  hubId: node.hubId,
                  id: this.guid(),
                  group: false,
                  refVerNum
                }

                node.addChild(attachmentNode)

                node.showLoader(false)
              })
          }
        })

        break

      case 'versions.file':

        const version = node.version

        // checks if storage available
        if (version.relationships.storage) {

          // creates download button
          const downloadId = this.guid()

          const caption =
            `Download ${version.attributes.displayName} ` +
            `(v${node.verNum})`

          $(parent).find('icon').before(`
            <div class="cloud-download">
                <button" id="${downloadId}" class="btn c${parent.id}"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"800", "hide":"100"}'
                  title="${caption}">
                <span class="glyphicon glyphicon-cloud-download">
                </span>
              </button>
            </div>
          `)

          $(`#${downloadId}`).click(() => {

            node.showLoader(true, 3000)

            // downloads object associated with version
            this.dmAPI.download(version)
          })
        }

        break

      case 'versions.attachment':

        const refVersion = node.refVersion

        // checks if storage available
        if (refVersion.relationships.storage) {

          // creates download button
          const downloadId = this.guid()

          const caption =
            `Download ${refVersion.attributes.displayName} ` +
            `(v${node.refVerNum})`

          $(parent).before(`
            <div class="cloud-download attachment">
                <button" id="${downloadId}" class="btn c${parent.id}"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"800", "hide":"100"}'
                  title="${caption}">
                <span class="glyphicon glyphicon-cloud-download">
                </span>
              </button>
            </div>
          `)

          $(`#${downloadId}`).click(() => {

            node.showLoader(true, 3000)

            // downloads object associated with version
            this.dmAPI.download(refVersion)
          })
        }

        $(parent).before(`
          <div class="versions-attachment">
              <span class="fa fa-link">
              </span>
            </button>
          </div>
        `)

        break
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    const loadDivId = this.guid()

    node.showLoader = (show, timeout = 0) => {

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

      if(timeout > 0) {

        setTimeout(()=>{
          node.showLoader(false)
        }, timeout)
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    switch (node.type) {

      case 'versions.root':

        this.item.versions.forEach((version) => {

          const verNum = version.id.split('=')[1]

          const versionNode = {
            projectId: node.projectId,
            type: 'versions.version',
            folderId: node.folderId,
            versionId: version.id,
            name: 'v' + verNum,
            hubId: node.hubId,
            version: version,
            id: version.id,
            group: true,
            verNum
          }

          addChildCallback(versionNode)
        })

        const itemAttachmentsNode = {
          type: 'item.attachments',
          name: 'Item attachments',
          projectId: node.projectId,
          versionId: node.versionId,
          folderId: node.folderId,
          hubId: node.hubId,
          id: this.guid(),
          item: this.item,
          group: true
        }

        addChildCallback(itemAttachmentsNode)

        itemAttachmentsNode.collapse()

        break

      case 'versions.version':

        const versionFileNode = {
          name: node.version.attributes.displayName +
            ` (v${node.verNum})`,
          projectId: node.projectId,
          versionId: node.versionId,
          folderId: node.folderId,
          type: 'versions.file',
          version: node.version,
          verNum: node.verNum,
          hubId: node.hubId,
          id: this.guid(),
          group: true
        }

        addChildCallback(versionFileNode)

        versionFileNode.showLoader(true)

        const versionAttachmentsNode = new TreeNode({
          name: `Attachments (v${node.verNum})`,
          type: 'versions.attachments',
          projectId: node.projectId,
          versionId: node.versionId,
          folderId: node.folderId,
          version: node.version,
          verNum: node.verNum,
          hubId: node.hubId,
          id: this.guid(),
          group: true
        })

        versionAttachmentsNode.on('childrenLoaded',
          (children) => {

            versionAttachmentsNode.showLoader(false)
          })

        addChildCallback(versionAttachmentsNode)

        versionAttachmentsNode.showLoader(true)

        versionAttachmentsNode.collapse()

        break

      case 'versions.file':

        const urn = this.getVersionURN(node.version)

        this.derivativesAPI.getManifest(
          urn).then((manifest) => {

            node.manifest = manifest

            if (this.derivativesAPI.hasDerivative(
                manifest, { type: 'geometry'})) {

              node.parent.classList.add('derivated')
            }

            node.showLoader(false)

          }, () => {

            node.showLoader(false)
          })

        break

      case 'versions.attachments':

          this.dmAPI.getVersionRelationshipsRefs(
            node.projectId, node.versionId).then((response) => {

              const attachmentTasks = response.data.map((attachment) => {

                return new Promise((resolve, reject) => {

                  this.dmAPI.getVersion(
                    node.projectId, attachment.id).then(
                    (versionRes) => {

                      const refVersion = versionRes.data

                      const refVerNum = refVersion.id.split('=')[1]

                      const attachmentNode = {
                        name: refVersion.attributes.displayName +
                        ` (v${refVerNum})`,
                        type: 'versions.attachment',
                        projectId: node.projectId,
                        versionId: node.versionId,
                        folderId: node.folderId,
                        refVersion: refVersion,
                        hubId: node.hubId,
                        id: this.guid(),
                        group: false,
                        refVerNum
                      }

                      addChildCallback(attachmentNode)

                      resolve(attachmentNode)
                    })
                })
              })

              Promise.all(attachmentTasks).then((results) => {

                node.emit('childrenLoaded', results)

              }, () => {

                node.emit('childrenLoaded')
              })
            })

        break
    }
  }
}





