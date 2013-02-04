var Application = module.exports = function Application(init) {

    init.before(function protectFromForgeryHook(ctl) {
        ctl.protectFromForgery('ecd33576b92a46ae567d317b4c2a60302577eb41');
    });

};
