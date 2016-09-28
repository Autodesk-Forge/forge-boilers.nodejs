
import { EventsEmitterComposer } from 'EventsEmitter'

export default class DataManagementContextMenu extends
  EventsEmitterComposer (Autodesk.Viewing.UI.ObjectContextMenu) {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super (viewer)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMenu (event, node) {

    var menu = []

    switch(node.type) {

      case 'hubs':

        menu.push({
          title: 'Show hub details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Hub Details'
            })
          }
        })

        break

      case 'projects':

        menu.push({
          title: 'Show project details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Project Details'
            })
          }
        })

        break

      case 'folders':

        menu.push({
          title: 'Show folder details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Folder Details'
            })
          }
        })

        break

      case 'items':

        menu.push({
          title: 'Show item details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Item Details'
            })
          }
        })

        menu.push({
          title: `Show item versions (${node.versions ?
            node.versions.length : 0})`,
          target: () => {
            this.emit('context.versions', {
              event, node, title: 'Item Versions'
            })
          }
        })

        if (node.manifest) {

          menu.push({
            title: 'Show manifest',
            target: () => {
              this.emit('context.manifest.show', {
                event, node
              })
            }
          })

          menu.push({
            title: 'Delete manifest',
            target: () => {
              this.emit('context.manifest.delete', {
                event, node
              })
            }
          })

          menu.push({
            title: 'Re-generate viewable',
            target: () => {
              this.emit('context.viewable', {
                event, node
              })
            }
          })

        } else {

          menu.push({
            title: 'Generate viewable',
            target: () => {
              this.emit('context.viewable', {
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

      this.contextMenu.show(event, menu);
    }
  }
}