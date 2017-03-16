/////////////////////////////////////////////////////////////////////
// Viewing.Extension.A360View
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelModal from 'ToolPanelModal/ToolPanelModal'
import Dropdown from 'Dropdown/Dropdown'
import './RegionPanel.scss'

export default class RegionPanel extends ToolPanelModal {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container, region) {

    super(container, {
      title: 'Storage Region'
    })

    $(this.container).addClass('select-region')

    this.dropdownContainerId = ToolPanelModal.guid()

    this.imgId = ToolPanelModal.guid()

    this.region = region

    this.bodyContent(`
      <div>
        <div class="${this.getRegionClass(region)}"
          id="${this.imgId}">
        </div>
        <div class="region-dropdown"
          id="${this.dropdownContainerId}">
        </div>
      </div>
    `)

    this.dropdown = new Dropdown({
      container: '#' + this.dropdownContainerId,
      title: 'Region',
      prompt: 'Region',
      pos: {
        top: 0, left: 0
      },
      menuItems: [{
        class: 'img-eu',
        name: 'EMEA'
      }, {
        class: 'img-us',
        name: 'US'
      }]
    })

    this.dropdown.setCurrentItem({
      name: this.region
    })

    this.dropdown.on('item.selected', (item) => {

      $('#' + this.imgId).removeClass().addClass(item.class)

      this.region = item.name
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getRegionClass (region) {

    switch (region) {

      case 'EMEA':
        return 'img-eu'

      case 'US':
      default :
        return 'img-us'
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  get Region () {

    return this.region
  }
}






