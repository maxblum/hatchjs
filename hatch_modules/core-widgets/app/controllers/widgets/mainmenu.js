var Widget = require(process.env.HATCH_WIDGETCONTROLLERPATH);

function MainMenuController(init) {
    Widget.call(this, init);
}

module.exports = MainMenuController;
require('util').inherits(MainMenuController, Widget);