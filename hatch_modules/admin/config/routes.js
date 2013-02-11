exports.routes = function (map) {
    map.root('pages#index');
    map.get('/pages/new-special/:type', 'pages#new', {as: 'newSpecial'});

    map.post('/page/columns', 'page#updateColumns');

    map.resources('widgets', {path: 'widget'});
    map.get('/:controller/:action');

    map.post('/widget', 'widgets#create');

    map.namespace('widgets', function (widgets) {
        widgets.all(':controller/:action');
    });

};
