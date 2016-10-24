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
//////////////////////////////////////////////////////////////////////////
import 'app.css'

var urn = 'urn:<your doc URN>'

/////////////////////////////////////////////////////////////////
// Initialization Options
//
/////////////////////////////////////////////////////////////////
var initOptions = {

  documentId: urn,

  env: 'AutodeskProduction',

  getAccessToken: function(onGetAccessToken) {

    $.get('/api/forge/token/2legged', function(tokenResponse) {

      onGetAccessToken(
        tokenResponse.access_token,
        tokenResponse.expires_in)
    })
  }
}

/////////////////////////////////////////////////////////////////
// Document Loaded Handler
//
/////////////////////////////////////////////////////////////////
function onDocumentLoaded (doc) {

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

  var domContainer = document.getElementById('viewer')

  // UI-less Version: viewer without controls and commands
  //viewer = new Autodesk.Viewing.Viewer3D(domContainer)

  // GUI Version: viewer with controls
  var viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer)

  viewer.initialize()

  viewer.loadModel(doc.getViewablePath(selectedItem))
}

/////////////////////////////////////////////////////////////////
// Environment Initialized Handler
//
/////////////////////////////////////////////////////////////////
function onEnvInitialized () {

  Autodesk.Viewing.Document.load(
    initOptions.documentId,
    function(doc) {
      onDocumentLoaded (doc)
    },
    function (errCode){
      onLoadError (errCode)
    })
}

/////////////////////////////////////////////////////////////////
// Error Handler
//
/////////////////////////////////////////////////////////////////
function onLoadError (errCode) {

  console.log('Error loading document: ' + errCode)
}

//////////////////////////////////////////////////////////////////////////
// Application Bootstrapping
//
//////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

  Autodesk.Viewing.Initializer(
    initOptions,
    function() {
      onEnvInitialized ()
    })
})