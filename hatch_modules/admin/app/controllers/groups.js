
var Application = require('./application');

module.exports = GroupsController;

function GroupsController(init) {
    Application.call(this, init);
    init.before(function setup(c) {
        this.sectionName = 'group';
        c.next();
    });
}

require('util').inherits(GroupsController, Application);

GroupsController.prototype.show = function (c) {
    c.render();
};
