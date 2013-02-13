var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        this.pageName = c.actionName;
        this.req = c.req;
        this.tabs = [
            { url: 'community', rank: 10 },
            { url: 'content',   rank: 20 },
            { url: 'pages',     rank: 30 },
            { url: 'group',     rank: 40 },
            { url: 'modules',   rank: 50 }
        ];
        c.next();
    });
};
