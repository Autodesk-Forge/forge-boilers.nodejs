/////////////////////////////////////////////////////////////////////
// DataManagement Panel
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import { BaseTreeDelegate, TreeNode } from 'TreeView'
import CreateFolderPanel from './CreateFolderPanel'
import {API as DerivativesAPI} from 'Derivatives'
import ToolPanelModal from 'ToolPanelModal'
import ContextMenu from './DataContextMenu'
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

        switch (data.type) {

          case 'hubs':
            this.showPayload(
              `${this.dmAPI.apiUrl}/hubs/` +
              `${data.node.hubId}/projects`)
            break

          case 'projects':
            this.showPayload(
              `${this.dmAPI.apiUrl}/hubs/` +
              `${data.node.hubId}/projects/` +
              `${data.node.projectId}`)
            break

          case 'top.folders.content':
            this.showPayload(
              `${this.dmAPI.apiUrl}/hubs/` +
              `${data.node.hubId}/projects/` +
              `${data.node.projectId}/topFolders`)
            break

          case 'folders':
            this.showPayload(
              `${this.dmAPI.apiUrl}/projects/` +
              `${data.node.projectId}/folders/` +
              `${data.node.folderId}`)
            break

          case 'folders.content':
            this.showPayload(
              `${this.dmAPI.apiUrl}/projects/` +
              `${data.node.projectId}/folders/` +
              `${data.node.folderId}/content`)
            break

          case 'items':
            this.showPayload(
              `${this.dmAPI.apiUrl}/projects/` +
              `${data.node.projectId}/items/` +
              `${data.node.itemId}`)
            break
        }
      }
    })

    this.contextMenu.on('context.folder.create', (data) => {

      const dlg = new CreateFolderPanel(appContainer)

      dlg.setVisible(true)

      dlg.on('close', (event) => {

        if (event.result === 'OK') {

          const node = data.node

          node.showLoader(true)

          this.dmAPI.postFolder (
            node.projectId,
            node.folderId,
            dlg.folderName).then((folderRes) => {

            const folder = folderRes.data

            const folderNode = new TreeNode({
              projectId: node.projectId,
              name: dlg.folderName,
              folderId: folder.id,
              hubId: node.hubId,
              type: folder.type,
              details: folder,
              id: folder.id,
              group: true
            })

            node.insert(folderNode)

            node.showLoader(false)

          }, (err) => {

            console.log(err)

            node.showLoader(false)
          })
        }
      })
    })

    this.contextMenu.on('context.folder.search', (data) => {

      this.showPayload(
        `${this.dmAPI.apiUrl}/projects/` +
        `${data.node.projectId}/folders/` +
        `${data.node.folderId}/search/` +
        `filter[extension.type]=items:autodesk.core:File`)
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

        data.node.setTooltip('no SVF derivative on this item')

        data.node.parent.classList.remove('derivated')

        data.node.showLoader(false)

        data.node.manifest = null

      }, (err) => {

        data.node.showLoader(false)
      })
    })

    this.contextMenu.on('context.item.delete', (data) => {

      const dlg = new ToolPanelModal(appContainer, {
        title: 'Delete item ...'
      })

      dlg.bodyContent(
        `<div class="confirm-delete">
          <br>
          Are you sure you want to delete
          <b>
            ${data.node.name}
          </b>
          ?
        </div>
        `)

      dlg.setVisible(true)

      dlg.on('close', async(event) => {

        if (event.result === 'OK') {

          console.log('Deleting item: ' + data.node.name)

          data.node.showLoader(true)

          this.dmAPI.deleteItem(
            data.node.projectId,
            data.node.itemId).then(() => {

              data.node.remove()

            }, (err) => {

              data.node.showLoader(false)
            })
        }
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

    let { parent, item, version , insert } = data

    if (!parent.loadStatus) {

      return null
    }

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

        if (insert) {

          parent.insert(node)

        } else {

          parent.addChild(node)
        }

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

              if (insert) {

                parent.insert(node)

              } else {

                parent.addChild(node)
              }

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

        this.onItemNodeAdded(node)
      }
    }

    return node
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onItemNodeAdded (node) {

    node.manifest = null

    var version = node.activeVersion

    if (!version || !version.relationships.storage) {

      node.setTooltip('derivatives unavailable on this item')

      node.parent.classList.add('unavailable')

      node.showLoader(false)

      return
    }

    node.showLoader(true)

    var urn = this.getVersionURN(version)

    this.derivativesAPI.getManifest(
      urn).then((manifest) => {

        node.manifest = manifest

        if (this.derivativesAPI.hasDerivative(
            manifest, { type: 'geometry'})) {

          node.parent.classList.add('derivated')

          this.derivativesAPI.getThumbnail(
            urn, {
              width: 200,
              height: 200
            }).then((thumbnail) => {

              const img = `<img width="150" height="150"
                  src='data:image/png;base64,${thumbnail}'/>`

              node.setTooltip(img)

              node.showLoader(false)
            })

        } else {

          node.setTooltip('no SVF derivative on this item')

          node.parent.classList.remove('derivated')

          node.showLoader(false)
        }

      }, (err) => {

        node.setTooltip('no derivative on this item')

        node.parent.classList.remove('derivated')

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

    }, (err) => {

      node.showLoader(false)

      console.log(err)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getHubHeader (type) {

    switch (type) {

      case 'hubs:autodesk.a360:PersonalHub':
        return 'Hub:'

      case 'hubs:autodesk.bim360:Account':
        return 'BIM Hub:'

      case 'hubs:autodesk.core:Hub':
      default :
        return 'Team Hub:'
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  async loadData() {

    const hubs = await this.dmAPI.getHubs()

    hubs.data.forEach((hub) => {

      const treeContainerId = this.guid()

      const searchInputId = this.guid()

      const hubHeader = this.getHubHeader(
        hub.attributes.extension.type)

      this.TabManager.addTab({
        active: !Object.keys(this.treeMap).length,
        name: `<b>${hubHeader}</b> `+ hub.attributes.name,
        html: `
          <div id=${treeContainerId} class="tree-container">
            <div class="search">
              <input id="${searchInputId}" type="text"
                placeholder=" Search ...">
            </div>
          </div>
        `
      })

      const tree = this.loadHub(treeContainerId, hub)

      const rootNode = tree.nodeIdToNode[hub.id]

      $('#' + searchInputId).on('input keyup', () => {

        const search = $('#' + searchInputId).val()

        this.filterNode(
          rootNode,
          search.toLowerCase())
      })
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

    delegate.on('createItemNode', (data) => {

      return this.onCreateItemNode(tree, data)
    })

    delegate.on('node.dblClick',
      this.onNodeDblClickHandler)

    delegate.on('node.iconClick',
      this.onNodeIconClickHandler)

    delegate.on('node.versionsClick',
      this.onNodeVersionsClickHandler)

    this.treeMap[hub.id] = tree

    return tree
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  filterNode (node, filter) {

    const name = node.name.toLowerCase()

    let visibleItems = 0

    if (node.children) {

      node.children.forEach((child) => {

        visibleItems += this.filterNode(child, filter)
      })

      if (visibleItems) {

        $(node.parent).css({
          display: 'block'
        })

      } else {

        if (name.indexOf(filter) < 0) {

          $(node.parent).css({
            display: 'none'
          })

        } else {

          $(node.parent).css({
            display: 'block'
          })
        }
      }

      return visibleItems

    } else {

      if (name.indexOf(filter) < 0) {

        $(node.parent).css({
          display: 'none'
        })

      } else {

        $(node.parent).css({
          display: 'block'
        })

        ++visibleItems
      }
    }

    return visibleItems
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

    this.on('node.click node.iconClick', (node, collapsed) => {

      if (node.loadChildren && collapsed) {

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
        url: `/api/upload/dm/` +
          `projects/${node.projectId}/` +
          `folders/${node.folderId}`,
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

          const itemNode = this.createItemNode(
            node,
            response.item,
            response.version,
            true)

          node.children.push(itemNode)
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

    node.remove = () => {
      $(`group[lmv-nodeid='${node.id}']`).remove()
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
            <span> </span>
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

    node.insert = (child) => {

      const $group = $(node.parent).parent()

      let index = -1

      $group.find('> group').each(function(idx) {

        if ($(this).find('header').hasClass(child.type)) {

          const name =
            $(this).find('.label-container').text().
              replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '').
              replace(/(\r\n|\n|\r)/gm, '')

          if (child.name.localeCompare(name) > 0) {

            index = idx
          }

        } else if (child.type === 'items') {

          index = idx
        }
      })

      node.addChild(child)

      const element = $(child.parent).parent().detach()

      $group.insertAt(index + 2, element)
    }

    // collapse node by default
    node.collapse()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onHubNode (node, showProjects = false) {

    node.on('childrenLoaded', (children) => {

      node.loadStatus = 'loaded'

      node.showLoader(false)
    })

    node.loadChildren = async(loadingMode) => {

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

            if(child.loadChildren) {

              child.loadChildren(loadingMode)
            }
          })

        } else {

          node.loadStatus = 'idle'

          node.showLoader(false)
        }

      } else {

        try {

          node.children = []

          const projectsRes = await this.dmAPI.getProjects(node.id)

          const projects = _.sortBy(projectsRes.data,
            (project) => {
              return project.attributes.name.toLowerCase()
            })

          if (showProjects) {

            const projectTasks = projects.map((project) => {

              return new Promise((resolve) => {

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

                child.on('childrenLoaded', () => {

                  child.loadStatus = 'loaded'

                  child.showLoader(false)

                  resolve(child)
                })

                node.addChild(child)

                node.children.push(child)

                if (loadingMode !== 'firstLevel') {

                  if (child.loadChildren) {

                    child.loadChildren(loadingMode)
                  }
                }
              })
            })

            if (loadingMode === 'firstLevel') {

              node.loadStatus = 'idle'

              node.showLoader(false)
            }

            Promise.all(projectTasks).then(
              (children) => {
                node.emit('childrenLoaded', children)
              })

          } else {

            const projectTasks = projects.map((project) => {

              return new Promise(async(resolve) => {

                const folderItemsRes =
                  await this.dmAPI.getProjectTopFolders(
                    node.id, project.id)

                folderItemsRes.data.forEach((folder) => {
                  folder.projectId = project.id
                })

                return resolve(folderItemsRes.data)
              })
            })

            Promise.all(projectTasks).then((folderArrays) => {

              if (loadingMode === 'firstLevel') {

                node.loadStatus = 'idle'

                node.showLoader(false)
              }

              const folders = _.sortBy(_.flatten(folderArrays),
                (folderItem) => {
                  return folderItem.attributes.displayName.toLowerCase()
                })

              const foldersTasks = folders.map((folder) => {

                return new Promise((resolve) => {

                  let child = new TreeNode({
                    name: folder.attributes.displayName,
                    projectId: folder.projectId,
                    folderId: folder.id,
                    type: folder.type,
                    details: folder,
                    hubId: node.id,
                    id: folder.id,
                    group: true
                  })

                  child.on('childrenLoaded', () => {

                    child.loadStatus = 'loaded'

                    child.showLoader(false)

                    resolve(child)
                  })

                  node.addChild(child)

                  node.children.push(child)

                  if (loadingMode !== 'firstLevel') {

                    if (child.loadChildren) {

                      child.loadChildren(loadingMode)
                    }
                  }
                })
              })

              Promise.all(foldersTasks).then(
                (children) => {
                  node.emit('childrenLoaded', children)
                })
            })
          }

        } catch(ex) {

          node.emit('childrenLoaded', null)
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onProjectNode (node) {

    node.loadChildren = (loadingMode) => {

      if (['pending', 'loaded'].indexOf(node.loadStatus) > -1) {

        return
      }

      node.loadStatus = 'pending'

      node.showLoader(true)

      if (node.children) {

        if (loadingMode !== 'firstLevel') {

          node.children.forEach((child) => {

            if(child.loadChildren) {

              child.loadChildren(loadingMode)
            }
          })

        } else {

          node.loadStatus = 'idle'

          node.showLoader(false)
        }

      } else {

        node.children = []

        //this.dmAPI.getProject(
        //  node.hubId, node.projectId).then((project) => {
        //
        //const rootId = project.data.relationships.rootFolder.data.id
        //
        //this.dmAPI.getFolderContent(
        //  node.projectId, rootId).then((folderItemsRes) => {
        //

        this.dmAPI.getProjectTopFolders(
          node.hubId, node.projectId).then((folderItemsRes) => {

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

              return new Promise((resolve) => {

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

                child.on('childrenLoaded', () => {

                  child.loadStatus = 'loaded'

                  child.showLoader(false)

                  resolve(child)
                })

                node.addChild(child)

                node.children.push(child)

                if (loadingMode !== 'firstLevel') {

                  if(child.loadChildren) {

                    child.loadChildren(loadingMode)
                  }
                }
              })
            })

            const itemTasks = items.map((item) => {

              return new Promise((resolve, reject) => {

                const itemNode = this.createItemNode(
                  node, item)

                node.children.push(itemNode)

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
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onFolderNode (node) {

    node.loadChildren = (loadingMode) => {

      if (['pending', 'loaded'].indexOf(node.loadStatus) > -1) {

        return
      }

      node.loadStatus = 'pending'

      node.showLoader(true)

      if (node.children) {

        if (loadingMode !== 'firstLevel') {

          node.children.forEach((child) => {

            if(child.loadChildren) {

              child.loadChildren(loadingMode)
            }
          })

        } else {

          node.loadStatus = 'idle'

          node.showLoader(false)
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

              return new Promise((resolve) => {

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

                child.on('childrenLoaded', () => {

                  child.loadStatus = 'loaded'

                  child.showLoader(false)

                  resolve(child)
                })

                node.addChild(child)

                node.children.push(child)

                if (loadingMode !== 'firstLevel') {

                  if(child.loadChildren) {

                    child.loadChildren(loadingMode)
                  }
                }
              })
            })

            const itemTasks = items.map((item) => {

              return new Promise((resolve, reject) => {

                const itemNode = this.createItemNode(
                  node, item)

                node.children.push(itemNode)

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
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    node.addChild = addChildCallback

    switch (node.type) {

      case 'projects':
        return this.onProjectNode (node)

      case 'folders':
        return this.onFolderNode (node)

      case 'hubs':
        return this.onHubNode (node)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createItemNode (parent, item, version, insert = false) {

    return this.emit('createItemNode', {
      version,
      parent,
      insert,
      item
    })
  }
}





