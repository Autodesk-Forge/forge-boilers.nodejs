/////////////////////////////////////////////////////////////////////
// DerivativePropertyPanel
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase/ToolPanelBase'

export default class ViewerPropertyPanel extends
  Autodesk.Viewing.Extensions.ViewerPropertyPanel {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, extension) {

    super(viewer)

    this.viewer = viewer

    this.extension = extension

    $(this.container).addClass('derivative')
  }

  /////////////////////////////////////////////////////////////
  // initialize override
  //
  /////////////////////////////////////////////////////////////
  initialize() {

    super.initialize()

    this.container.classList.add('derivative')
  }

  /////////////////////////////////////////////////////////////
  // createTitleBar override
  //
  /////////////////////////////////////////////////////////////
  createTitleBar (title) {

    var titleBar = document.createElement("div")

    titleBar.className = "dockingPanelTitle"

    this.titleTextId = ToolPanelBase.guid()

    this.titleImgId = ToolPanelBase.guid()

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

  /////////////////////////////////////////////////////////////////
  // setNodeProperties override
  //
  /////////////////////////////////////////////////////////////////
  setNodeProperties (nodeId) {

    super.setNodeProperties(nodeId)

    this.nodeId = nodeId
  }

  /////////////////////////////////////////////////////////////////
  // Adds new meta property to panel
  //
  /////////////////////////////////////////////////////////////////
  addMetaProperty (metaProperty, options) {

    var element = this.tree.getElementForNode({
      name: metaProperty.name,
      value: metaProperty.value,
      category: metaProperty.category
    })

    if (element) {

      return false
    }

    var parent = null

    if (metaProperty.category) {

      parent = this.tree.getElementForNode({
        name: metaProperty.category
      })

      if (!parent) {
        parent = this.tree.createElement_({
            name: metaProperty.category,
            type: 'category'
          },
          this.tree.myRootContainer,
          options && options.localizeCategory ? {localize: true} : null)
      }
    }
    else {

      parent = this.tree.myRootContainer
    }

    this.tree.createElement_(
      metaProperty,
      parent,
      options && options.localizeProperty ? {localize: true} : null)

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getDisplayName (nodeId) {

    return new Promise((resolve, reject) => {

      this.currentModel.getProperties(nodeId, (result) => {

        return resolve(result.name)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // setProperties override
  //
  /////////////////////////////////////////////////////////////////
  async setProperties (properties) {

    super.setProperties(properties)

    // for testing
    var nodeIdProperty = {

      name: 'ObjectId',
      value: this.nodeId,
      category: 'Node Info',
      dataType: 'text'
    }

    this.addMetaProperty(nodeIdProperty)

    if(this.currentModel && this.currentModel.guid) {

      var name = await this.getDisplayName(this.nodeId)

      //get rid of some special chars

      name = name.split(':')[ 0 ]
      name = name.split('.')[ 0 ]
      name = name.split('[')[ 0 ]

      var modelName = this.currentModel.name.split(".")[0]
      var fileType = this.currentModel.name.split(".").pop(-1)

      var manifestProperty = {

        name: 'Manifest',
        value: `Show`,

        href: '/api/derivatives/manifest/' +
              `${this.currentModel.storageUrn}`,

        category: 'Model Derivatives - JSON',
        dataType: 'link'
      }

      this.addMetaProperty(manifestProperty)

      var hierarchyProperty = {

        name: 'Hierarchy',
        value: `Show`,

        href: '/api/derivatives/hierarchy/' +
              `${this.currentModel.storageUrn}/` +
              `${this.currentModel.guid}`,

        category: 'Model Derivatives - JSON',
        dataType: 'link'
      }

      this.addMetaProperty(hierarchyProperty)

      var propsProperty = {

        name: 'Properties',
        value: `Show`,

        href: '/api/derivatives/properties/' +
              `${this.currentModel.storageUrn}/` +
              `${this.currentModel.guid}`,

        category: 'Model Derivatives - JSON',
        dataType: 'link'
      }

      this.addMetaProperty(propsProperty)

      if(this.extension.Formats.iges.indexOf(fileType) > -1) {

        var stepDerivativeProperty = {

          name: 'IGES',
          nameId: guid(),
          value: `Download ${modelName}.iges`,
          category: 'Model Derivatives',
          dataType: 'derivative',
          filename: `${modelName}.iges`,

          urn: this.currentModel.storageUrn,
          outputType: 'iges'
        }

        this.addDerivativeProperty(stepDerivativeProperty)
      }

      if(this.extension.Formats.step.indexOf(fileType) > -1) {

        var stepDerivativeProperty = {

          name: 'STEP',
          nameId: guid(),
          value: `Download ${modelName}.step`,
          category: 'Model Derivatives',
          dataType: 'derivative',
          filename: `${modelName}.step`,

          urn: this.currentModel.storageUrn,
          outputType: 'step'
        }

        this.addDerivativeProperty(stepDerivativeProperty)
      }

      if(this.extension.Formats.stl.indexOf(fileType) > -1) {

        var stepDerivativeProperty = {

          name: 'STL',
          nameId: guid(),
          value: `Download ${modelName}.stl`,
          category: 'Model Derivatives',
          dataType: 'derivative',
          filename: `${modelName}.stl`,

          urn: this.currentModel.storageUrn,
          outputType: 'stl'
        }

        this.addDerivativeProperty(stepDerivativeProperty)
      }

      if(this.extension.Formats.obj.indexOf(fileType) > -1) {

        var objDerivativeProperty = {

          name: 'OBJ',
          nameId: guid(),
          value: `Download ${modelName}.obj`,
          category: 'Model Derivatives',
          dataType: 'derivative',
          filename: `${modelName}.obj`,

          urn: this.currentModel.storageUrn,
          guid: this.currentModel.guid,
          //pass -1 for whole model
          objectIds: [ -1 ],
          outputType: 'obj'
        }

        this.addDerivativeProperty(objDerivativeProperty)
      }

      var objCompDerivativeProperty = {

        name: 'OBJ',
        nameId: guid(),
        value: `Download ${name}.obj`,
        category: 'Component Derivatives',
        dataType: 'derivative',
        filename: `${name}.obj`,

        urn: this.currentModel.storageUrn,
        guid: this.currentModel.guid,
        objectIds: [ this.nodeId ],
        outputType: 'obj'
      }

      this.addDerivativeProperty(objCompDerivativeProperty)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addDerivativeProperty (derivativeProperty) {

    this.addMetaProperty(derivativeProperty)

    this.extension.api.getDerivativeURN(
      derivativeProperty,
      this.onDerivativeProgress(
        derivativeProperty)).then((result) => {

        // will check that result when property clicked
        // to see if we need to trigger the job
        // or if the derivative is pending or available

        derivativeProperty.status =
          result.status

        derivativeProperty.derivativeUrn =
          result.derivativeUrn
      })
  }

  /////////////////////////////////////////////////////////////////
  // displayProperty override
  //
  /////////////////////////////////////////////////////////////////
  displayProperty (property, parent, options) {

    var name = document.createElement('div')

    if(property.nameId) {

      name.id = property.nameId
    }

    var text = property.name

    if (options && options.localize) {
      name.setAttribute('data-i18n', text)
      text = Autodesk.Viewing.i18n.translate(text)
    }

    name.textContent = text
    name.title = text
    name.className = 'propertyName'

    var separator = document.createElement('div')
    separator.className = 'separator'

    parent.appendChild(name)
    parent.appendChild(separator)

    var value = null

    //native properties dont have a dataType
    //display them just as text
    if(!property.dataType) {
      value = createTextProperty(property, parent)
      return [name, value]
    }

    switch (property.dataType) {

      case 'text':
        value = createTextProperty(property, parent)
        break

      case 'link':
        value = createLinkProperty(property, parent)
        break

      case 'img':
        value = createImageProperty(property, parent)
        break

      case 'file':
      case 'derivative':
        value = createFileProperty(property, parent)
        break

      default :
        break
    }

    // Make the property highlightable
    return [name, value]
  }

  /////////////////////////////////////////////////////////////////
  // onPropertyClick handle
  //
  /////////////////////////////////////////////////////////////////
  async onPropertyClick (property, event) {

    if(!property.dataType)
      return

    switch(property.dataType){

      case 'text':
        //nothing to do for text
        break

      // opens link in new tab
      case 'link':
        window.open(property.href, '_blank')
        break

      // download image or file
      case 'img':
      case 'file':
        this.extension.api.downloadURI(property.href, property.filename)
        break

      case 'derivative':

        // if derivative not found -> trigger the job

        if(property.status === 'not found') {

          var job = await this.extension.api.postJob(property)

          console.log(job)
        }

        // wait till derivative urn is available

        var result = await this.extension.api.getDerivativeURN(
          property,
          this.onDerivativeProgress(property), true)

        if(result.status === 'success'){

          var url = this.extension.api.getDownloadURI(
            this.currentModel.storageUrn,
            result.derivativeUrn,
            property.filename)

          this.extension.api.downloadURI(url, property.filename)
        }

        break

      default :
        break
    }
  }

  /////////////////////////////////////////////////////////////////
  // onDerivativeProgress
  //
  /////////////////////////////////////////////////////////////////
  onDerivativeProgress (property) {

    return (progress) => {

      property.progress = progress

      $('#' + property.nameId).text(
        property.name + ': ' + progress)
    }
  }
}

/////////////////////////////////////////////////////////////////
// Creates a text property
//
/////////////////////////////////////////////////////////////////
function createTextProperty(property, parent){

  var value = document.createElement('div')
  value.textContent = property.value
  value.title = property.value
  value.className = 'propertyValue'

  parent.appendChild(value)

  return value
}

/////////////////////////////////////////////////////////////////
// Creates a link property
//
/////////////////////////////////////////////////////////////////
function createLinkProperty(property, parent){

  var id = guid()

  var html = `
    <div id="${id}" class="propertyValue derivative">
      <a  href="${property.href}" target="_blank">
        ${property.value}
      </a>
    </div>
    `

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// Creates an image property
//
/////////////////////////////////////////////////////////////////
function createImageProperty(property, parent){

  var id = guid()

  var html = [

    '<div id="' + id + '" class="propertyValue derivative">' +
    '<a href="' + property.href +'">',
    '<img src="' + property.href +'" width="128" height="128"> </img>' +
    '</a>',
    '</div>'

  ].join('\n')

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// Creates a file property
//
/////////////////////////////////////////////////////////////////
function createFileProperty(property, parent){

  var id = guid()

  var html = [

    '<div id="' + id + '" class="propertyValue derivative">' +
    '<a href="' + property.href +'">',
    property.value,
    '</a>',
    '</div>'

  ].join('\n')

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// guid util
//
/////////////////////////////////////////////////////////////////
function guid(format = 'xxxxxxxxxx') {

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