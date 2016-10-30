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
import {API as DerivativesAPI} from 'Derivatives'
import ToolPanelModal from 'ToolPanelModal'
import ContextMenu from './OSS.ContextMenu'
import UIComponent from 'UIComponent'
import Dropzone from 'dropzone'
import OSSAPI from './OSS.API'
import './OSS.Panel.scss'

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

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: '/api/derivatives'
    })

    this.ossAPI = new OSSAPI({
      apiUrl: '/api/oss'
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

      let modal = new CreateBucketPanel(appContainer)

      modal.setVisible(true)

      modal.on('close', async(event) => {

        if (event.result === 'OK') {

          let bucketCreationData = {
            policyKey: modal.PolicyKey,
            bucketKey: modal.BucketKey
            //allow:[{
            //  authId: 'AYVir4YpIiobKbt7peqr0Y85uGuFdUj7',
            //  access: 'full'
            //}]
          }

          let response = await this.ossAPI.createBucket(
            bucketCreationData)

          let bucketNode = new TreeNode({
            bucketKey: response.bucketKey,
            name: response.bucketKey,
            id: response.bucketKey,
            type: 'oss.bucket',
            group: true
          })

          data.node.addChild(bucketNode)

          bucketNode.details = await this.ossAPI.getBucketDetails(
            response.bucketKey)
        }
      })
    })

    this.contextMenu.on('context.oss.bucket.delete', async(data) =>{

      console.log('Deleting bucket: ' + data.node.bucketKey)

      data.node.showLoader(true)

      let response = await this.ossAPI.deleteBucket(
        data.node.bucketKey)

      console.log(response)

      data.node.remove()
    })

    this.contextMenu.on('context.oss.object.delete', async(data) =>{

      console.log('Deleting object: ' + data.node.objectKey)

      data.node.showLoader(true)

      let response = await this.ossAPI.deleteObject(
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

    this.contextMenu.on('context.viewable.create', async(data) => {

      try {

        data.node.showLoader(true)

        const urn = window.btoa(data.node.details.objectId).replace(
            new RegExp('=', 'g'), '')

        let input = {
          urn: urn
        }

        console.log('Posting SVF Job: ')
        console.log(input)

        let response = await this.derivativesAPI.postSVFJob(
          input,
          data.node.details.objectKey,
          viewerContainer)

        setTimeout(() => {
          this.onObjectNodeAddedHandler (data.node)
        }, 500)

      } catch (ex) {

        console.log('SVf Job failed: ' + data.node.objectKey)
        console.log(ex)

        data.node.showLoader(false)
      }
    })

    const delegate = new OSSTreeDelegate(
      domContainer,
      this.ossAPI,
      this.contextMenu)

    delegate.on('objectNodeAdded',
      this.onObjectNodeAddedHandler)

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('node.iconClick',
      this.onNodeIconClickHandler)

    let rootNode = {
      id: guid(),
      name: 'Root Storage',
      type: 'oss.root',
      group: true
    }

    new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, domContainer, {
        excludeRoot: false
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onObjectNodeAdded (node) {

    const urn = window.btoa(node.details.objectId).replace(
      new RegExp('=', 'g'), '')

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (manifest.status   === 'success' &&
            manifest.progress === 'complete') {

          if (this.derivativesAPI.hasDerivative(
              manifest, { outputType: 'svf' })) {

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

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeDblClick (node) {

    if (node.type === 'oss.object' && node.manifest) {

      if (this.derivativesAPI.hasDerivative(
          node.manifest, { outputType: 'svf' })) {

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

    parent.id = guid()

    node.parent = parent

    node.type.split('.').forEach((cls) => {
      parent.classList.add(cls)
    })

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = guid()

    if (node.tooltip) {

      let html = `
        <div class="label-container">
            <label class="${node.type}" id="${labelId}"
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

      $(parent).find('label[data-toggle="tooltip"]').tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })

      node.setTooltip = (title) => {

        $(parent).find('label')
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
        url: `/api/upload/oss/${node.name}`,
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
            console.log(file)
            node.showLoader(true)
          })

          dropzone.on('uploadprogress', (file, progress) => {

          })
        },
        success: (file, response) => {

          console.log(response)

          let id = response.bucketKey + '-' + response.objectKey

          if(!$(container).find(`leaf[lmv-nodeid='${id}']`).length) {

            this.ossAPI.getObjectDetails(
              response.bucketKey,
              response.objectKey).then((objectDetails) => {

                let objectNode = new TreeNode({
                  id: response.bucketKey + '-' + response.objectKey,
                  objectKey: response.objectKey,
                  bucketKey: response.bucketKey,
                  name: response.objectKey,
                  details: objectDetails,
                  type: 'oss.object',
                  tooltip: true,
                  group: true
                })

                node.addChild(objectNode)

                node.showLoader(false)

                this.emit('objectNodeAdded', objectNode)
              })
          }
        }
      })

    } else if (node.type === 'oss.object') {

      let downloadId = guid()

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

    let loadDivId = guid()

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

    node.addChild = addChildCallback

    switch(node.type) {

      case 'oss.root':

        this.ossAPI.getBuckets().then((response) => {

          response.items.forEach((bucketDetails) => {

            this.ossAPI.getBucketDetails(
              bucketDetails.bucketKey).then((bucketDetails) => {

                let bucketNode = new TreeNode({
                  bucketKey: bucketDetails.bucketKey,
                  name: bucketDetails.bucketKey,
                  id: bucketDetails.bucketKey,
                  details: bucketDetails,
                  type: 'oss.bucket',
                  group: true
                })

                bucketNode.on('childrenLoaded', (children) => {

                  bucketNode.showLoader(false)
                })

                addChildCallback(bucketNode)

                bucketNode.showLoader(true)

                bucketNode.collapse()
              })
          })
        })

        break

      case 'oss.bucket':

        this.ossAPI.getObjects(node.bucketKey).then((response) => {

          let itemTasks = response.items.map((item) => {

            return new Promise((resolve, reject) => {

              this.ossAPI.getObjectDetails(
                node.bucketKey, item.objectKey).then((objectDetails) => {

                  let objectNode = new TreeNode({
                    id: node.bucketKey + '-' + objectDetails.objectKey,
                    objectKey: objectDetails.objectKey,
                    name: objectDetails.objectKey,
                    bucketKey: node.bucketKey,
                    details: objectDetails,
                    type: 'oss.object',
                    tooltip: true,
                    group: true
                  })

                  addChildCallback(objectNode)

                  objectNode.showLoader(true)

                  resolve()

                  this.emit('objectNodeAdded', objectNode)
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

function guid(format = 'xxxxxxxxxx') {

  let d = new Date().getTime()

  let guid = format.replace(
    /[xy]/g,
    function (c) {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })

  return guid
}
