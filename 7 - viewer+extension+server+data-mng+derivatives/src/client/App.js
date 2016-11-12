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
import DMPanel from 'Components/DataManagement/DataManagement.Panel'
import {ManagerPanel as DerivativesManagerPanel} from 'Derivatives'
import ViewerPanel from 'Components/Viewer/Viewer.Panel'
import ServiceManager from 'Services/SvcManager'
import {clientConfig as config} from 'c0nfig'
import 'jquery-ui/themes/base/resizable.css'
import ToolPanelModal from 'ToolPanelModal'
import SocketSvc from 'Services/SocketSvc'
import 'jquery-ui/ui/widgets/resizable'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import 'jquery-ui'
import 'app.css'

export default class App {

  constructor() {

    this.derivativesPanel = new DerivativesManagerPanel()

    this.viewerPanel = new ViewerPanel(
      config.forge.token3LeggedUrl)

    this.dmPanel = new DMPanel()

    this.$toggleDM = $('#dm-toggle')

    this.$toggleDM.click((e) => {

      this.onToggleDM(e)
    })

    $('#about').click((e) => {

      this.onAbout(e)
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // register app with socket service
  //
  //////////////////////////////////////////////////////////////////////////
  register (socketId) {

    return new Promise((resolve, reject) => {

      $.ajax({
        url: '/api/app/register',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          socketId: socketId
        }),
        success: (response) => {

          return resolve(response)
        },
        error: (err) => {

          console.log(err)
          return reject(err)
        }
      })
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // perform login
  //
  //////////////////////////////////////////////////////////////////////////
  login() {

    return new Promise((resolve, reject) => {

      $.ajax({
        url: '/api/forge/login',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: null,
        success: (url) => {

          // iframes are not allowed

          this.popup = this.PopupCenter(
            url, "Autodesk Login", 800, 400)

          if (this.popup) {

            this.popup.focus()
          }

          resolve()
        },
        error: (err) => {

          console.log(err)

          reject(err)
        }
      })
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // perform logout
  //
  //////////////////////////////////////////////////////////////////////////
  logout() {

    return new Promise((resolve, reject) => {

      $.ajax({
        url: '/api/forge/logout',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: null,
        success: (res) => {

          resolve()
        },
        error: (err) => {

         console.log(err)

         reject(err)
        }
      })
    })
  }

  //////////////////////////////////////////////////////////////////////////
  // http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
  //
  //////////////////////////////////////////////////////////////////////////
  PopupCenter(url, title, w, h) {

    // Fixes dual-screen position

    var dualScreenLeft = (window.screenLeft !== undefined ?
      window.screenLeft : screen.left)

    var dualScreenTop = (window.screenTop !== undefined ?
      window.screenTop : screen.top)

    var element = document.documentElement

    var width = window.innerWidth ? window.innerWidth :
      (element.clientWidth ? element.clientWidth : screen.width)

    var height = window.innerHeight ? window.innerHeight :
      (element.clientHeight ? element.clientHeight : screen.height)

    var left = ((width / 2) - (w / 2)) + dualScreenLeft
    var top = ((height / 2) - (h / 2)) + dualScreenTop

    return window.open(url, title,
      'scrollbars=no,' +
      'toolbar=no,' +
      'location=no,' +
      'titlebar=no,' +
      'directories=no,' +
      'status=no,' +
      'menubar=no,' +
      'width=' + w + ',' +
      'height=' + h + ',' +
      'top=' + top + ',' +
      'left=' + left)
  }

  ///////////////////////////////////////////////////////////////////
  // Initialize client App
  //
  ///////////////////////////////////////////////////////////////////
  initialize () {

    $(".left-panel").resizable({
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
              dm: document.getElementById('dm-panel')
            }

            this.derivativesPanel.initialize(
              this.panelContainers.derivatives,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.dmPanel.initialize(
              this.panelContainers.dm,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.dmPanel.on('loadItem', (item) => {

              return this.onLoadItem (item)
            })

            this.dmPanel.on('loadDerivatives', (node) => {

              return this.onLoadDerivatives (node)
            })

            let socketSvc = new SocketSvc({
              host: config.host,
              port: config.port
            })

            socketSvc.connect().then(()=> {

              ServiceManager.registerService(socketSvc)

              socketSvc.on('connection.data', (data)=> {

                this.register(data.socketId)
              })

              socketSvc.on('callback', (msg)=> {

                if (this.popup) {

                  this.loggedIn = true
                  this.popup.close()
                  this.popup = null
                }

                if (msg === 'success') {

                  $.get('/api/dm/user', (user) => {

                    this.onUserLoggedIn(user)
                  })
                }
              })

              socketSvc.emit('request.connection.data')
            })

            $.get('/api/dm/user', (user) => {

              this.onUserLoggedIn(user)
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
  onLoadItem (item) {

    return new Promise(async(resolve, reject) => {

      var version = item.versions[ item.versions.length - 1 ]

      let urn = window.btoa(
        version.relationships.storage.data.id)

      urn = 'urn:' + urn.replace(new RegExp('=', 'g'), '')

      this.viewerPanel.setTokenUrl(
        config.forge.token3LeggedUrl)

      const doc = await this.viewerPanel.loadDocument(urn)

      const viewer = this.viewerPanel.viewer

      const path = this.viewerPanel.getDefaultViewablePath(doc)

      viewer.loadExtension(ModelTransformerExtension, {
        parentControl: 'modelTools',
        autoLoad: true
      })

      //  builds placementTransform based on model extension
      const extInstance = viewer.getExtension(
        ModelTransformerExtension)

      const placementTransform = extInstance.buildPlacementTransform(
        item.name)

      const loadOptions = {
        placementTransform
      }

      viewer.loadModel(path, loadOptions, (model) => {

        model.name = item.name

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

      const urn = this.dmPanel.getLastVersionURN(node)

      $('#model-name').text(node.name)

      this.derivativesPanel.off()

      this.derivativesPanel.on('manifest.delete', () => {

        node.parent.classList.remove('derivated')
      })

      this.derivativesPanel.load(urn, node.name).then(() => {

        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  // User logged in handler
  //
  ///////////////////////////////////////////////////////////////////
  onUserLoggedIn (user) {

    this.user = user

    var username = user.firstName + ' ' + user.lastName

    console.log('Logged-in user: ' + username)

    $('#dm-user').text(' ' + username)
    $('#dm-toggle').addClass('active')

    $('.data-panel').css({
      display: 'flex'
    })

    this.viewerPanel.initialize(
      this.panelContainers.viewer)

    this.viewerPanel.onResize()

    this.dmPanel.loadData()
  }

  ///////////////////////////////////////////////////////////////////
  // Toggles Data management panel
  //
  ///////////////////////////////////////////////////////////////////
  onToggleDM () {

    if (this.user) {

      $('#dm-user').text('User Data')
      $('#dm-toggle').removeClass('active')

      $('.data-panel').css({
        display: 'none'
      })

      this.dmPanel.clear()

      this.viewerPanel.onResize()

      this.logout().then(() => {

        this.user = null
      })

    } else {

      this.login()
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onAbout () {

    const aboutDlg = new ToolPanelModal(
      this.panelContainers.app, {
        title: 'About Roomedit3dv3...',
        showCancel: false,
        showOK: false,
      })

    aboutDlg.bodyContent (`
      <div>
        <br/><a href="https://twitter.com/F3lipek"
          target="_blank">Philippe Leefsma</a>
        &amp; <a href="http://thebuildingcoder.typepad.com"
          target="_blank">Jeremy Tammik</a>, November 2016.
        <br/><br/>Source on
        <a href="https://github.com/Autodesk-Forge/forge-boilers.nodejs/tree/roomedit3d"
          target="_blank">Github</a>.
      </div>
    `)

    aboutDlg.setVisible(true)
  }
}
