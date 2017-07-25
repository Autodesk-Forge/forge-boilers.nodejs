//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
import CreateBucketPanel from './CreateBucketPanel/CreateBucketPanel'
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import RegionPanel from './RegionPanel/RegionPanel'
import {API as DerivativesAPI} from 'Derivatives'
import ToolPanelModal from 'ToolPanelModal'
import ContextMenu from './OSS.ContextMenu'
import {client as config} from 'c0nfig'
import ServiceManager from 'SvcManager'
import UIComponent from 'UIComponent'
import Dropzone from 'dropzone'
import OSSAPI from './OSS.API'
import './OSS.Panel.scss'

const bucketsWhiteList = [

]

export default class OSSPanel extends UIComponent {

  constructor () {

    super()

    this.onObjectNodeAddedHandler = (node) => {

      this.onObjectNodeAdded (node)
    }

    this.onNodeDblClickHandler = (node) => {

      this.onNodeDblClick (node)
    }

    this.onNodeIconClickHandler = (node) => {

      this.onNodeIconClick (node)
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async initialize (domContainer, appContainer, viewerContainer) {

    const storageSvc = ServiceManager.getService(
      'StorageSvc')

    const storedSettings = storageSvc.load(
      'forge.oss.settings')

    const defaultSettings = {
      region: 'EMEA'
    }

    this.storageSettings = Object.assign({},
      defaultSettings,
      storedSettings)

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: '/api/derivatives'
    })

    this.ossAPI = new OSSAPI({
      apiUrl: '/api/oss'
    })

    $('#region').click(() => {

      const dlg = new RegionPanel(
        appContainer,
        this.storageSettings.region)

      dlg.setVisible(true)

      dlg.on('close', (event) => {

        if (event.result === 'OK') {

          if(this.storageSettings.region !== dlg.Region) {

            this.storageSettings.region =
              dlg.Region

            storageSvc.save(
              'forge.oss.settings',
              this.storageSettings)

            this.loadStorage (domContainer)
          }
        }
      })
    })

    this.contextMenu = new ContextMenu({
      container: domContainer
    })

    this.contextMenu.on('context.oss.details', (data) => {

      if(data.node.details) {

        console.log(data.node.details)

        switch(data.node.type) {

          case 'oss.bucket':
            this.showPayload(
              `api/oss/buckets/${data.node.bucketKey}/details`)
            break

          case 'oss.object':
            this.showPayload(
              `api/oss/buckets/${data.node.bucketKey}/objects/` +
                `${data.node.objectKey}/details`)
            break
        }
      }
    })

    this.contextMenu.on('context.oss.bucket.create', (data) => {

      const dlg = new CreateBucketPanel(appContainer)

      dlg.setVisible(true)

      dlg.on('close', async(event) => {

        if (event.result === 'OK') {

          const bucketCreationData = {
            policyKey: dlg.PolicyKey,
            bucketKey: dlg.BucketKey
            //allow:[{
            //  authId: 'AYVir4YpIiobKbt7peqr0Y85uGuFdUj7',
            //  access: 'full'
            //}]
          }

          const createRes = await this.ossAPI.createBucket(
            bucketCreationData,
            this.storageSettings)

          const bucketNode = new TreeNode({
            bucketKey: dlg.BucketKey,
            name: dlg.BucketKey,
            id: dlg.BucketKey,
            type: 'oss.bucket',
            group: true
          })

          data.node.addChild(bucketNode)

          bucketNode.details = await this.ossAPI.getBucketDetails(
            dlg.BucketKey)
        }
      })
    })

    this.contextMenu.on('context.oss.bucket.delete', (data) =>{

      if (config.readOnlyBuckets.includes(data.node.bucketKey)) {

        return this.showCannotModifyBucket(
          data.node.bucketKey,
          appContainer)
      }

      const dlg = new ToolPanelModal(appContainer, {
        title: 'Delete bucket ...'
      })

      dlg.bodyContent(
        `<div class="confirm-delete">
          Are you sure you want to delete
          <b>
            ${data.node.bucketKey}
          </b>
          bucket?
        </div>
        `)

      dlg.setVisible(true)

      dlg.on('close', async(event) => {

        if (event.result === 'OK') {

          console.log('Deleting bucket: ' + data.node.bucketKey)

          data.node.showLoader(true)

          const response = await this.ossAPI.deleteBucket(
            data.node.bucketKey)

          data.node.remove()
        }
      })
    })

    this.contextMenu.on('context.oss.object.delete', async(data) =>{

      if (config.readOnlyBuckets.includes(data.node.bucketKey)) {

        return this.showCannotModifyBucket(
          data.node.bucketKey,
          appContainer)
      }

      console.log('Deleting object: ' + data.node.objectKey)

      data.node.showLoader(true)

      const response = await this.ossAPI.deleteObject(
        data.node.bucketKey,
        data.node.objectKey)

      console.log(response)

      data.node.remove()
    })

    this.contextMenu.on('context.viewable.delete', (data) => {

      data.node.showLoader(true)

      const urn = window.btoa(data.node.details.objectId).replace(
        new RegExp('=', 'g'), '')

      this.derivativesAPI.deleteManifest(urn).then(() => {

        data.node.manifest = null

        data.node.parent.classList.remove('derivated')

        data.node.showLoader(false)
      })
    })

    const isCompressedUrn = (objectKey) => {

      return new Promise ((resolve) => {

        const dlg = new ToolPanelModal(appContainer, {
          title: 'Assembly Model'
        })

        dlg.bodyContent(
          `<div class="confirm-delete">
              Is <b>${objectKey}</b>
              an assembly model?
            </div>
            `)

        dlg.setVisible(true)

        dlg.on('close', (event) => {

          resolve(event.result === 'OK')
        })
      })
    }

    this.contextMenu.on('context.viewable.create', async(data) => {

      try {

        data.node.showLoader(true)

        const urn = window.btoa(data.node.details.objectId).replace(
            new RegExp('=', 'g'), '')

        const job = {
          input: {
            urn: urn
          },
          output: {
            force: true,
            formats:[{
              type: 'svf',
              views: ['2d', '3d']
            }]
          }
        }

        if (data.node.details.objectKey.endsWith('.zip')) {

          job.input.compressedUrn =
            await isCompressedUrn(
              data.node.details.objectKey)

          job.input.rootFilename =
            data.node.details.objectKey.replace(
              new RegExp('.zip', 'g'), '')
        }

        await this.derivativesAPI.postJobWithProgress(
          job, {
          designName: data.node.details.objectKey,
          panelContainer: viewerContainer
        }, { type: 'geometry' })

        setTimeout(() => {
          this.onObjectNodeAddedHandler (data.node)
        }, 500)

      } catch (ex) {

        console.log('SVf Job failed: ' + data.node.objectKey)
        console.log(ex)

        data.node.showLoader(false)
      }
    })

    const searchInputId = this.guid()

    $(domContainer).append(`
      <div class="search">
        <input id="${searchInputId}" type="text"
          placeholder=" Search ...">
      </div>
    `)

    $('#' + searchInputId).on('input keyup', () => {

      const search = $('#' + searchInputId).val()

      this.filterNode(
        this.rootNode,
        search.toLowerCase())
    })

    this.loadStorage (domContainer)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  showCannotModifyBucket (bucketKey, appContainer) {

    const dlg = new ToolPanelModal(appContainer, {
      title: 'Read-only bucket ...'
    })

    dlg.bodyContent(
      `<div class="confirm-delete">
          This operation is not allowed on the demo bucket
          <br/>
          <b>
            ${bucketKey}.
          </b>
        </div>
        `)

    dlg.setVisible(true)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadStorage (domContainer) {

    if (this.storageTree) {

      $(this.storageTree.myRootContainer).remove()
    }

    const delegate = new OSSTreeDelegate(
      domContainer,
      this.ossAPI,
      this.contextMenu)

    delegate.storageSettings =
      this.storageSettings

    delegate.on('objectNodeAdded',
      this.onObjectNodeAddedHandler)

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('node.iconClick',
      this.onNodeIconClickHandler)

    const region = this.storageSettings.region

    this.rootNode = {
      id: this.guid(),
      name: `Root Storage [Region: ${region}]`,
      type: 'oss.root',
      group: true
    }

    this.storageTree = new Autodesk.Viewing.UI.Tree(
      delegate, this.rootNode, domContainer, {
        excludeRoot: false
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onObjectNodeAdded (node) {

    const bucketKey = encodeURIComponent(node.bucketKey)
    const objectKey = encodeURIComponent(node.objectKey)

    const fileId = (
      `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`)

    const urn = window.btoa(fileId).replace(
      new RegExp('=', 'g'), '')

    node.manifest = null

    node.showLoader(true)

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (this.derivativesAPI.hasDerivative (
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

          node.parent.classList.remove('derivated')

          node.showLoader(false)
        }

      }, (err) => {

        node.setTooltip('no derivative on this item')

        node.parent.classList.remove('derivated')

        node.showLoader(false)

        // file not derivated have no manifest
        // skip those errors
        if (err !== 'Not Found') {

          console.warn(err)
        }
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeDblClick (node) {

    if (node.type === 'oss.object' && node.manifest) {

      if (this.derivativesAPI.hasDerivative (
          node.manifest, { type: 'geometry'})) {

        node.showLoader(true)

        this.emit('loadObject', node.details).then(() => {

          node.showLoader(false)
        })
      }
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeIconClick (node) {

    if (node.type === 'oss.object') {

      node.showLoader(true)

      this.emit('loadDerivatives', node).then(() => {

        node.showLoader(false)
      })
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  filterNode (node, filter) {

    const name = node.name.toLowerCase()

    let visibleItems = 0

    if (node.children) {

      node.children.forEach((child) => {

        visibleItems += this.filterNode(child, filter)
      })

      if (visibleItems) {

        $(node.parent).css({
          display: 'block'
        })

      } else {

        if (name.indexOf(filter) < 0) {

          $(node.parent).css({
            display: 'none'
          })

        } else {

          $(node.parent).css({
            display: 'block'
          })
        }
      }

      return visibleItems

    } else {

      if (name.indexOf(filter) < 0) {

        $(node.parent).css({
          display: 'none'
        })

      } else {

        $(node.parent).css({
          display: 'block'
        })

        ++visibleItems
      }
    }

    return visibleItems
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class OSSTreeDelegate extends BaseTreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (container, ossAPI, contextMenu) {

    super(container, contextMenu)

    this.ossAPI = ossAPI
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
                data-delay='{"show":"1000", "hide":"100"}'
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

    if (node.type === 'oss.bucket') {

      $(parent).find('icon').before(`
        <div class="cloud-upload">
            <button" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"1000", "hide":"100"}'
              title="Upload files to that bucket">
            <span class="glyphicon glyphicon-cloud-upload">
            </span>
          </button>
        </div>
      `)

      $(`#${labelId}`).css({
        'pointer-events': 'none'
      })

      let container = this.container

      $(parent).dropzone({
        clickable: `.btn.c${parent.id}`,
        url: `/api/oss/buckets/${node.name}`,
        dictDefaultMessage: ' - upload',
        previewTemplate: '<div></div>',
        parallelUploads: 20,
        autoQueue: true,
        init: function() {

          let dropzone = this

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
            console.log('Initialize upload client -> server: ')
            console.log(file)
            node.showLoader(true)
          })

          dropzone.on('uploadprogress', (file, progress) => {
            console.log('upload client -> server: ')
            const rprogress = Math.round(progress * 100) / 100
            console.log('progress: ' + rprogress)
          })
        },
        sending: (file, xhr, formData) => {
          const socketSvc = ServiceManager.getService('SocketSvc')
          formData.append('socketId', socketSvc.socketId)
        },
        success: (file, response) => {

          console.log('upload complete: ')
          console.log(response)

          const id = response.bucketKey + '-' + response.objectKey
          
          this.ossAPI.getObjectDetails(
            response.bucketKey,
            response.objectKey).then((objectDetails) => {

              if($(container).find(`group[lmv-nodeid='${id}']`).length === 0) {

                const objectNode = new TreeNode({
                  id: response.bucketKey + '-' + response.objectKey,
                  objectKey: response.objectKey,
                  bucketKey: response.bucketKey,
                  name: response.objectKey,
                  details: objectDetails,
                  type: 'oss.object',
                  tooltip: true,
                  group: true
                })

                node.insert(objectNode)

                this.emit('objectNodeAdded', objectNode)
              }

              node.showLoader(false)
            })
        },
        error: (err) => {

          node.showLoader(false)
          console.log(err)
        }
      })

    } else if (node.type === 'oss.object') {

      let downloadId = this.guid()

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

        this.ossAPI.download(
          node.bucketKey,
          node.objectKey)

        setTimeout(() => {
          node.showLoader(false)
        }, 2000)
      })
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    node.remove = () => {
      $(`group[lmv-nodeid='${node.id}']`).remove()
    }

    node.insert = (child) => {

      const $group = $(node.parent).parent()

      let index = -1

      $group.find('> group').each(function(idx) {

        if ($(this).find('header').hasClass('object')) {

          const name =
            $(this).find('.label-container').text().
              replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '').
              replace(/(\r\n|\n|\r)/gm, '')

          if (child.name.localeCompare(name) > 0) {

            index = idx
          }

        } else if (child.type === 'oss.object') {

          index = idx
        }
      })

      node.addChild(child)

      const element = $(child.parent).parent().detach()

      $group.insertAt(index + 2, element)
    }

    const loadDivId = this.guid()

    node.showLoader = (show) => {

      if(!$('#' + loadDivId).length) {

        $('#' + labelId).after(`
          <div id=${loadDivId} class="label-loader"
            style="display:none;">
            <span> </span>
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

    node.addChild = addChildCallback

    switch(node.type) {

      case 'oss.root':

        this.ossAPI.getBuckets(this.storageSettings).then(
          (response) => {

            node.children = []

            const buckets = _.sortBy(response.items,
              (bucketDetails) => {
                return bucketDetails.bucketKey.toLowerCase()
              })

            buckets.forEach((bucket) => {

              let bucketNode = new TreeNode({
                bucketKey: bucket.bucketKey,
                name: bucket.bucketKey,
                id: bucket.bucketKey,
                type: 'oss.bucket',
                group: true
              })

              bucketNode.on('childrenLoaded', (children) => {

                bucketNode.showLoader(false)
              })

              node.children.push(bucketNode)

              addChildCallback(bucketNode)

              bucketNode.showLoader(true)

              bucketNode.collapse()

              this.ossAPI.getBucketDetails(
                bucket.bucketKey).then((bucketDetails) => {

                  bucketNode.details = bucketDetails
                })
            })
          })

        break

      case 'oss.bucket':

        const query = this.storageSettings

        this.ossAPI.getObjects(
          node.bucketKey,
          query).then((response) => {

            node.children = []

            const items = _.sortBy(response.items,
              (objectDetails) => {
                return objectDetails.objectKey.toLowerCase()
              })

            let itemTasks = items.map((item) => {

              return new Promise((resolve, reject) => {

                let objectNode = new TreeNode({
                  id: node.bucketKey + '-' + item.objectKey,
                  objectKey: item.objectKey,
                  name: item.objectKey,
                  bucketKey: node.bucketKey,
                  type: 'oss.object',
                  tooltip: true,
                  group: true
                })

                node.children.push(objectNode)

                addChildCallback(objectNode)

                this.emit('objectNodeAdded', objectNode)

                objectNode.showLoader(true)

                this.ossAPI.getObjectDetails(
                  node.bucketKey, item.objectKey).then((objectDetails) => {

                    objectNode.details = objectDetails

                    resolve()
                  })
              })
            })

            Promise.all(itemTasks).then(() => {

              node.emit('childrenLoaded', response.items)
            })
          })

        break
    }
  }
}