/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import ToolPanelModal from 'ToolPanelModal'
import EventsEmitter from 'EventsEmitter'
import UIComponent from 'UIComponent'
import TabManager from 'TabManager'
import DerivativesAPI from '../API'
import './ManagerPanel.scss'

export default class DerivativesManagerPanel extends UIComponent {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (apiUrl = '/api/derivatives') {

    super()

    this.domElement = document.createElement('div')

    this.domElement.classList.add('derivatives')

    this.derivativesAPI = new DerivativesAPI({
      apiUrl
    })

    this.TabManager = new TabManager(
      this.domElement)

    this.apiUrl = apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initialize (container) {

    $(container).append(this.domElement)

    this.createManifestTab()

    this.createHierarchyTab()

    this.createExportsTab()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  load (urn) {

    this.urn = urn

    return Promise.all([
      this.loadHierarchy(urn),
      this.loadManifest(urn),
      this.loadExports(urn)
    ])
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createManifestTab () {

    const btnShowInTabId = this.guid()

    const btnDeleteId = this.guid()

    this.TabManager.addTab({
      name: 'Manifest',
      active: true,
      html: `
        <div class="derivatives-tab-container manifest">
          <div class="json-view">
          </div>
          <div class="controls">
            <button id="${btnShowInTabId}" class="btn">
              <span class="glyphicon glyphicon-share-alt">
              </span>
              Show in new tab ...
            </button>
            <br/>
            <button id="${btnDeleteId}" class="btn">
              <span class="glyphicon glyphicon-remove">
              </span>
              Delete manifest
            </button>
          </div>
       </div>`
    })

    $('#' + btnShowInTabId).click(() => {

      const uri = `${this.apiUrl}/manifest/${this.urn}`

      this.showPayload(uri)
    })

    $('#' + btnDeleteId).click(() => {

      $(`.json-view`).JSONView({
        message: 'No manifest on this item'
      })

      $('.manifest .controls').css({
        display: 'none'
      })

      this.emit('manifest.delete', this.urn)

      this.derivativesAPI.deleteManifest(this.urn)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadManifest (urn) {

    return new Promise((resolve) => {

      this.derivativesAPI.getManifest(
        urn).then((manifest) => {

          $(`.json-view`).JSONView(manifest, {
            collapsed: false
          })

          $('.manifest .controls').css({
            display: 'block'
          })

          resolve()

        }, (error) => {

          $(`.json-view`).JSONView({
            message: 'No manifest on this item'
          })

          $('.manifest .controls').css({
            display: 'none'
          })

          resolve()
        })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createExportsTab () {

    this.TabManager.addTab({
      name: 'Exports',
      html: `
        <div class="derivatives-tab-container exports">
           <div class="exports-tree">

           </div>
           <div class="exports-formats">

           </div>
           <div class="exports-payload">

           </div>
       </div>`
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadExports (urn) {

    return new Promise((resolve) => {

      resolve()
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createHierarchyTab () {

    const btnShowInTabId = this.guid()

    this.TabManager.addTab({
      name: 'Hierarchy',
      html: `
        <div class="derivatives-tab-container hierarchy">
          <div class="hierarchy-tree">
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

      const uri = `${this.apiUrl}/hierarchy/` +
        `${this.urn}/${this.modelGuid}`

      this.showPayload(uri)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadHierarchy (urn) {

    return new Promise(async(resolve) => {

      try {

        $('.hierarchy-tree').empty()

        const metadataResponse = await this.derivativesAPI.getMetadata(
          this.urn)

        const metadata = metadataResponse.data.metadata

        if (metadata && metadata.length) {

          this.modelGuid = metadata[0].guid

          const hierarchy = await this.derivativesAPI.getHierarchy(
            this.urn, this.modelGuid)

          const delegate = new HierarchyTreeDelegate(
            hierarchy.data)

          const rootNode = {
            id: this.guid(),
            name: 'Model Hierarchy',
            type: 'hierarchy.root',
            group: true
          }

          const domContainer = $('.hierarchy-tree')[0]

          new Autodesk.Viewing.UI.Tree(
            delegate, rootNode, domContainer, {
              excludeRoot: false
            })

          $('.hierarchy .controls').css({
            display: 'block'
          })
        }

        resolve()

      } catch (ex) {

        console.log(ex)
        resolve()
      }
    })
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class HierarchyTreeDelegate
  extends EventsEmitter.Composer (BaseTreeDelegate)
{

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (hierarchy) {

    super()

    this.hierarchy = hierarchy
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild(node, addChildCallback) {

    switch (node.type) {

      case 'hierarchy.root':

        this.hierarchy.objects.forEach((obj) => {

          var objectNode = {
            objects: obj.objects,
            id: obj.objectid,
            type: 'objects',
            name: obj.name,
            group: true
          }

          addChildCallback(objectNode)
        })

        break

      case 'objects':

        if (node.objects) {

          node.objects.forEach((obj) => {

            var objectNode = {
              objects: obj.objects,
              id: obj.objectid,
              type: 'objects',
              name: obj.name,
              group: true
            }

            if (!obj.objects) {

              objectNode.type += '.leaf'
            }

            addChildCallback(objectNode)
          })
        }

        break
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class ExportsTreeDelegate
  extends EventsEmitter.Composer (BaseTreeDelegate)
{

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor () {

    super()

  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async forEachChild(node, addChildCallback) {

    switch (node.type) {


    }
  }
}







