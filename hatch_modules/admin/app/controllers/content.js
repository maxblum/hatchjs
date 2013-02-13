var Application = require('./application');

module.exports = ContentController;

function ContentController(init) {
    Application.call(this, init);
}

require('util').inherits(ContentController, Application);

ContentController.prototype.index = function (c) {
    c.render();
};
