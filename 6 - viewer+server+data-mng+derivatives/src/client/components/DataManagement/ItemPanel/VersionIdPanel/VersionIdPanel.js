/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelModal from 'ToolPanelModal'
import './VersionIdPanel.scss'

export default class VersionIdPanel extends ToolPanelModal {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container) {

    super(container, {
      title: 'Add attachment by version Id ...'
    })

    $(this.container).addClass('version-id')

    this.inputId = ToolPanelModal.guid()

    this.bodyContent(`
      <div>
       <input id="${this.inputId}"
          type="text" class="version-id-input"
          placeholder=" Version Id ...">
      </div>
    `)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  get versionId() {

    return $(`#${this.inputId}`).val()
  }
}






