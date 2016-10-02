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
import {clientConfig as config} from 'c0nfig'

import './extensions/Viewing.Extension.Transform.js'

export default class ViewerPanel {

  constructor (tokenUrl) {

    this._tokenURL = tokenUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setTokenUrl(url) {

    this._tokenURL = url
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initializeViewingEnv () {

    var options = {

      env: 'AutodeskProduction',

      getAccessToken: (callback) => {

        $.get(this._tokenURL, (tokenResponse) => {

          callback(
            tokenResponse.access_token,
            tokenResponse.expires_in)
        })
      }
    }

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Initializer(options, () => {

        resolve()

      }, (error) => {

        reject(error)
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadDocument (documentId) {

    $('.progressbg').show()

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Document.load(documentId,
        (doc) => {

          resolve (doc)
        },
        (errCode) => {
          reject (errCode)
        })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDefaultViewablePath (doc) {

    var rootItem = doc.getRootItem()

    // Grab all 3D items
    var geometryItems3d =
      Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, { 'type': 'geometry', 'role': '3d' }, true)

    // Grab all 2D items
    var geometryItems2d =
      Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, { 'type': 'geometry', 'role': '2d' }, true)

    // Pick the first 3D item otherwise first 2D item
    var selectedItem = (geometryItems3d.length ?
      geometryItems3d[0] :
      geometryItems2d[0])

    return doc.getViewablePath(selectedItem)
  }

  ///////////////////////////////////////////////////////////////////
  // Initialize Viewer
  //
  ///////////////////////////////////////////////////////////////////
  async initialize (domContainer) {

    await this.initializeViewingEnv()

    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
      domContainer)

    this.viewer.initialize()
    
    $('#loader, .spinner').remove()

    $('.progressbg').hide()

    this.viewer.setBackgroundColor(
      255, 207, 13,
      219, 219, 219)
    
    // Load and unload extension events
       
    var loadBtn = document.getElementById('loadBtn');
 
    loadBtn.addEventListener("click", () => {
      //alert("hi");
      //loadExtension(this.viewer);
      this.viewer.loadExtension('Viewing.Extension.Transform', {})
    });
 
    var unloadBtn = document.getElementById('unloadBtn');
 
    unloadBtn.addEventListener("click", () => {
      //alert("bye");
      //unloadExtension(this.viewer);
      this.viewer.unloadExtension('Viewing.Extension.Transform')
    });
  }

  ///////////////////////////////////////////////////////////////////
  // On Resize Panel
  //
  ///////////////////////////////////////////////////////////////////
  onResize () {

    if (this.viewer) {

      this.viewer.resize()
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  destroy () {

    if (this.viewer) {

      this.viewer.finish()

      $(this.viewer.container).remove()
    }
  }
}
