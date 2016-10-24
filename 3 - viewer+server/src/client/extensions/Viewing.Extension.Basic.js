///////////////////////////////////////////////////////////////////////////////
// Basic viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Viewing.Extension")

Viewing.Extension.Basic = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options)

    var _self = this

    _self.load = function () {

        alert('Viewing.Extension.Basic loaded')

        return true
    }

    _self.unload = function () {

        alert('Viewing.Extension.Basic unloaded')

        return true
    }
}

Viewing.Extension.Basic.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype)

Viewing.Extension.Basic.prototype.constructor =
    Viewing.Extension.Basic

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Viewing.Extension.Basic',
    Viewing.Extension.Basic)

