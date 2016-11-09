/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Derivative.JobPanel
// by Philippe Leefsma, June 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase'
import './JobPanel.scss'

export default class JobPanel extends ToolPanelBase {

  constructor (container, designName, format) {

    super(container, `Processing derivatives ...`, {
      closable: false,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('derivatives')
    $(this.container).addClass('job')

    $(`#${this.container.id}-name`).text(designName)
    $(`#${this.container.id}-format`).text(format)

    var angle = 0

    this.intervalId = setInterval(() => {

      angle += 2
      angle %= 360

      $(`#${this.titleImgId}`).css({
          transform: `rotateZ(${angle}deg)`
        })
    }, 10)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    return `

      <div class="container">

        <div class="design-name">
          Design:&nbsp;
          <label id="${id}-name">
          </label>
        </div>

        <div class="design-name">
          Format:&nbsp;
          <label id="${id}-format">
          </label>
        </div>

        <div class="job-progress">
          Progress:&nbsp;
          <label id="${id}-job-progress">
          0%
          </label>
        </div>

      </div>
      `
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateProgress (progress) {

    $(`#${this.container.id}-job-progress`).text(progress)

    return this._isVisible
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  jobFailed (job) {

    console.log('Job Failed! ')
    console.log(job)

    $(`#${this.container.id}-job-progress`).text(
      'Job failed :(')

    clearInterval(this.intervalId)

    setTimeout(() => {
      this.setVisible(false)
    }, 4000)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  done () {

    this.updateProgress('100%')

    clearInterval(this.intervalId)

    setTimeout(() => {
      this.setVisible(false)
    }, 4000)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onTitleDoubleClick (event) {

    clearInterval(this.intervalId)

    this.setVisible(false)
  }
}