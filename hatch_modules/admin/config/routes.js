exports.routes = function (map) {
    map.root('pages#index');
    map.resources('pages', function (pages) {
        pages.get('new-special', 'pages#newSpecial', {
            collection: true, as: 'newSpecial'
        });
        pages.get('new-special/:type', 'pages#newSpecial', {
            collection: true, as: 'newSpecialType'
        });
        pages.get('specials', 'pages#specials', {
            collection: true, as: 'specialPages'
        });
        pages.get('renderTree', 'pages#renderTree', {
            collection: true, as: 'renderTree'
        });
    });

    map.get('/pages/new-special/:type', 'pages#new', {as: 'newSpecial'});

    map.post('/page/columns', 'page#updateColumns');

    map.resources('widgets', {path: 'widget'});
    map.get('/:controller/:action');

    map.post('/widget', 'widgets#create');
    map.all('/widget/:pageId/:widgetId/:action', 'widgets');

};
