exports.routes = function (map) {
    map.root('pages#index');

    map.resources('groups', function (g) {
        g.resources('modules');
        g.resources('content', {as: 'content', suffix: 'entry'}, function (c) {
            c.get('streams', 'content#streams', {
                collection: true, as: 'groupContentStreams'
            });
        });
        g.resources('users', {as: 'community', suffix: 'member'});
        g.resources('pages', function (pages) {
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
            pages.put('reorder.:format?', 'pages#updateOrder');
        });
    });

    map.post('/page/columns', 'page#updateColumns');

    map.resources('widgets', {path: 'widget'});
    map.get('/:controller/:action');

    map.post('/widget', 'widgets#create');
    map.all('/widget/:pageId/:widgetId/:action', 'widgets');

};
