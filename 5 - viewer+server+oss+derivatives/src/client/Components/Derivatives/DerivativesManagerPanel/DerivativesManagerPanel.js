/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import DerivativesAPI from '../Derivatives.API'
import ToolPanelModal from 'ToolPanelModal'
import './DerivativesManagerPanel.scss'
import UIComponent from 'UIComponent'
import TabManager from 'TabManager'

export default class DerivativesManagerPanel extends UIComponent {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (apiUrl = '/api/derivatives') {

    super()

    this.domElement = document.createElement('div')

    this.derivativesAPI = new DerivativesAPI({
      apiUrl
    })

    this.TabManager = new TabManager(
      this.domElement)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initialize (container) {

    $(container).append(this.domElement)

    this.createManifestTab()

    this.createExportsTab()

    this.createHierarchyTab()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  load (urn) {

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        $(`.json-view`).JSONView(manifest, {
          collapsed: false
        })

      }, (error) => {

        $(`.json-view`).JSONView({
          message: 'No manifest on this object'
        })

      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createManifestTab () {

    this.btnShowInTabId = this.guid()

    this.btnDeleteId = this.guid()

    this.TabManager.addTab({
      name: 'Manifest',
      active: true,
      html: `<div class="derivatives-tab-container manifest">
                <div class="json-view">
                </div>
                <div class="controls">
                  <button id="${this.btnShowInTabId}" class="btn">
                    <span class="glyphicon glyphicon-share-alt">
                    </span>
                    Show in new tab ...
                  </button>
                  <br/>
                  <button id="${this.btnDeleteId}" class="btn">
                    <span class="glyphicon glyphicon-remove">
                    </span>
                    Delete manifest
                  </button>
                </div>
             </div>`
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createExportsTab () {

    this.TabManager.addTab({
      name: 'Exports',
      html: `<div class="derivatives-tab-container">
             <div>

             </div>
             <div>

             </div>
             <div>

             </div>
             </div>`
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createHierarchyTab () {

    this.TabManager.addTab({
      name: 'Hierarchy',
      html: `<div class="derivatives-tab-container">
             </div>`
    })
  }
}






