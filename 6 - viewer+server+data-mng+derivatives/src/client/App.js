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
import ViewerPanel from 'components/Viewer/Viewer.Panel'
import ServiceManager from 'services/SvcManager'
import {client as config} from 'c0nfig'
import 'jquery-ui/themes/base/resizable.css'
import ToolPanelModal from 'ToolPanelModal'
import SocketSvc from 'services/SocketSvc'
import {DataPanel} from 'DataManagement'
import {ItemPanel} from 'DataManagement'
import 'jquery-ui/ui/widgets/resizable'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import 'jquery-ui'
import 'app.css'

export default class App {

  constructor() {

    this.derivativesPanel = new DerivativesManagerPanel()

    this.viewerPanel = new ViewerPanel()

    this.dataPanel = new DataPanel()

    this.itemPanel = new ItemPanel()

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
              item: document.getElementById('item-panel'),
              app: document.getElementById('app-panel'),
              dm: document.getElementById('dm-panel')
            }

            this.derivativesPanel.initialize(
              this.panelContainers.derivatives,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.itemPanel.initialize(
              this.panelContainers.item,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.itemPanel.on('setActiveVersion', (node) => {

              const tree = this.dataPanel.treeMap[node.hubId]

              let itemNode = tree.nodeIdToNode[node.itemId]

              if (itemNode) {

                itemNode.activeVersion = node.version

                this.dataPanel.onItemNodeAdded (itemNode)
              }
            })

            this.itemPanel.on('loadVersion', (version) => {

              return this.onLoadVersion (version, {
                showVersionNumber: true
              })
            })

            this.itemPanel.on('itemCreated', (data) => {

              const tree = this.dataPanel.treeMap[data.node.hubId]

              if (tree) {

                //need to check both, parent can be a folder or project!
                const parent =
                  (tree.nodeIdToNode[data.node.folderId] ||
                   tree.nodeIdToNode[data.node.projectId])

                if (parent) {

                  const itemNode = this.dataPanel.onCreateItemNode (
                    tree, {
                      version: data.version,
                      item: data.item,
                      insert: true,
                      parent
                    })

                  parent.children.push(itemNode)
                }
              }
            })

            this.dataPanel.initialize(
              this.panelContainers.dm,
              this.panelContainers.app,
              this.panelContainers.viewer)

            this.dataPanel.on('loadVersion', (version) => {

              return this.onLoadVersion (version)
            })

            this.dataPanel.on('loadDerivatives', (node) => {

              return this.onLoadDerivatives (node)
            })

            this.dataPanel.on('loadItemDetails', (node) => {

              return this.onLoadItemDetails (node)
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
  onLoadVersion (version, opts = {}) {

    return new Promise(async(resolve, reject) => {

      const name = version.attributes.displayName

      let urn = window.btoa(
        version.relationships.storage.data.id)

      urn = 'urn:' + urn.replace(new RegExp('=', 'g'), '')

      const doc = await this.viewerPanel.loadDocument(urn)

      const viewer = this.viewerPanel.viewer

      const path = this.viewerPanel.getDefaultViewablePath(doc)

      viewer.loadExtension(ModelTransformerExtension, {
        parentControl: 'modelTools',
        autoLoad: false
      })

      //  builds placementTransform based on model extension
      const extInstance = viewer.getExtension(
        ModelTransformerExtension)

      const loadOptions = {
        placementTransform:
        extInstance.buildPlacementTransform(name)
      }

      viewer.loadModel(path, loadOptions, (model) => {

        model.name = name

        if (opts.showVersionNumber) {

          const verNum = version.id.split('=')[1]

          model.name += ' ' + verNum
        }

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

    $('.derivatives-panel').css('display', 'block')
    $('.item-panel').css('display', 'none')

    return new Promise((resolve, reject) => {

      const urn = this.dataPanel.getVersionURN(node.activeVersion)

      $('#item-title').text('Model Derivatives: ')
      $('#item-name').text(node.name)

      this.derivativesPanel.off()

      this.derivativesPanel.on('manifest.reload', () => {

        this.dataPanel.onItemNodeAdded (node)
      })

      this.derivativesPanel.load(urn, node).then(() => {

        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onLoadItemDetails (node) {

    $('.derivatives-panel').css('display', 'none')
    $('.item-panel').css('display', 'block')

    return new Promise((resolve, reject) => {

      $('#item-title').text('Item: ')
      $('#item-name').text(node.name)

      this.itemPanel.load(node).then(() => {

        resolve()

      }, (err) => {

        reject(err)
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

    this.dataPanel.loadData()
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

      this.dataPanel.clear()

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
        title: 'About this sample ...',
        showCancel: false
      })

    aboutDlg.bodyContent (`
      <div>
        <br>
        Written by <a href="https://twitter.com/F3lipek"
          target="_blank">
          Philippe Leefsma
        </a>, November 2016
        <hr class="about"/>
        Source on
        <a href="https://github.com/Autodesk-Forge/forge-boilers.nodejs"
          target="_blank">
          Github
        </a>
      </div>
    `)

    aboutDlg.setVisible(true)
  }
}


