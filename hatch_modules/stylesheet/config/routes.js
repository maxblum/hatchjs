exports.routes = function (map) {
    map.get('/css/:version', 'stylesheet#show', {as: 'css'});
};
