import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class OSSContextMenu extends
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

    switch(node.type) {

      case 'oss.root':

        menu.push({
          title: 'Create bucket',
          className: 'fa fa-plus',
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
          className: 'fa fa-folder-open',
          target: () => {
            this.emit('context.oss.details', {
              event, node
            })
          }
        })

        menu.push({
          title: 'Delete bucket',
          className: 'fa fa-times-circle',
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
          className: 'fa fa-file-text',
          target: () => {
            this.emit('context.oss.details', {
              event, node
            })
          }
        })

        menu.push({
          title: 'Delete object',
          className: 'fa fa-times-circle',
          target: () => {
            this.emit('context.oss.object.delete', {
              event, node
            })
          }
        })

        if (node.manifest) {

          menu.push({
            title: 'Re-generate viewable',
            className: 'fa fa-refresh',
            target: () => {
              this.emit('context.viewable.create', {
                event, node
              })
            }
          })

          menu.push({
            title: 'Delete viewable',
            className: 'fa fa-times',
            target: () => {
              this.emit('context.viewable.delete', {
                event, node
              })
            }
          })

        } else {

          menu.push({
            title: 'Generate viewable',
            className: 'fa fa-cog',
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