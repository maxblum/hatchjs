exports.routes = function (map) {
    map.get('join', 'users#join');
    map.get('register', 'users#register');
    map.get('logout', 'session#logout');
    map.get('login', 'session#login');
    map.get('reset-password', 'users#resetPassword', {as: 'resetPassword'});
};
