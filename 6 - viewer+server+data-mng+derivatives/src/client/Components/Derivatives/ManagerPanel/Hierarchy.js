import { BaseTreeDelegate, TreeNode } from 'TreeView'
import EventsEmitter from 'EventsEmitter'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export class HierarchyTreeDelegate
  extends EventsEmitter.Composer (BaseTreeDelegate) {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (hierarchy, properties) {

    super()

    this.properties = properties

    this.hierarchy = hierarchy
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parent, options = {}) {

    node.type.split('.').forEach((cls) => {

      parent.classList.add(cls)
    })

    var label = document.createElement('label');

    parent.appendChild(label);

    var text = this.getTreeNodeLabel(node);

    if (options && options.localize) {

      label.setAttribute('data-i18n', text);
      text = Autodesk.Viewing.i18n.translate(text);
    }

    label.textContent = text;

    node.expand = () => {
      $(parent).parent().removeClass('collapsed')
      $(parent).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parent).parent().removeClass('expanded')
      $(parent).parent().addClass('collapsed')
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild(node, addChildCallback) {

    switch (node.type) {

      case 'hierarchy.root':

        this.hierarchy.objects.forEach((obj) => {

          var objectNode = {
            objects: obj.objects,
            id: obj.objectid,
            type: 'objects',
            name: obj.name,
            group: true
          }

          addChildCallback(objectNode)
        })

        break

      case 'objects':

        if (node.objects) {

          node.objects.forEach((obj) => {

            var objectNode = {
              properties: this.getNodeProperties(obj.objectid),
              objects: obj.objects,
              id: obj.objectid,
              type: 'objects',
              name: obj.name,
              group: true
            }

            if (!obj.objects) {

              objectNode.type += '.leaf'
            }

            addChildCallback(objectNode)

            objectNode.collapse()
          })
        }

        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getNodeProperties (nodeId) {

    var nodeProperties = []

    this.properties.forEach((entry) => {

      if (entry.objectid === nodeId) {

        for(var key in entry.properties) {

          var propertyValue = entry.properties[key]

          propertyValue = Array.isArray(propertyValue) ?
            propertyValue[0] :
            propertyValue

          if(typeof propertyValue === 'object') {

            for(var subKey in propertyValue) {

              var subPropertyValue = propertyValue[subKey]

              subPropertyValue = Array.isArray(subPropertyValue) ?
                subPropertyValue[0] :
                subPropertyValue

              nodeProperties.push({
                displayValue: subPropertyValue,
                displayCategory: key,
                displayName: subKey,
                units: null,
                hidden: 0,
                type: 20
              })
            }

          } else {

            nodeProperties.push({
              displayValue: propertyValue,
              displayCategory: "Other",
              displayName: key,
              units: null,
              hidden: 0,
              type: 20
            })
          }
        }
      }
    })

    nodeProperties.push({
      displayCategory: 'Derivatives',
      displayName: 'Node Id',
      displayValue: nodeId,
      units: null,
      hidden: 0,
      type: 20
    })

    return nodeProperties
  }
}