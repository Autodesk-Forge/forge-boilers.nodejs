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
import ViewerPanel from 'Components/Viewer/ViewerPanel'
import OSSPanel from 'Components/OSS/OSSPanel'
import 'jquery-ui/themes/base/resizable.css'
import 'jquery-ui/ui/widgets/resizable'
import 'bootstrap-webpack'
import 'splitter.css'
import 'jquery-ui'
import 'app.css'

export default class App {

  constructor() {

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

    $(".panel-left").resizable({
      handles: 'e, w',
      resize : (event, ui) => {

        this.viewerPanel.onResize()
      },
      create: async(event, ui) => {

        $(".ui-resizable-e").css("cursor","col-resize")

        var viewerContainer =
          document.getElementById('viewer')

        this.viewerPanel.initialize(viewerContainer)

        var panelContainer =
         document.getElementById('oss')

        var appContainer =
          document.getElementById('appContainer')

        this.ossPanel.initialize(
          panelContainer,
          appContainer,
          viewerContainer)

        this.ossPanel.on('loadObject', (details) => {

          return new Promise(async(resolve, reject) => {

            let urn = 'urn:' + window.btoa(details.objectId)

            let doc = await this.viewerPanel.loadDocument(urn)

            let viewer = this.viewerPanel.viewer

            if (viewer.model) {

              viewer.impl.unloadModel(
                viewer.model)

              viewer.impl.sceneUpdated(true)
            }

            let path = this.viewerPanel.getDefaultViewablePath(doc)

            let options = {}

            viewer.loadModel(path, options, (model) => {

              resolve(model)
            })
          })
        })
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Toggles OSS panel
  //
  ///////////////////////////////////////////////////////////////////
  onToggleOSS () {

    $('.oss-panel').css({
      display: this.$toggleOSS.hasClass('active') ?
        'none' : 'block'
    })

    this.$toggleOSS.toggleClass('active')

    this.viewerPanel.onResize()
  }
}
