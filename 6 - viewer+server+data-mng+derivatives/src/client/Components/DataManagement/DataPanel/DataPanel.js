/////////////////////////////////////////////////////////////////////
// DataManagement Panel
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import {API as DerivativesAPI} from 'Derivatives'
import ContextMenu from './ContextMenu'
import UIComponent from 'UIComponent'
import TabManager from 'TabManager'
import Dropzone from 'dropzone'
import DMAPI from '../API'
import './DataPanel.scss'

export default class DataPanel extends UIComponent {

  constructor () {

    super()

    this.onItemNodeAddedHandler = (node) => {

      this.onItemNodeAdded (node)
    }

    this.onNodeDblClickHandler = (node) => {

      this.onNodeDblClick (node)
    }

    this.onNodeIconClickHandler = (node) => {

      this.onNodeIconClick (node)
    }

    this.onNodeVersionsClickHandler = (node) => {

      this.onNodeVersionsClick (node)
    }

    this.treeMap = {}
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

        switch(data.node.type) {

          case 'hubs':
            this.showPayload(
              `api/dm/hubs/${data.node.hubId}/projects`)
            break

          case 'projects':
            this.showPayload(
              `api/dm/hubs/${data.node.hubId}/projects/` +
                `${data.node.projectId}`)
            break

          case 'folders':
            this.showPayload(
              `api/dm/projects/${data.node.projectId}/folders/` +
                `${data.node.folderId}`)
            break

          case 'items':
            this.showPayload(
              `api/dm/projects/${data.node.projectId}/folders/` +
                `${data.node.folderId}/items/${data.node.itemId}`)
            break
        }
      }
    })

    this.contextMenu.on('context.viewable.create', async(data) => {

      try {

        data.node.showLoader(true)

        var version = data.node.activeVersion

        let input = {
          urn: this.getVersionURN(version)
        }

        const output = {
          force: true,
          formats:[{
            type: 'svf',
            views: ['2d', '3d']
          }]
        }

        const fileExtType = (version.attributes && version.attributes.extension) ?
          version.attributes.extension.type : null

        if (fileExtType === 'versions:autodesk.a360:CompositeDesign') {

          input.rootFilename = version.attributes ?
            version.attributes.name :
            null

          input.compressedUrn = true
        }

        const job = {
          output,
          input
        }

        await this.derivativesAPI.postJobWithProgress(
          job, {
            panelContainer: viewerContainer,
            designName: data.node.name
          }, { type: 'geometry' })

        setTimeout(() => {
          this.onItemNodeAddedHandler (data.node)
        }, 500)

      } catch (ex) {

        console.log('SVF Job failed')
        console.log(ex)

        data.node.showLoader(false)
      }
    })

    this.contextMenu.on('context.viewable.delete', (data) => {

      let urn = this.getVersionURN(data.node.activeVersion)

      data.node.showLoader(true)

      this.derivativesAPI.deleteManifest(urn).then(() => {

        data.node.manifest = null

        data.node.parent.classList.remove('derivated')

        data.node.showLoader(false)

      }, (err) => {

        data.node.showLoader(false)
      })
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
  getVersionURN (version) {

    if (version.relationships.storage) {

      var urn = window.btoa(
        version.relationships.storage.data.id)

      return urn.replace(new RegExp('=', 'g'), '')

    } else {

      return null
    }
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
        folderId: parent.folderId,
        hubId: parent.hubId,
        type: item.type,
        itemId: item.id,
        details: item,
        tooltip: true,
        id: item.id,
        group: true
      })

      // BIM Docs items have no name :( ...
      if (node.name) {

        parent.addChild(node)

        node.showLoader(true)
      }

      this.dmAPI.getItemVersions(
        node.projectId, node.id).then((versions) => {

          node.versions = versions.data

          if (node.versions.length) {

            node.activeVersion = node.versions[0]

            if (!node.name) {

              // fix for BIM Docs - displayName doesn't appear in item
              node.name = node.activeVersion.attributes.displayName

              parent.addChild(node)

              node.showLoader(true)
            }

            node.addVersionControl()
          }

          this.onItemNodeAdded(node)
        })

    } else {

      if (node.versions) {

        node.versions.unshift(version)

        node.activeVersion = version
      }
    }

    return node
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onItemNodeAdded (node) {

    var version = node.activeVersion

    if (!version.relationships.storage) {

      node.setTooltip('derivatives unavailable on this item')

      node.parent.classList.add('unavailable')

      node.showLoader(false)

      return
    }

    var urn = this.getVersionURN(version)

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (manifest.status   === 'success' &&
            manifest.progress === 'complete') {

          if (this.derivativesAPI.hasDerivative(
              manifest, { type: 'geometry'})) {

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
          node.manifest, { type: 'geometry'})) {

        node.showLoader(true)

        this.emit('loadVersion', node.activeVersion).then(() => {

          node.showLoader(false)

        }, (err) => {

          node.showLoader(false)
        })
      }
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeIconClick (node) {

    if (node.type === 'items') {

      node.showLoader(true)

      this.emit('loadDerivatives', node).then(() => {

        node.showLoader(false)
      })
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onNodeVersionsClick (node) {

    this.emit('loadItemDetails', node).then(() => {

      node.showLoader(false)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadData() {

    const hubs = await this.dmAPI.getHubs()

    hubs.data.forEach((hub) => {

      let treeContainerId = this.guid()

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

    const tree = new Autodesk.Viewing.UI.Tree(
      delegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
    })

    delegate.on('createItemNode', (data)=> {

      this.onCreateItemNode(tree, data)
    })

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('node.iconClick',
      this.onNodeIconClickHandler)

    delegate.on('node.versionsClick',
      this.onNodeVersionsClickHandler)

    this.treeMap[hub.id] = tree
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

    this.on('node.click node.iconClick', (node) => {

      if (node.loadChildren) {

        node.loadChildren('firstLevel')
      }
    })

    this.on('node.dblClick', (node) => {

      if (node.loadChildren) {

        node.loadChildren('allLevels')

        node.expand()
      }
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    parent.id = this.guid()

    node.parent = parent

    parent.classList.add(node.type)

    let text = this.getTreeNodeLabel(node)

    if (options && options.localize) {

      text = Autodesk.Viewing.i18n.translate(text)
    }

    let labelId = this.guid()

    if (node.tooltip) {

      const html = `
        <div class="label-container">
            <label id="${labelId}"
              class="tooltip-container ${node.type}"
              ${options && options.localize?"data-i18n=" + text : ''}
                data-placement="right"
                data-toggle="tooltip"
                data-delay='{"show":"800", "hide":"100"}'
                title="loading item ...">
              ${text}
            </label>
        </div>
      `

      $(parent).append(html)

      const $tooltipTarget = $(parent).find(
        '[data-toggle="tooltip"]')

      $tooltipTarget.tooltip({
        container: 'body',
        animated: 'fade',
        html: true
      })

      node.setTooltip = (title) => {

        $(parent).find('.tooltip-container')
          .attr('title', title)
          .tooltip('fixTitle')
          .tooltip('setContent')
      }

    } else {

      let label = `
        <div class="label-container">
            <label class="${node.type}" id="${labelId}"
              ${options && options.localize?"data-i18n=" + text : ''}>
              ${text}
            </label>
        </div>
      `

      $(parent).append(label)
    }

    if (['projects', 'folders'].indexOf(node.type) > -1) {

      $(parent).find('icon').before(`
        <div class="cloud-upload">
          <button" class="btn c${parent.id}"
              data-placement="right"
              data-toggle="tooltip"
              data-delay='{"show":"800", "hide":"100"}'
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

          const dropzone = this

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

      $(parent).find('icon').attr({
        'data-delay':'{"show":"800", "hide":"100"}',
        'title':'Show model derivatives',
        'data-placement':'right',
        'data-toggle':'tooltip'
      })

      node.addVersionControl = () => {

        // checks if storage available
        if (node.activeVersion.relationships.storage) {

          // creates download button
          const downloadId = this.guid()

          $(parent).find('icon').before(`
            <div class="cloud-download">
                <button" id="${downloadId}" class="btn c${parent.id}"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"800", "hide":"100"}'
                  title="Download ${node.name}">
                <span class="glyphicon glyphicon-cloud-download">
                </span>
              </button>
            </div>
          `)

          $(`#${downloadId}`).click(() => {

            node.showLoader(true, 3000)

            // downloads object associated with version
            this.dmAPI.download(node.activeVersion)
          })
        }

        const itemBtnId = this.guid()

        $(parent).find('icon').before(`
            <div class="item-details-icon" id="${itemBtnId}">
                <span class="fa fa-clock-o item-details-span"
                  data-placement="right"
                  data-toggle="tooltip"
                  data-delay='{"show":"800", "hide":"100"}'
                  title="Show item versions">
                </span>
            </div>
          `)

        $(`#${itemBtnId}`).click(() => {

          node.showLoader(true)

          this.emit('node.versionsClick', node)
        })
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

    const loadDivId = this.guid()

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

    // collapse node by default
    node.collapse()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    switch(node.type) {

      case 'hubs':

        node.on('childrenLoaded', (children) => {

          node.loadStatus = 'loaded'

          node.showLoader(false)
        })

        node.loadChildren = (loadingMode) => {

          if (['pending', 'loaded'].indexOf(node.loadStatus) > -1) {

            return
          }

          node.loadStatus = 'pending'

          node.showLoader(true)

          // if node has children -> run loadChildren
          // on each child if loadMode is not 'firstLevel'
          // otherwise request children from API

          if (node.children) {

            if (loadingMode !== 'firstLevel') {

              node.children.forEach((child) => {

                child.loadChildren(loadingMode)
              })
            }

          } else {

            node.children = []

            this.dmAPI.getProjects(
              node.id).then((projectsRes) => {

                const projects = _.sortBy(projectsRes.data,
                  (project) => {
                    return project.attributes.name.toLowerCase()
                  })

                let projectTasks = projects.map((project) => {

                  return new Promise((resolve, reject) => {

                    let rootId = project.relationships.rootFolder.data.id

                    let child = new TreeNode({
                      name: project.attributes.name,
                      projectId: project.id,
                      type: project.type,
                      details: project,
                      folderId: rootId,
                      hubId: node.id,
                      group: true,
                      id: rootId
                    })

                    child.on('childrenLoaded', (children) => {

                      child.loadStatus = 'loaded'

                      child.showLoader(false)

                      resolve(child)
                    })

                    addChildCallback(child)

                    node.children.push(child)

                    if (loadingMode !== 'firstLevel') {

                      child.loadChildren(loadingMode)
                    }
                  })
                })

                if (loadingMode === 'firstLevel') {

                  node.loadStatus = 'idle'

                  node.showLoader(false)
                }

                Promise.all(projectTasks).then((children) => {

                  node.emit('childrenLoaded', children)
                })

              }, (error) => {

                node.emit('childrenLoaded', null)
              })
          }
        }

        break

      case 'projects':

        node.loadChildren = (loadingMode) => {

          if (['pending', 'loaded'].indexOf(node.loadStatus) > -1) {

            return
          }

          node.loadStatus = 'pending'

          node.showLoader(true)

          if (node.children) {

            if (loadingMode !== 'firstLevel') {

              node.children.forEach((child) => {

                child.loadChildren(loadingMode)
              })
            }

          } else {

            node.children = []

            this.dmAPI.getProject(
              node.hubId, node.projectId).then((project) => {

                const rootId = project.data.relationships.rootFolder.data.id

                this.dmAPI.getFolderContent(
                  node.projectId, rootId).then((folderItemsRes) => {

                    const folderItems = _.sortBy(folderItemsRes.data,
                      (folderItem) => {
                        return folderItem.attributes.displayName.toLowerCase()
                      })

                    const folders = folderItems.filter((folderItem) => {

                      return (folderItem.type === 'folders')
                    })

                    const items = folderItems.filter((folderItem) => {

                      return (folderItem.type === 'items')
                    })

                    const folderTasks = folders.map((folder) => {

                      return new Promise((resolve, reject) => {

                        let child = new TreeNode({
                          name: folder.attributes.displayName,
                          projectId: node.projectId,
                          folderId: folder.id,
                          type: folder.type,
                          hubId: node.hubId,
                          details: folder,
                          id: folder.id,
                          group: true
                        })

                        child.on('childrenLoaded', (children) => {

                          child.loadStatus = 'loaded'

                          child.showLoader(false)

                          resolve(child)
                        })

                        addChildCallback(child)

                        node.children.push(child)

                        if (loadingMode !== 'firstLevel') {

                          child.loadChildren(loadingMode)
                        }
                      })
                    })

                    const itemTasks = items.map((item) => {

                      return new Promise((resolve, reject) => {

                        var itemNode = this.createItemNode(
                          node, item)

                        resolve(itemNode)
                      })
                    })

                    if (loadingMode === 'firstLevel') {

                      node.loadStatus = 'idle'

                      node.showLoader(false)
                    }

                    const tasks = [...folderTasks, ...itemTasks]

                    Promise.all(tasks).then((children) => {

                      node.emit('childrenLoaded', children)
                    })

                  }, (error) => {

                    node.emit('childrenLoaded', null)

                  })

              }, (error) => {

                node.emit('childrenLoaded', null)

              })
          }
        }

        break

      case 'folders':

        node.loadChildren = (loadingMode) => {

          if (['pending', 'loaded'].indexOf(node.loadStatus) > -1) {

            return
          }

          node.loadStatus = 'pending'

          node.showLoader(true)

          if (node.children) {

            if (loadingMode !== 'firstLevel') {

              node.children.forEach((child) => {

                child.loadChildren(loadingMode)
              })
            }

          } else {

            node.children = []

            this.dmAPI.getFolderContent(
              node.projectId, node.folderId).then((folderItemsRes) => {

                const folderItems = _.sortBy(folderItemsRes.data,
                  (folderItem) => {
                    return folderItem.attributes.displayName.toLowerCase()
                  })

                const folders = folderItems.filter((folderItem) => {

                  return (folderItem.type === 'folders')
                })

                const items = folderItems.filter((folderItem) => {

                  return (folderItem.type === 'items')
                })

                const folderTasks = folders.map((folder) => {

                  return new Promise((resolve, reject) => {

                    let child = new TreeNode({
                      name: folder.attributes.displayName,
                      projectId: node.projectId,
                      folderId: folder.id,
                      type: folder.type,
                      hubId: node.hubId,
                      details: folder,
                      id: folder.id,
                      group: true
                    })

                    child.on('childrenLoaded', (children) => {

                      child.loadStatus = 'loaded'

                      child.showLoader(false)

                      resolve(child)
                    })

                    addChildCallback(child)

                    node.children.push(child)

                    if (loadingMode !== 'firstLevel') {

                      child.loadChildren(loadingMode)
                    }
                  })
                })

                const itemTasks = items.map((item) => {

                  return new Promise((resolve, reject) => {

                    var itemNode = this.createItemNode(
                      node, item)

                    resolve(itemNode)
                  })
                })

                if (loadingMode === 'firstLevel') {

                  node.loadStatus = 'idle'

                  node.showLoader(false)
                }

                const tasks = [...folderTasks, ...itemTasks]

                Promise.all(tasks).then((children) => {

                  node.emit('childrenLoaded', children)
                })

              }, (error) => {

                node.emit('childrenLoaded', null)

              })
          }
        }

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





