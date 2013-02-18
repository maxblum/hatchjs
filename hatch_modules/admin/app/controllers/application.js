var _ = require('underscore');

var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        var locals = this;
        this.pageName = c.actionName;
        this.sectionName = c.controllerName;
        this._ = _;
        this.req = c.req;
        this.group = c.req.group;
        this.tabs = [
            { name: 'community', url: 'groupCommunity', rank: 10 },
            { name: 'content',   url: 'groupContent',   rank: 20 },
            { name: 'pages',     url: 'groupPages',     rank: 30 },
            { name: 'group',     url: 'group',          rank: 40 },
            { name: 'modules',   url: 'groupModules',   rank: 50 }
        ];

        if (c.controllerName.match(/content|tags|streams/)) {
            console.log(typeof this.group.tags, this.group.tags.constructor.name);
            var tags = (c.req.group.tags || []).slice(0, 5);
            var filter = c.req.query.filter || c.req.params.filter;
            tags = _.filter(tags, function(tag) {
                return tag && tag.contentCount > 0;
            });
            if (typeof filter != 'undefined' && filter && !_.find(tags, function(t) {
                return t && t.id == filter;
            })) {
                tags.push(_.find(c.req.group.tags || [], function(t) {
                    return t && t.id == filter;
                }));
            }
            this.tags = tags;
        }

        var id = c.params.group_id || c.params.groupId || c.controllerName === 'groups' && c.params.id;
        if (id != c.req.group.id) {
            c.Group.find(id, function (err, group) {
                if (!err) {
                    return c.next(err);
                }
                group.parent = c.req.group;
                c.req.group = group;
                locals.group = group;
                c.next();
            });
        } else {
            c.next();
        }
    });
};
