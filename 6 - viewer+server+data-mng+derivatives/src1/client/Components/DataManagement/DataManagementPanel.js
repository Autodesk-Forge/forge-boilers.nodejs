/////////////////////////////////////////////////////////////////////
// DataManagement Panel
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import DerivativesAPI from '../Derivatives/Derivatives.API'
import ContextMenu from './DataManagement.ContextMenu'
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import TabManager from 'TabManager/TabManager'
import EventsEmitter from 'EventsEmitter'
import DMAPI from './DataManagement.API'
import Dropzone from 'dropzone'
import './DataManagement.css'

export default class DataManagementPanel extends EventsEmitter {

  constructor () {

    super()

    this.onItemNodeAddedHandler = (node) => {

      this.onItemNodeAdded (node)
    }

    this.onNodeDblClickHandler = (node) => {

      this.onNodeDblClick (node)
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async initialize (domContainer, appContainer, viewerContainer) {

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: '/api/derivatives'
    })

    this.dmAPI = new DMAPI({
      apiUrl: '/api/dm'
    })

    $(this.container).addClass('storage')

    this.TabManager = new TabManager(
      domContainer)

    this.contextMenu = new ContextMenu({
      container: domContainer
    })

    this.contextMenu.on('context.details', (data) => {

      if(data.node.details) {

        console.log(data.node.details)
      }
    })

    this.contextMenu.on('context.versions', (data) => {

      if(data.node.versions) {

        console.log({
          versions: data.node.versions
        })
      }
    })

    this.contextMenu.on('context.manifest.show', (data) => {

      let urn = this.getLastVersionURN(data.node)

      var uri = `api/derivatives/manifest/${urn}`
      var link = document.createElement("a")
      link.target = '_blank'
      link.href = uri
      link.click()
    })

    this.contextMenu.on('context.manifest.delete', (data) => {

      let urn = this.getLastVersionURN(data.node)

      data.node.showLoader(true)

      this.derivativesAPI.deleteManifest(urn).then(() => {

        data.node.manifest = null

        data.node.parent.classList.remove('derivated')

        data.node.showLoader(false)

      }, (err) => {

        data.node.showLoader(false)
      })
    })

    this.contextMenu.on('context.viewable', async(data) => {

      try {

        data.node.showLoader(true)

        let urn = this.getLastVersionURN(data.node)

        console.log('Posting SVF Job: ' + urn)

        let response = await this.derivativesAPI.postSVFJob(
          urn,
          data.node.name,
          viewerContainer)

        setTimeout(() => {
          this.onItemNodeAddedHandler (data.node)
        }, 500)

      } catch (ex) {

        console.log('SVf Job failed')
        console.log(ex)

        data.node.showLoader(false)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  clear () {

    this.TabManager.clear()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getLastVersionURN (node) {

    var version = node.versions[ node.versions.length - 1 ]

    var urn = window.btoa(
      version.relationships.storage.data.id)

    return urn.replace(new RegExp('=', 'g'), '')
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onCreateItemNode (tree, data) {

      let { parent, item, version } = data

      let node = tree.nodeIdToNode[item.id]

      if (!node) {

        node = new TreeNode({
          name: item.attributes.displayName,
          projectId: parent.projectId,
          hubId: parent.hubId,
          folderId: item.id,
          type: item.type,
          details: item,
          tooltip: true,
          id: item.id,
          group: true
        })

        this.dmAPI.getVersions(
          node.projectId, node.id).then((versions) => {

            node.versions = versions.data

            parent.addChild(node)

            node.showLoader(true)

            this.onItemNodeAdded(node)
          })

      } else {

        if(node.versions) {

          node.versions.push(version)
        }
      }

      return node
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onItemNodeAdded (node) {

    var version = node.versions[ node.versions.length - 1 ]

    if (!version.relationships.storage) {

      node.setTooltip('derivatives unavailable on this item')

      node.parent.classList.add('unavailable')

      node.showLoader(false)

      return
    }

    var urn = this.getLastVersionURN(node)

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (manifest.status   === 'success' &&
          manifest.progress === 'complete') {

          if (this.derivativesAPI.hasDerivative(
              manifest, { outputType: 'svf' })) {

            node.parent.classList.add('derivated')

            this.derivativesAPI.getThumbnail(
              urn, {
                width: 200,
                height: 200
              }).then((thumbnail) => {

                let img = `<img width="150" height="150"
                    src='data:image/png;base64,${thumbnail}'/>`

                node.setTooltip(img)

                node.showLoader(false)
              })

          } else {

            node.setTooltip('no SVF derivative on this item')

            node.showLoader(false)
          }

        } else {

          node.showLoader(false)
        }

      }, (err) => {

        node.setTooltip('no derivative on this item')

        node.showLoader(false)

        // file not derivated have no manifest
        // skip those errors
        if (err !== 'Not Found') {

          console.warn(err)
        }
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeDblClick (node) {

    if (node.type === 'items' && node.manifest) {

      if (this.derivativesAPI.hasDerivative(
          node.manifest, { outputType: 'svf' })) {

        node.showLoader(true)

        this.emit('loadItem', node).then(() => {

          node.showLoader(false)

        }, (err) => {

          node.showLoader(false)
        })
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadData() {

    const hubs = await this.dmAPI.getHubs()

    hubs.data.forEach((hub) => {

      let treeContainerId = guid()

      this.TabManager.addTab({
        name: 'Hub: ' + hub.attributes.name,
        active: true,
        html: `<div id=${treeContainerId}
                class="tree-container">
              </div>`
      })

      this.loadHub(treeContainerId, hub)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadHub (containerId, hub) {

    let treeContainer = $(`#${containerId}`)[0]

    let delegate = new DMTreeDelegate(
      this.container,
      this.dmAPI,
      this.contextMenu)

    let rootNode = new TreeNode({
      name: hub.attributes.name,
      type: hub.type,
      hubId: hub.id,
      details: hub,
      group: true,
      id: hub.id
    })

    rootNode.on('childrenLoaded', (childrens) => {

      console.log('Hub Loaded: ' + rootNode.name)
    })

    let tree = new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
    })

    delegate.on('createItemNode', (data)=> {

      this.onCreateItemNode(tree, data)
    })

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)
  }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
class DMTreeDelegate extends BaseTreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor(container, dmAPI, contextMenu) {

    super(container, contextMenu)

    this.dmAPI = dmAPI
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = guid()

    node.parent = parent

    parent.classList.add(node.type)

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = guid()

    if (node.tooltip) {

      let html = `
        <label class="${node.type}" id="${labelId}"
          ${options && options.localize?"data-i18n=" + text : ''}
            data-placement="right"
            data-toggle="tooltip"
            data-delay='{"show":"1000", "hide":"100"}'
            title="loading item ...">
          ${text}
        </label>
      `

      $(parent).append(html)

      $(parent).find('label[data-toggle="tooltip"]').tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })

      node.setTooltip = (title) => {

        $(parent).find('label')
          .attr('title', title)
          .tooltip('fixTitle')
          .tooltip('setContent')
      }

    } else {

      let label = `
        <label class="${node.type}" id="${labelId}"
          ${options && options.localize?"data-i18n=" + text : ''}>
          ${text}
        </label>
      `

      $(parent).append(label)
    }

    if (['projects', 'folders'].indexOf(node.type) > -1) {

      $(parent).find('icon').before(`
        <div class="cloud-upload">
          <button" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"1000", "hide":"100"}'
              title="Upload files to that folder">
            <span class="glyphicon glyphicon-cloud-upload">
            </span>
          </button>
        </div>
      `)

      $(`#${labelId}`).css({
        'pointer-events': 'none'
      })

      let container = this.container

      $(parent).dropzone({
        url: `/api/upload/dm/${node.projectId}/${node.folderId}`,
        clickable: `.btn.c${parent.id}`,
        dictDefaultMessage: ' - upload',
        previewTemplate: '<div></div>',
        parallelUploads: 20,
        autoQueue: true,
        init: function() {

          let dropzone = this

          dropzone.on('dragenter', () => {
            $(parent).addClass('drop-target')

            $(container).find(
              '.container').addClass('hover')
          })

          dropzone.on('dragleave', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('dragend', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('drop', () => {
            $(parent).removeClass('drop-target')
          })

          dropzone.on('addedfile', (file) => {

            node.showLoader(true)

            console.log(file)
          })

          dropzone.on('uploadprogress', (file, progress) => {

          })
        },
        success: (file, response) => {

          console.log(response)

          node.showLoader(false)

          this.createItemNode(
            node,
            response.item,
            response.version)
        }
      })

    } else if(node.type === 'items') {

      if(node.versions) {

        // access latest item version by default
        let version = node.versions[ node.versions.length - 1 ]

        // checks if storage available
        if (version.relationships.storage) {

          // creates download button
          let downloadId = guid()

          $(parent).find('icon').before(`
            <div class="cloud-download">
                <button" id="${downloadId}" class="btn c${parent.id}"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"1000", "hide":"100"}'
                  title="Download ${version.attributes.displayName}">
                <span class="glyphicon glyphicon-cloud-download">
                </span>
              </button>
            </div>
          `)

          $(`#${downloadId}`).click(() => {

            node.showLoader(true, 3000)

            // downloads object associated with version
            this.dmAPI.download(version)
          })
        }
      }
    }

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }

    let loadDivId = guid()

    node.showLoader = (show, timeout = 0) => {

      if(!$('#' + loadDivId).length) {

        $('#' + labelId).after(`
          <div id=${loadDivId} class="label-loader"
            style="display:none;">
            <img> </img>
          </div>
        `)
      }

      $('#' + loadDivId).css(
        'display',
        show ? 'block' : 'none')

      if(timeout > 0) {

        setTimeout(()=>{
          node.showLoader(false)
        }, timeout)
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    if(node.onIteratingChildren) {

      node.onIteratingChildren()
    }

    switch(node.type) {

      case 'hubs':

        node.showLoader(true)

        node.on('childrenLoaded', (children) => {

          node.showLoader(false)
        })

        this.dmAPI.getProjects(
          node.id).then((projects) => {

            let projectTasks = projects.data.map((project) => {

              return new Promise((resolve, reject) => {

                let rootId = project.relationships.rootFolder.data.id

                let child = new TreeNode({
                  name: project.attributes.name,
                  projectId: project.id,
                  type: project.type,
                  details: project,
                  folderId: rootId,
                  hubId: node.id,
                  id: project.id,
                  group: true
                })
                
                child.on('childrenLoaded', (children) => {

                  child.showLoader(false)

                  resolve(child)
                })

                addChildCallback(child)

                child.showLoader(true)

                child.collapse()
              })
            })

            Promise.all(projectTasks).then((children) => {

              node.emit('childrenLoaded', children)
            })

        }, (error) => {

            node.emit('childrenLoaded', null)
        })

        break

      case 'projects':

        this.dmAPI.getProject(
          node.hubId, node.id).then((project) => {

            let rootId = project.data.relationships.rootFolder.data.id

            this.dmAPI.getFolderContent(
              node.id, rootId).then((folderItems) => {

                let folderItemTasks = folderItems.data.map((folderItem) => {

                  return new Promise((resolve, reject) => {

                    if (folderItem.type === 'items') {

                      var itemNode = this.createItemNode(
                        node,
                        folderItem)

                      resolve(itemNode)
                    }
                    else {

                      let child = new TreeNode({
                        name: folderItem.attributes.displayName,
                        folderId: folderItem.id,
                        type: folderItem.type,
                        details: folderItem,
                        projectId: node.id,
                        hubId: node.hubId,
                        id: folderItem.id,
                        group: true
                      })

                      child.on('childrenLoaded', (children) => {

                        child.showLoader(false)

                        resolve(child)
                      })

                      addChildCallback(child)

                      child.showLoader(true)

                      child.collapse()
                    }
                  })
                })

                Promise.all(folderItemTasks).then((children) => {

                  node.emit('childrenLoaded', children)
                })

            }, (error) => {

                node.emit('childrenLoaded', null)

            })

          }, (error) => {

            node.emit('childrenLoaded', null)

          })

        break

      case 'folders':

        this.dmAPI.getFolderContent(
          node.projectId, node.id).then((folderItems) => {

            let folderItemTasks = folderItems.data.map((folderItem) => {

              return new Promise((resolve, reject) => {

                if (folderItem.type === 'items') {

                  var itemNode = this.createItemNode(
                    node,
                    folderItem)

                  resolve(itemNode)
                }
                else {

                  let child = new TreeNode({
                    name: folderItem.attributes.displayName,
                    projectId: node.projectId,
                    folderId: folderItem.id,
                    type: folderItem.type,
                    details: folderItem,
                    hubId: node.hubId,
                    id: folderItem.id,
                    group: true
                  })

                  child.on('childrenLoaded', (children) => {

                    child.showLoader(false)

                    resolve(child)
                  })

                  addChildCallback(child)

                  child.showLoader(true)

                  child.collapse()
                }
              })
            })

            Promise.all(folderItemTasks).then((children) => {

              node.emit('childrenLoaded', children)
            })

          }, (error) => {

            node.emit('childrenLoaded', null)

          })

        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createItemNode (parent, item, version) {

    return this.emit('createItemNode', {
      version,
      parent,
      item
    })
  }
}

function guid(format = 'xxxxxxxxxx') {

  let d = new Date().getTime()

  let guid = format.replace(
    /[xy]/g,
    function (c) {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })

  return guid
}





