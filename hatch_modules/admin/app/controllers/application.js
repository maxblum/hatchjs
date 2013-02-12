var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        this.pageName = c.actionName;
        this.req = c.req;
        this.tabs = [
            { name: 'Community', url: 'community', rank: 10 },
            { name: 'Content', url: 'content', rank: 20 },
            { name: 'Pages', url: 'pages', rank: 30 },
            { name: 'Settings', url: 'group', rank: 40 },
            { name: 'Modules', url: 'modules', rank: 50 }
        ]
        c.next();
    });
};
