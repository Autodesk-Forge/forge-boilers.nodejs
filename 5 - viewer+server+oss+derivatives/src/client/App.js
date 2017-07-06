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
import ModelTransformerExtension from 'Viewing.Extension.ModelTransformer'
import {ManagerPanel as DerivativesManagerPanel} from 'Derivatives'
import ViewerPanel from 'Viewer/ViewerPanel'
import 'jquery-ui/themes/base/resizable.css'
import ToolPanelModal from 'ToolPanelModal'
import 'jquery-ui/ui/widgets/resizable'
import {client as config} from 'c0nfig'
import OSSPanel from 'OSS/OSS.Panel'
import Toolkit from 'Viewer.Toolkit'
import SocketSvc from 'SocketSvc'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import 'jquery-ui'
import 'app.css'

//Services
import ServiceManager from 'SvcManager'
import StorageSvc from 'StorageSvc'

// ========================================================
// Services Initialization
// ========================================================
const socketSvc = new SocketSvc({
  host: config.host,
  port: config.port
})

socketSvc.connect().then((socket) => {
  console.log(`${config.host}:${config.port}`)
  console.log('Client socket connected: ' + socket.id)
})

socketSvc.on('progress', (info) => {
  console.log('upload server -> forge: ')
  console.log(info)
})

const storageSvc = new StorageSvc({
  storageKey: 'forge.oss.settings'
})

// ========================================================
// Services Registration
// ========================================================
ServiceManager.registerService(storageSvc)
ServiceManager.registerService(socketSvc)

// ========================================================
// App
// ========================================================
export default class App {

  constructor() {

    this.derivativesPanel = new DerivativesManagerPanel()

    this.viewerPanel = new ViewerPanel()

    this.ossPanel = new OSSPanel()

    this.$toggleOSS = $('#oss-toggle')

    this.$toggleOSS.click((e) => {

      this.onToggleOSS(e)
    })

    $('#about').click((e) => {

      this.onAbout(e)
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Initialize client App
  //
  ///////////////////////////////////////////////////////////////////
  initialize () {

    $('.left-panel').resizable({
      handles: 'e',
      resize : (event, ui) => {

        this.viewerPanel.onResize()
      },
      create: (event, ui) => {

        $('.top-panel').resizable({
          handles: 's',
          create: (event, ui) => {

            this.panelContainers = {
              derivatives: document.getElementById('derivatives-panel'),
              viewer: document.getElementById('viewer-panel'),
              app: document.getElementById('app-panel'),
              oss: document.getElementById('oss-panel')
            }

            this.derivativesPanel.initialize(
              this.panelContainers.derivatives,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.viewerPanel.initialize(
              this.panelContainers.viewer)

            this.ossPanel.initialize(
              this.panelContainers.oss,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.ossPanel.on('loadObject', (item) => {

              return this.onLoadItem(item)
            })

            this.ossPanel.on('loadDerivatives', (node) => {

              return this.onLoadDerivatives(node)
            })
          }
        })
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onLoadItem (item) {

    return new Promise(async(resolve, reject) => {

      const urn = 'urn:' + window.btoa(item.objectId)

      const doc = await this.viewerPanel.loadDocument(urn)

      const viewer = this.viewerPanel.viewer

      const extInstance =  await viewer.loadExtension(
        ModelTransformerExtension, {
          parentControl: 'modelTools',
          autoLoad: false
        })

      const path = this.viewerPanel.getDefaultViewablePath(doc)

      const loadOptions = {
        placementTransform:
         extInstance.buildPlacementTransform(item.objectKey)
      }
      
      viewer.loadModel(path, loadOptions, (model) => {

        model.name = item.objectKey

        extInstance.addModel(model)

        resolve(model)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onLoadDerivatives (node) {

    return new Promise((resolve, reject) => {

      const urn = window.btoa(node.details.objectId).replace(
        new RegExp('=', 'g'), '')

      $('#model-name').text(node.name)

      this.derivativesPanel.off()

      this.derivativesPanel.on('manifest.reload', () => {

        this.ossPanel.onObjectNodeAdded (node)
      })

      this.derivativesPanel.load(urn, node).then(() => {

        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Toggles OSS panel
  //
  ///////////////////////////////////////////////////////////////////
  onToggleOSS () {

    $('.left-panel').css({
      display: this.$toggleOSS.hasClass('active') ?
        'none' : 'block'
    })

    this.$toggleOSS.toggleClass('active')

    this.viewerPanel.onResize()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onAbout () {

    const aboutDlg = new ToolPanelModal(
      this.panelContainers.app, {
        title: 'About this sample ...',
        showCancel: false
      })

    aboutDlg.bodyContent(`
      <div>
        <br>
        Written by <a href="https://twitter.com/F3lipek"
          target="_blank">
          Philippe Leefsma
        </a>, November 2016
        <hr class="about"/>
        Source on
        <a href="https://github.com/Autodesk-Forge/forge-boilers.nodejs/tree/master/5%20-%20viewer%2Bserver%2Boss%2Bderivatives"
          target="_blank">
          Github
        </a>
      </div>
    `)

    aboutDlg.setVisible(true)
  }
}
