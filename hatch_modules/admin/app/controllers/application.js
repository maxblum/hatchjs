var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        this.pageName = c.actionName;
        this.req = c.req;
        this.tabs = [
            { name: 'community', url: 'group_community', rank: 10 },
            { name: 'content',   url: 'group_content',   rank: 20 },
            { name: 'pages',     url: 'group_pages',     rank: 30 },
            { name: 'groups',    url: 'groups',          rank: 40 },
            { name: 'modules',   url: 'group_modules',   rank: 50 }
        ];
        c.next();
    });
};
