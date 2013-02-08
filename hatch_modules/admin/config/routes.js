exports.routes = function (map) {
    map.resources('posts');
    map.root('/', 'pages#index');
    map.get('/pages/new-special/:type', 'pages#new', {as: 'newSpecial'});

    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    map.all(':controller/:action');
    map.all(':controller/:action/:id');
};
