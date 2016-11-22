
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

      case 'versions.version':

        menu.push({
          title: 'Set as Active version',
          target: () => {
            this.emit('context.setActiveVersion', {
              event, node
            })
          }
        })

        break

      case 'versions.file':

        menu.push({
          title: 'Show version details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Version Details'
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

          if (node.version.relationships.storage) {

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