exports.routes = function (map) {
    map.camelCaseHelperNames = true;

    map.root('pages#index');

    map.resources('groups', function (group) {
        group.resources('modules');
        group.resources('content', {as: 'content', suffix: 'entry'}, function (item) {
            item.collection(function (items) {
                items.get('streams', {as: 'groupContentStreams'});
                items.get('filter/:filter', '#index', {as: 'filteredGroupContent' });
                items.del('destroyAll', {as: 'destroySelectedGroupContent'});
                items.get('load');
            });
        });
        group.resources('tags', function (tag) {
            tag.get('count');
        });
        group.resources('streams');
        group.resources('users', {as: 'community', suffix: 'member'});
        group.resources('pages', function (page) {
            page.collection(function (pages) {
                pages.get('new-special', '#newSpecial', {as: 'newSpecial'});
                pages.get('new-special/:type', '#newSpecial', {as: 'newSpecialType'});
                pages.get('specials', {as: 'groupSpecialPages'});
                pages.get('renderTree', {as: 'renderTree'});
            });
            page.put('reorder.:format?', 'pages#updateOrder');
        });
    });

    map.post('/page/columns', 'page#updateColumns');

    map.resources('widgets', {path: 'widget'});
    map.get('/:controller/:action');

    map.post('/widget', 'widgets#create');
    map.all('/widget/:pageId/:widgetId/:action', 'widgets');

};
