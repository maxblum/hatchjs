var Application = module.exports = function Application(init) {
    init.before(function initApp(c) {
        this.pageName = c.actionName;
        this.req = c.req;
        c.next();
    });
};
