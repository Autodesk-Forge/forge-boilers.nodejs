/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import JSONView from 'jquery-jsonview/dist/jquery.jsonview'
import 'jquery-jsonview/dist/jquery.jsonview.css'
import {HierarchyTreeDelegate} from './Hierarchy'
import {ExportsTreeDelegate} from './Exports'
import 'jsoneditor/dist/jsoneditor.min.css'
import EventsEmitter from 'EventsEmitter'
import {Formats, Payloads} from './data'
import UIComponent from 'UIComponent'
import TabManager from 'TabManager'
import DerivativesAPI from '../API'
import JSONEditor from 'jsoneditor'
import Dropdown from 'Dropdown'
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

    this.apiUrl = apiUrl
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initialize (container, appContainer, viewerContainer) {

    $(container).append(this.domElement)

    this.viewerContainer = viewerContainer

    this.appContainer = appContainer

    this.TabManager = new TabManager(
      this.domElement)

    // API missing formats for dwf
    // using hardcoded version for now
    //this.derivativesAPI.getFormats().then((res) => {
    //
    //  this.formats = formats
    //})

    this.formats = Formats

    this.createManifestTab()

    this.createHierarchyTab()

    this.createExportsTab()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async load (urn, node) {

    this.designName = node.name

    this.properties = null

    this.nodeId = node.id

    this.hierarchy = null

    this.modelGuid = null

    this.manifest = null

    this.urn = urn

    try {

      this.manifest =
        await this.derivativesAPI.getManifest(
          this.urn)

      this.loadManifest(
        this.manifest)

      const metadataResponse =
        await this.derivativesAPI.getMetadata(
          this.urn)

      const metadata = metadataResponse.data.metadata

      if (metadata && metadata.length) {

        this.modelGuid = metadata[0].guid

        this.loadExports(
          this.urn,
          this.designName,
          this.manifest,
          this.modelGuid)

        const hierarchy =
          await this.derivativesAPI.getHierarchy(
            this.urn,
            this.modelGuid)

        const properties =
          await this.derivativesAPI.getProperties(
            this.urn,
            this.modelGuid)

        this.properties = properties.data ?
          properties.data.collection : []

        this.hierarchy = hierarchy.data

        this.loadHierarchy(
          urn,
          this.hierarchy,
          this.properties)

      } else {

        this.loadExports(
          this.urn,
          this.designName,
          this.manifest,
          this.modelGuid)
      }

    } catch (ex) {

      this.loadManifest(
        this.manifest)

      this.loadExports(
        this.urn,
        this.designName,
        this.manifest,
        this.modelGuid)

      this.loadHierarchy(
        urn,
        this.hierarchy,
        this.properties)
    }
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

      this.derivativesAPI.deleteManifest(this.urn).then(() => {

        this.emit('manifest.reload')
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadManifest (manifest) {

    if (manifest) {

      $(`.json-view`).JSONView(manifest, {
        collapsed: false
      })

      $('.manifest .controls').css({
        display: 'block'
      })

    } else {

      $(`.json-view`).JSONView({
        message: 'No manifest on this item'
      })

      $('.manifest .controls').css({
        display: 'none'
      })
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createHierarchyTab () {

    const btnShowHierarchyInTabId = this.guid()

    const btnShowPropsInTabId = this.guid()

    this.TabManager.addTab({
      name: 'Hierarchy',
      html: `
        <div class="derivatives-tab-container hierarchy">
          <div class="hierarchy-tree">
          </div>
          <div class="controls">
            <button id="${btnShowHierarchyInTabId}" class="btn">
              <span class="glyphicon glyphicon-share-alt">
              </span>
              Show hierarchy ...
            </button>
            <br>
            <button id="${btnShowPropsInTabId}" class="btn">
              <span class="glyphicon glyphicon-share-alt">
              </span>
              Show properties ...
            </button>
          </div>
        </div>`
    })

    $('#' + btnShowHierarchyInTabId).click(() => {

      const uri = `${this.apiUrl}/hierarchy/` +
        `${this.urn}/${this.modelGuid}`

      this.showPayload(uri)
    })

    $('#' + btnShowPropsInTabId).click(() => {

      const uri = `${this.apiUrl}/properties/` +
        `${this.urn}/${this.modelGuid}`

      this.showPayload(uri)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadHierarchy (urn, hierarchy, properties) {

    if (urn !== this.urn) {
      // prevents async loading
      return
    }

    $('.hierarchy-tree').empty()

    $('.hierarchy .controls').css({
      display: 'none'
    })

    if (hierarchy && properties) {

      const delegate =
        new HierarchyTreeDelegate(
          hierarchy,
          properties)

      delegate.on('node.dblClick', (node) => {

        const propertyPanel =
          new DerivativesPropertyPanel(
            this.appContainer,
            node.name + ' Properties',
            node.properties)

        propertyPanel.setVisible(true)
      })

      const rootNode = {
        name: 'Model Hierarchy',
        type: 'hierarchy.root',
        id: this.guid(),
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
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  createExportsTab () {

    const btnPostJobId = this.guid()

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
           <button id="${btnPostJobId}" class="btn btn-post-job">
              <span class="glyphicon glyphicon-cloud-upload">
              </span>
              Post job ...
            </button>
       </div>`
    })

    this.formatsDropdown = new Dropdown({
      container: '.exports-formats',
      title: 'Export format',
      prompt: 'Select an export format ...',
      pos: {
        top: 0, left: 0
      },
      menuItems: []
    })

    this.formatsDropdown.on('item.selected', (item) => {

      let payload = Object.assign({},
        Payloads[item.name], {
          input: {
            urn: this.urn
          }
        })

      if(item.name === 'obj' && this.modelGuid) {

        payload.output.formats[0].advanced.modelGuid =
          this.modelGuid
      }

      this.editor.set(payload)

      this.editor.expandAll()
    })

    this.editor = new JSONEditor($('.exports-payload')[0], {
      search: false
    })

    $('#' + btnPostJobId).click(async() => {

      const job = this.editor.get()

      await this.derivativesAPI.postJobWithProgress(
        job, {
          panelContainer: this.viewerContainer,
          designName: this.designName
        })

      this.manifest =
        await this.derivativesAPI.getManifest(
          this.urn)

      this.loadManifest (this.manifest)

      this.loadExports(
        this.urn,
        this.designName,
        this.manifest,
        this.modelGuid,
        false)
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadExports (urn, designName, manifest, modelGuid, clearAll = true) {

    $('.exports-tree').empty()

    $('.exports').css({
      display: 'block'
    })

    const fileType = window.atob(urn).split(".").pop(-1)

    let supportedFormats = []

    for(var format in this.formats) {

      if (this.formats[format].indexOf(fileType) > -1) {

        supportedFormats.push(format)
      }
    }

    const delegate = new ExportsTreeDelegate(
      urn,
      designName,
      manifest,
      modelGuid,
      supportedFormats,
      this.derivativesAPI)

    delegate.on('postJob', (node) => {

      return new Promise(async(resolve) => {

        try {

          const derivative =
            await this.derivativesAPI.postJobWithProgress(
              node.job, {
              panelContainer: this.viewerContainer,
              designName: designName
            }, node.query)

          resolve(derivative)

        } finally {

          this.manifest =
            await this.derivativesAPI.getManifest(urn)

          this.loadManifest (this.manifest)

          this.loadExports(
            urn,
            designName,
            this.manifest,
            modelGuid,
            false)
        }
      })
    })

    delegate.on('manifest.reload', () => {

      this.emit('manifest.reload')
    })

    const domContainer = $('.exports-tree')[0]

    const rootNode = {
      name: 'Available Exports',
      type: 'formats.root',
      nodeId: this.nodeId,
      id: this.guid(),
      group: true
    }

    new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, domContainer, {
        excludeRoot: false
      })

    if (clearAll) {

      this.formatsDropdown.setItems(

        supportedFormats.map((format) => {
          return {
            name: format
          }
        }), -1
      )

      const payload = {
        input: {
          urn: this.urn
        },
        output: {}
      }

      this.editor.set(payload)
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class DerivativesPropertyPanel extends Autodesk.Viewing.UI.PropertyPanel {

  constructor (container, title, properties) {

    super (container, UIComponent.guid(), title)

    this.setProperties(properties)
  }

  /////////////////////////////////////////////////////////////
  // initialize override
  //
  /////////////////////////////////////////////////////////////
  initialize() {

    super.initialize()

    this.container.classList.add('derivatives')
  }

  /////////////////////////////////////////////////////////////
  // createTitleBar override
  //
  /////////////////////////////////////////////////////////////
  createTitleBar (title) {

    var titleBar = document.createElement("div")

    titleBar.className = "dockingPanelTitle"

    this.titleTextId = this.guid()

    this.titleImgId = this.guid()

    var html = `
      <img id="${this.titleImgId}"></img>
      <div id="${this.titleTextId}" class="dockingPanelTitleText">
        ${title}
      </div>
    `

    $(titleBar).append(html)

    this.addEventListener(titleBar, 'click', (event)=> {

      if (!this.movedSinceLastClick) {

        this.onTitleClick(event)
      }

      this.movedSinceLastClick = false
    })

    this.addEventListener(titleBar, 'dblclick', (event) => {

      this.onTitleDoubleClick(event)
    })

    return titleBar
  }

  /////////////////////////////////////////////////////////////
  // setTitle override
  //
  /////////////////////////////////////////////////////////////
  setTitle (text, options) {

    if (options && options.localizeTitle) {

      $(`#${this.titleTextId}`).attr('data-i18n', text)

      text = Autodesk.Viewing.i18n.translate(text)

    } else {

      $(`#${this.titleTextId}`).removeAttr('data-i18n')
    }

    $(`#${this.titleTextId}`).text(text)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  guid(format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }
}