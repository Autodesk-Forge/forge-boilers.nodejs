/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelModal from 'ToolPanelModal/ToolPanelModal'
import Dropdown from 'Dropdown/Dropdown'
import './CreateBucketPanel.scss'

export default class CreateBucketPanel extends ToolPanelModal {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container) {

    super(container, {
      title: 'Bucket Settings'
    })

    $(this.container).addClass('create-bucket')

    this.dropdownContainerId = ToolPanelModal.guid()

    this.inputId = ToolPanelModal.guid()

    this.bucketKey = 'forge-' + ToolPanelModal.guid(
      'xxxx-xxxx-xxxx')

    this.bodyContent(`
      <div>
        <input id="${this.inputId}" type="text" class="bucket-key"
          placeholder=" Bucket Key (${this.bucketKey}) ...">
        <div id="${this.dropdownContainerId}">
        </div>
      </div>
    `)

    this.dropdown = new Dropdown({
      container: '#' + this.dropdownContainerId,
      title: 'Bucket Policy',
      prompt: 'Bucket Policy',
      pos: {
        top: 0, left: 0
      },
      menuItems: [{
        name: 'Transient'
      }, {
        name: 'Temporary'
      }, {
        name: 'Persistent'
      }]
    })

    this.dropdown.setCurrentItem({
      name: 'Transient'
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  get PolicyKey() {

    return this.dropdown.currentItem.name
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  get BucketKey() {

    var $bucketKey = $(`#${this.inputId}`)

    return $bucketKey.val().length ?
      $bucketKey.val() :
      this.bucketKey
  }
}






