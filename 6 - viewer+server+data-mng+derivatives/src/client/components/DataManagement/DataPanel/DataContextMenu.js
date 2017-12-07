
import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class DataContextMenu extends
  EventsEmitter.Composer (Autodesk.Viewing.UI.ObjectContextMenu) {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (opts) {

    super (opts)

    this.contextMenu = new ContextMenu(opts)
  }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    buildMenu (event, node) {

      var menu = []

      switch (node.type) {

        case 'hubs':

          menu.push({
            title: 'Show details',
            icon: 'fa fa-share',
            target: [{
              title: 'Hub details',
              icon: 'fa fa-cloud',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'hubs'
                })
              }
            }, {
              title: 'Projects details',
              icon: 'fa fa-folder',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'hubs.projects'
                })
              }
            }]
          })

          break

      case 'projects':

        menu.push({
          title: 'Show details',
          icon: 'fa fa-share',
          target: [{
              title: 'Project details',
              icon: 'fa fa-clone',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'projects'
                })
              }
            }, {
              title: 'Root folder details',
              icon: 'fa fa-folder',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'folders'
                })
              }
            }, {
              title: 'Root folder content',
              icon: 'fa fa-folder-open',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'folders.content'
                })
              }
            },{
              title: 'Top folder content',
              icon: 'fa fa-folder-open',
              target: () => {
                this.emit('context.details', {
                  event, node, type: 'top.folders.content'
                })
              }
          }]
        })

        menu.push({
          title: 'Create new folder',
          icon: 'fa fa-plus',
          target: () => {
            this.emit('context.folder.create', {
              event, node
            })
          }
        })

        break

      case 'folders':

        menu.push({
          title: 'Show details',
          icon: 'fa fa-share',
          target: [{
            title: 'Folder details',
            icon: 'fa fa-folder',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'folders'
              })
            }
          }, {
            title: 'Folder content',
            icon: 'fa fa-folder-open',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'folders.content'
              })
            }
          }]
        })

        menu.push({
          title: 'Search folder',
          icon: 'fa fa-search',
          target: () => {
            this.emit('context.folder.search', {
              event, node
            })
          }
        })

        menu.push({
          title: 'Create new folder',
          icon: 'fa fa-plus',
          target: () => {
            this.emit('context.folder.create', {
              event, node
            })
          }
        })

        break

      case 'items':

        menu.push({
          title: 'Show item details',
          icon: 'fa fa-file-text',
          target: () => {
            this.emit('context.details', {
              event, node, type: 'items'
            })
          }
        })

        if (node.manifest) {

          menu.push({
            title: 'Re-generate viewable',
            icon: 'fa fa-refresh',
            target: () => {
              this.emit('context.viewable.create', {
                event, node
              })
            }
          })

          menu.push({
            title: 'Delete viewable',
            icon: 'fa fa-times',
            target: () => {
              this.emit('context.viewable.delete', {
                event, node
              })
            }
          })

        } else {

          if(node.activeVersion.relationships.storage) {

            menu.push({
              title: 'Generate viewable',
              icon: 'fa fa-cog',
              target: () => {
                this.emit('context.viewable.create', {
                  event, node
                })
              }
            })
          }
        }

        if(node.activeVersion.relationships.storage) {

          menu.push({
            title: 'Delete item',
            icon: 'fa fa-times-circle',
            target: () => {
              this.emit('context.item.delete', {
                event, node
              })
            }
          })
        }

        break
    }

    return menu
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  show (event, node) {

    var menu = this.buildMenu(event, node)

    if (menu && 0 < menu.length) {

      this.contextMenu.show(event, menu)
    }
  }
}