
import { EventsEmitterComposer } from 'EventsEmitter'

export default class OSSContextMenu extends
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

      case 'oss.root':

        menu.push({
          title: 'Create bucket',
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
          title: 'Bucket details',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Bucket Details'
            })
          }
        })

        break

      case 'oss.object':

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

        menu.push({
          title: 'Object details',
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