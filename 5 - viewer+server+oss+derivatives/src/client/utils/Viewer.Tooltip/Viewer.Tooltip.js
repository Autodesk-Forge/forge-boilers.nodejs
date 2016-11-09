import EventsEmitter from 'EventsEmitter'
import './Viewer.Tooltip.scss'

export default class ViewerTooltip extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    viewer.toolController.registerTool(this)

    this.viewer = viewer

    this.active = false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setContent (html, selector) {

    this.tooltipSelector = selector

    $(this.viewer.container).append(html)
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ['Viewer.Tooltip.Tool']
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return 'Viewer.Tooltip.Tool'
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if(!this.active) {

      this.active = true

      this.viewer.toolController.activateTool(
        this.getName())

      $(this.tooltipSelector).css({
        display: 'block'
      })

      this.emit('activate')
    }
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(
        this.getName())

      $(this.tooltipSelector).css({
        display: 'none'
      })

      this.emit('deactivate')
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleSingleClick (event, button) {

    //this.screenPoint = {
    //  x: event.clientX,
    //  y: event.clientY
    //}
    //
    //console.log('-------------------')
    //console.log('Tool:handleSingleClick(event, button)')
    //console.log(event)
    //
    //var viewport = this.viewer.navigation.getScreenViewport()
    //
    //var n = {
    //  x: (event.clientX - viewport.left) / viewport.width,
    //  y: (event.clientY - viewport.top) / viewport.height
    //}
    //
    //var worldPoint = this.viewer.utilities.getHitPoint(
    //  n.x,
    //  n.y)
    //
    //console.log(worldPoint)

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleMouseMove (event) {

    const $offset = $(this.viewer.container).offset()

    $(this.tooltipSelector).css({
      top  : event.clientY - $offset.top - 30 + 'px',
      left : event.clientX - $offset.left + 'px'
    })

    const screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    const worldPoint = this.screenToWorld(screenPoint)

    if (worldPoint && this.active) {


    }

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  screenToWorld (screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top ) / viewport.height
    }

    return this.viewer.utilities.getHitPoint(n.x, n.y)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    return false
  }
}
