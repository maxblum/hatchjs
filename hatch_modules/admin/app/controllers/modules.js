
var Application = require('./application');

module.exports = ModulesController;

function ModulesController(init) {
    Application.call(this, init);
}

require('util').inherits(ModulesController, Application);

ModulesController.prototype.index = function (c) {
    c.render();
};
