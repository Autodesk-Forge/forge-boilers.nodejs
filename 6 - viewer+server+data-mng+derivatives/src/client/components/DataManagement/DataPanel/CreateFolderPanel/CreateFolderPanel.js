/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelModal from 'ToolPanelModal'
import './CreateFolderPanel.scss'

export default class CreateFolderPanel extends ToolPanelModal {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container) {

    super(container, {
      title: 'Create new folder ...'
    })

    $(this.container).addClass('create-folder')

    this.inputId = ToolPanelModal.guid()

    this.bodyContent(`
      <div>
       <input id="${this.inputId}"
          type="text" class="folder-name-input"
          placeholder=" Folder name ...">
      </div>
    `)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  get folderName() {

    return $(`#${this.inputId}`).val()
  }
}






