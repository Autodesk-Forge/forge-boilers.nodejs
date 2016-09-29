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
import DMPanel from 'Components/DataManagement/DataManagementPanel'
import ViewerPanel from 'Components/Viewer/ViewerPanel'
import ServiceManager from 'Services/SvcManager'
import {clientConfig as config} from 'c0nfig'
import 'jquery-ui/themes/base/resizable.css'
import SocketSvc from 'Services/SocketSvc'
import 'jquery-ui/ui/widgets/resizable'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import 'splitter.css'
import 'jquery-ui'
import 'app.css'

export default class App {

  constructor() {

    this.viewerPanel = new ViewerPanel(
      config.forge.token3LeggedUrl)

    this.dmPanel = new DMPanel()

    this.$toggleDM = $('#dm-toggle')

    this.$toggleDM.click((e) => {

      this.onToggleDM(e)
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

    $(".panel-left").resizable({
      handles: 'e, w',
      resize : (event, ui) => {

        this.viewerPanel.onResize()
      },
      create: (event, ui) => {

        $(".ui-resizable-e").css("cursor","col-resize")

        var panelContainer =
         document.getElementById('dm')

        var appContainer =
          document.getElementById('appContainer')

        var viewerContainer =
          document.getElementById('viewer')

        this.dmPanel.initialize(
          panelContainer,
          appContainer,
          viewerContainer)

        this.dmPanel.on('loadItem', (item) => {

          return new Promise(async(resolve, reject) => {

            var version = item.versions[ item.versions.length - 1 ]

            let urn = window.btoa(
              version.relationships.storage.data.id)

            urn = 'urn:' + urn.replace(new RegExp('=', 'g'), '')

            this.viewerPanel.setTokenUrl(
              config.forge.token3LeggedUrl)

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

        let socketSvc = new SocketSvc({
          host: config.host,
          port: config.port
        })

        socketSvc.connect().then(()=>{

          ServiceManager.registerService(socketSvc)

          socketSvc.on('connection.data', (data)=> {

            this.register(data.socketId)
          })

          socketSvc.emit('request.connection.data')

          socketSvc.on('callback', (msg)=> {

            if(this.popup) {

              this.loggedIn = true
              this.popup.close()
              this.popup = null
            }

            if(msg === 'success') {

              $.get('/api/dm/user', (user) => {

                this.onUserLoggedIn(user)
              })
            }
          })
        })

        $.get('/api/dm/user', (user) => {

          this.onUserLoggedIn(user)
        })
      }
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

    $('.dm-panel').css({
      display: 'block'
    })

    var viewerContainer =
      document.getElementById('viewer')

    this.viewerPanel.initialize(
      viewerContainer)

    this.viewerPanel.onResize()

    this.dmPanel.loadData()
  }

  ///////////////////////////////////////////////////////////////////
  // Toggles Data management panel
  //
  ///////////////////////////////////////////////////////////////////
  onToggleDM () {

    if(this.user) {

      $('#dm-user').text('User Data')
      $('#dm-toggle').removeClass('active')

      $('.dm-panel').css({
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
}
