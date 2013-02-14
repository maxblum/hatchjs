var _ = require('underscore');

var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        this.pageName = c.actionName;
        this.sectionName = c.controllerName;
        this._ = _;
        this.req = c.req;
        this.tabs = [
            { name: 'community', url: 'groupCommunity', rank: 10 },
            { name: 'content',   url: 'groupContent',   rank: 20 },
            { name: 'pages',     url: 'groupPages',     rank: 30 },
            { name: 'group',     url: 'group',           rank: 40 },
            { name: 'modules',   url: 'groupModules',   rank: 50 }
        ];
        var id = c.params.group_id || c.controllerName === 'groups' && c.params.id;
        if (id != c.req.group.id) {
            c.Group.find(id, function (err, group) {
                if (!err) {
                    return c.next(err);
                }
                group.parent = c.req.group;
                c.req.group = group;
                c.next();
            });
        } else {
            c.next();
        }
    });
};
