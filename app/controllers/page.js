var Application = require('./application');

module.exports = PageController;

function PageController(init) {
    Application.call(this, init);
}

require('util').inherits(PageController, Application);

PageController.prototype.show = function (c) {
    return c.next();
    //c.send('page');
};
