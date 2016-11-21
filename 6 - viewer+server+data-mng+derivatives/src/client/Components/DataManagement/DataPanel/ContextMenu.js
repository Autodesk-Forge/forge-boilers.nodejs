
import EventsEmitter from 'EventsEmitter'

export default class ContextMenu extends
  EventsEmitter.Composer (Autodesk.Viewing.UI.ObjectContextMenu) {

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

    switch (node.type) {

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

        if (node.manifest) {

          menu.push({
            title: 'Re-generate viewable',
            target: () => {
              this.emit('context.viewable.create', {
                event, node
              })
            }
          })

          menu.push({
            title: 'Delete viewable',
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
              target: () => {
                this.emit('context.viewable.create', {
                  event, node
                })
              }
            })
          }
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