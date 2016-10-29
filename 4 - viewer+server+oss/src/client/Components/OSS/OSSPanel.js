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
import ContextMenu from './OSS.ContextMenu'
import EventsEmitter from 'EventsEmitter'
import Dropzone from 'dropzone'
import OSSAPI from './OSS.API'
import './OSSPanel.css'

export default class OSSPanel {

  constructor () {

  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async initialize (domContainer, appContainer) {

    this.ossAPI = new OSSAPI({
      apiUrl: '/api/oss'
    })

    this.contextMenu = new ContextMenu({
      container: domContainer
    })

    this.contextMenu.on('context.details', (data) => {

      if(data.node.details) {

        console.log(data.node.details)
      }
    })

    this.contextMenu.on('context.oss.createBucket', (data) => {

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

          console.log(response)

          let bucketNode = {
            bucketKey: response.bucketKey,
            name: response.bucketKey,
            id: response.bucketKey,
            type: 'oss.bucket',
            group: true
          }

          data.node.addChild(bucketNode)

          bucketNode.details = await this.ossAPI.getBucketDetails(
            response.bucketKey)
        }
      })
    })

    this.contextMenu.on('context.oss.object.delete', async(data) => {

      console.log('Deleting object: ' + data.node.objectKey)

      let response = await this.ossAPI.deleteObject(
        data.node.bucketKey,
        data.node.objectKey)

      console.log(response)
    })

    let delegate = new OSSTreeDelegate(
      domContainer,
      this.ossAPI,
      this.contextMenu)

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

    parent.classList.add(node.type)

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = guid()

    let label = `<label class="${node.type}" id="${labelId}"
        ${options && options.localize?"data-i18n=" + text : ''}>
        ${text}
      </label>`

    $(parent).append(label)

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
          })

          dropzone.on('uploadprogress', (file, progress) => {

          })
        },
        success: (file, response) => {

          console.log(response)

          let id = response.bucketKey + '-' + response.objectKey

          if(!$(container).find(`leaf[lmv-nodeid='${id}']`).length) {

            let objectNode = {
              objectId: response.objectId,
              bucketKey: node.bucketKey,
              objectKey: file.name,
              type: 'oss.object',
              name: file.name,
              details: null,
              group: false,
              id: id
            }

            node.addChild(objectNode)

            this.ossAPI.getObjectDetails(
              response.bucketKey,
              response.objectKey).then((objectDetails) => {

                objectNode.details = objectDetails
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

          node.emit('childrenLoaded', response.items)

          response.items.forEach((objectDetails) => {

            this.ossAPI.getObjectDetails(
              node.bucketKey, objectDetails.objectKey).then((objectDetails) => {

                let objectNode = new TreeNode({
                  id: node.bucketKey + '-' + objectDetails.objectKey,
                  objectKey: objectDetails.objectKey,
                  name: objectDetails.objectKey,
                  bucketKey: node.bucketKey,
                  details: objectDetails,
                  type: 'oss.object',
                  group: false
                })

                addChildCallback(objectNode)
              })
          })
        })

        break
    }
  }
}

function guid(format = 'xxxxxxxxxx') {

  var d = new Date().getTime()

  var guid = format.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })

  return guid
}
