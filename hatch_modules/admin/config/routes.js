exports.routes = function (map) {
    map.root('pages#index');
    map.get('/pages/new-special/:type', 'pages#new', {as: 'newSpecial'});

    map.resources('widgets', {path: 'widget'});
    map.get('/:controller/:action');

    map.post('/widget', 'widgets#create');

};
