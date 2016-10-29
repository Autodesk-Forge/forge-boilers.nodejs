
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
          title: 'Create bucket',
          target: () => {
            this.emit('context.oss.bucket.create', {
              event, node
            })
          }
        })

        break

      case 'oss.bucket':

        menu.push({
          title: 'Bucket details',
          target: () => {
            this.emit('context.oss.details', {
              event, node
            })
          }
        })

        menu.push({
          title: 'Delete bucket',
          target: () => {
            this.emit('context.oss.bucket.delete', {
              event, node
            })
          }
        })

        break

      case 'oss.object':

        menu.push({
          title: 'Object details',
          target: () => {
            this.emit('context.oss.details', {
              event, node
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

          menu.push({
            title: 'Generate viewable',
            target: () => {
              this.emit('context.viewable.create', {
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