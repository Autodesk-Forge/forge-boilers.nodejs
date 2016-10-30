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
import {ManagerPanel as DerivativesManagerPanel} from 'Derivatives'
import ViewerPanel from 'Components/Viewer/ViewerPanel'
import OSSPanel from 'Components/OSS/OSS.Panel'
import 'jquery-ui/themes/base/resizable.css'
import 'jquery-ui/ui/widgets/resizable'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import 'jquery-ui'
import 'app.css'

export default class App {

  constructor() {

    this.derivativesPanel = new DerivativesManagerPanel()

    this.viewerPanel = new ViewerPanel()

    this.ossPanel = new OSSPanel()

    this.$toggleOSS = $('#oss-toggle')

    this.$toggleOSS.click((e) => {

      this.onToggleOSS(e)
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
              this.panelContainers.derivatives)

            this.viewerPanel.initialize(
              this.panelContainers.viewer)

            this.ossPanel.initialize(
              this.panelContainers.oss,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.ossPanel.on('loadObject', (item) => {

              const urn = 'urn:' + window.btoa(item.objectId)

              return this.onLoadItem(urn)
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
  onLoadItem (urn) {

    return new Promise(async(resolve, reject) => {

      let doc = await this.viewerPanel.loadDocument(urn)

      let viewer = this.viewerPanel.viewer

      if (viewer.model) {

        viewer.impl.unloadModel(
          viewer.model)

        viewer.impl.sceneUpdated(true)
      }

      let path = this.viewerPanel.getDefaultViewablePath(doc)

      let loadOptions = {}

      viewer.loadModel(path, loadOptions, (model) => {

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

      const modelName = node.details.objectKey

      $('#model-name').text(modelName)

      this.derivativesPanel.off()

      this.derivativesPanel.on('manifest.delete', () => {

        node.parent.classList.remove('derivated')
      })

      this.derivativesPanel.load(urn).then(() => {

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
}
