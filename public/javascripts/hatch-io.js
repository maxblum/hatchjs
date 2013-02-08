
var HatchIO = (function () {
    var socket, subscriptions = [], hio;

    hio = {
        subscribe: subscribe,
        send: send
    };

    return hio;

    function subscribe(event, handler) {
        if (!socket) connect();
        socket.on(event, handler);
        return hio;
    }

    function send(message, data) {
        if (!socket) connect();
        socket.emit('broadcast', {
            message: message,
            data: data
        });
        return hio;
    }

    function connect(callback, params) {
        var g = $('meta[name="groupid"]').attr('content');
        socket = io.connect(location.href.split('/').slice(0,3).join('/'));
        socket.on('wru', function (fn) {
            fn(g);
        });
    }

})();
