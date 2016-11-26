
import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class ItemContextMenu extends
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

      case 'item.root':

        menu.push({
          title: 'Show item versions details',
          className: 'fa fa-clone',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Version Details'
            })
          }
        })

        break

      case 'versions.version':

        menu.push({
          title: 'Show version details',
          className: 'fa fa-clock-o',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Version Details'
            })
          }
        })

        menu.push({
          title: 'Set as Active version',
          className: 'fa fa-check',
          target: () => {
            this.emit('context.setActiveVersion', {
              event, node
            })
          }
        })

        break

      case 'versions.file':

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

          if (node.version.relationships.storage) {

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
        }

        break

      case 'versions.attachments':

        menu.push({
          title: 'Show attachments details',
          className: 'fa fa-paperclip',
          target: () => {
            this.emit('context.details', {
              event, node, title: 'Attachments Details'
            })
          }
        })

        menu.push({
          title: 'Attach by version Id',
          className: 'fa fa-link',
          target: () => {
            this.emit('context.attachment.addById', {
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

      this.contextMenu.show(event, menu)
    }
  }
}