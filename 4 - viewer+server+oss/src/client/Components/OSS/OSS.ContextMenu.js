
import EventsEmitter from 'EventsEmitter'

export default class OSSContextMenu extends
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

    switch(node.type) {

      case 'oss.root':

        menu.push({
          title: 'Create Bucket',
          target: () => {
            this.emit('context.oss.createBucket', {
              event,
              node
            })
          }
        })

        break

      case 'oss.bucket':

        menu.push({
          title: 'Show bucket details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Bucket Details'
            })
          }
        })

        break

      case 'oss.object':

        menu.push({
          title: 'Show object details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Object Details'
            })
          }
        })

        menu.push({
          title: 'Delete object',
          target: () => {
            this.emit('context.oss.object.delete', {
              event, node
            })
          }
        })

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