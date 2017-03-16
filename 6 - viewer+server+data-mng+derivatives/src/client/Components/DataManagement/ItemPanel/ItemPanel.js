/////////////////////////////////////////////////////////////////////
// ItemPanel Panel
// by Philippe Leefsma, November 2016
//
/////////////////////////////////////////////////////////////////////

import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import {API as DerivativesAPI} from 'Derivatives'
import VersionIdPanel from './VersionIdPanel'
import ContextMenu from './ItemContextMenu'
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

    this.contextMenu = new ContextMenu({
      container: document.body
    })

    this.contextMenu.on('context.details', (data) => {

      switch (data.node.type) {

        case 'item.root':
          this.showPayload(`${this.dmAPI.apiUrl}/projects/` +
          `${data.node.projectId}/items/` +
          `${data.node.itemId}/versions`)
          break

        case 'versions.version':
          this.showPayload(
            `${this.dmAPI.apiUrl}/projects/` +
            `${data.node.projectId}/versions/` +
            `${encodeURIComponent(data.node.versionId)}`)
          break

        case 'versions.attachments':
          this.showPayload(
            `${this.dmAPI.apiUrl}/projects/` +
            `${data.node.projectId}/versions/` +
            `${encodeURIComponent(data.node.versionId)}` +
            `/relationships/refs`)
          break
      }
    })

    this.contextMenu.on('context.viewable.create', async(data) => {

      try {

        data.node.showLoader(true)

        const version = data.node.version

        let input = {
          urn: this.getVersionURN(version)
        }

        const output = {
          force: true,
          formats:[{
            type: 'svf',
            views: ['2d', '3d']
          }]
        }

        const fileExtType = (version.attributes && version.attributes.extension) ?
          version.attributes.extension.type : null

        if (fileExtType === 'versions:autodesk.a360:CompositeDesign') {

          input.rootFilename = version.attributes ?
            version.attributes.name :
            null

          input.compressedUrn = true
        }

        const job = {
          output,
          input
        }

        await this.derivativesAPI.postJobWithProgress(
          job, {
            panelContainer: viewerContainer,
            designName: data.node.name
          }, { type: 'geometry' })

        setTimeout(() => {
          this.onFileNodeAdded (data.node)
        }, 500)

      } catch (ex) {

        console.log('SVF Job failed')
        console.log(ex)

        data.node.showLoader(false)
      }
    })

    this.contextMenu.on('context.setActiveVersion', (data) => {

      data.node.setActiveVersion()

      this.emit('setActiveVersion', data.node)
    })

    this.contextMenu.on('context.viewable.delete', (data) => {

      const urn = this.getVersionURN(data.node.version)

      data.node.showLoader(true)

      this.derivativesAPI.deleteManifest(urn).then(() => {

        data.node.setTooltip('no SVF derivative on this item')

        data.node.parent.classList.remove('derivated')

        data.node.showLoader(false)

        data.node.manifest = null

      }, (err) => {

        data.node.showLoader(false)
      })
    })

    this.contextMenu.on('context.attachment.addById', (data) => {

      const dlg = new VersionIdPanel(appContainer)

      dlg.setVisible(true)

      dlg.on('close', (event) => {

        if (event.result === 'OK') {

          const node = data.node

          node.showLoader(true)

          this.dmAPI.postVersionRelationshipRef (
            node.projectId,
            node.versionId,
            dlg.versionId).then(async(refRes) => {

            const refVersionRes = await this.dmAPI.getVersion(
              node.projectId,
              dlg.versionId)

            const refVersion = refVersionRes.data

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
    })

    this.createItemDetailsTab()

    this.createVersionsTab()
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
        `${this.item.projectId}/items/` +
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

    this.TabManager.addTab({
      name: 'Versions',
      active: true,
      html: `
       <div class="item-tab-container item-versions">
         <div class="item-versions-tree">
         </div>
       </div>`
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadVersions (itemNode) {

    $('.item-versions-tree').empty()

    const delegate = new ItemVersionsTreeDelegate(
      itemNode, this.dmAPI,
      this.derivativesAPI,
      this.contextMenu)

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('itemCreated', (data) => {

      this.emit('itemCreated', data)
    })

    delegate.on('fileNodeAdded', (node) => {

      this.onFileNodeAdded(node)
    })

    const rootNode = {
      activeVersion: itemNode.activeVersion,
      projectId: itemNode.projectId,
      folderId: itemNode.folderId,
      itemId: itemNode.itemId,
      hubId: itemNode.hubId,
      name: itemNode.name,
      type: 'item.root',
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

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onFileNodeAdded (node) {

    node.showLoader(true)

    var version = node.version

    if (!version.relationships.storage) {

      node.setTooltip('derivatives unavailable on this version')

      node.parent.classList.add('unavailable')

      node.showLoader(false)

      return
    }

    var urn = this.getVersionURN(version)

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (manifest.status   === 'success' &&
            manifest.progress === 'complete') {

          if (this.derivativesAPI.hasDerivative(
              manifest, { type: 'geometry'})) {

            node.parent.classList.add('derivated')

            this.derivativesAPI.getThumbnail(
              urn, {
                width: 200,
                height: 200
              }).then((thumbnail) => {

                let img = `<img width="150" height="150"
                    src='data:image/png;base64,${thumbnail}'/>`

                node.setTooltip(img)

                node.showLoader(false)
              })

          } else {

            node.setTooltip('no SVF derivative on this item')

            node.showLoader(false)
          }

        } else {

          node.showLoader(false)
        }

      }, (err) => {

        node.setTooltip('no derivative on this item')

        node.showLoader(false)

        // file not derivated have no manifest
        // skip those errors
        if (err !== 'Not Found') {

          console.warn(err)
        }
      })
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
  constructor (item, dmAPI, derivativesAPI, contextMenu) {

    super (null, contextMenu)

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

      case 'versions.version':

        const activeVersionId = this.guid()

        $(parent).append(`
          <div id="${activeVersionId}" class="active-version">
              <span class="fa fa-check">
              </span>
            </button>
          </div>
        `)

        node.setActiveVersion = () => {

          $('.active-version').css({
            display: 'none'
          })

          $('#' + activeVersionId).css({
            display: 'block'
          })
        }

        if(node.active) {

          node.setActiveVersion()
        }

        break

      case 'versions.attachments':
      case 'item.attachments':

        $(parent).find('icon').before(`
          <div class="cloud-upload">
            <button" class="btn c${parent.id}"
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"800", "hide":"100"}'
                title="Upload attachment">
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
          url: `/api/upload/dm/` +
            `projects/${node.projectId}/` +
            `folders/${node.folderId}`,
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

            const postAPI = (node.type === 'item.attachments' ?

              this.dmAPI.postItemRelationshipRef (
                  node.projectId,
                  node.itemId,
                  response.version.id)
              :
              this.dmAPI.postVersionRelationshipRef (
                  node.projectId,
                  node.versionId,
                  response.version.id)
              )

            postAPI.then((refRes) => {

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
      case 'item.attachment':

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
          <div class="data-attachment">
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
          <div id=${loadDivId} class="label-loader">
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

      case 'item.root':

        const activeVerNum = node.activeVersion.id.split('=')[1]

        this.item.versions.forEach((version) => {

          const verNum = version.id.split('=')[1]

          const versionNode = {
            active: verNum === activeVerNum,
            projectId: node.projectId,
            type: 'versions.version',
            folderId: node.folderId,
            versionId: version.id,
            itemId: node.itemId,
            name: 'v' + verNum,
            hubId: node.hubId,
            version: version,
            id: version.id,
            group: true,
            verNum
          }

          addChildCallback(versionNode)
        })

        //TODO: item attachment not avail yet in DM API

        //const itemAttachmentsNode = new TreeNode({
        //  type: 'item.attachments',
        //  name: 'Item attachments',
        //  projectId: node.projectId,
        //  versionId: node.versionId,
        //  folderId: node.folderId,
        //  itemId: node.itemId,
        //  hubId: node.hubId,
        //  id: this.guid(),
        //  item: this.item,
        //  group: true
        //})
        //
        //itemAttachmentsNode.on('childrenLoaded',
        //  (children) => {
        //
        //    itemAttachmentsNode.showLoader(false)
        //  })
        //
        //addChildCallback(itemAttachmentsNode)
        //
        //itemAttachmentsNode.showLoader(true)
        //
        //itemAttachmentsNode.collapse()

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
          tooltip: true,
          group: true
        }

        addChildCallback(versionFileNode)

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

        this.emit('fileNodeAdded', node)

        break

      case 'item.attachments':

        this.dmAPI.getItemRelationshipsRefs(
          node.projectId, node.itemId).then((response) => {

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
                      projectId: node.projectId,
                      versionId: node.versionId,
                      folderId: node.folderId,
                      type: 'item.attachment',
                      refVersion: refVersion,
                      itemId: node.itemId,
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





