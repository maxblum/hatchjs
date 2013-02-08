load('application');

before(loadPosts, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('new', function () {
    this.title = 'New posts';
    this.posts = new Posts;
    render();
});

action(function create() {
    Posts.create(req.body.Posts, function (err, posts) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: posts && posts.errors || err});
                } else {
                    send({code: 200, data: posts.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Posts can not be created');
                    render('new', {
                        posts: posts,
                        title: 'New posts'
                    });
                } else {
                    flash('info', 'Posts created');
                    redirect(path_to.posts);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Postss index';
    Posts.all(function (err, posts) {
        switch (params.format) {
            case "json":
                send({code: 200, data: posts});
                break;
            default:
                render({
                    posts: posts
                });
        }
    });
});

action(function show() {
    this.title = 'Posts show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.posts});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Posts edit';
    switch(params.format) {
        case "json":
            send(this.posts);
            break;
        default:
            render();
    }
});

action(function update() {
    var posts = this.posts;
    this.title = 'Edit posts details';
    this.posts.updateAttributes(body.Posts, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: posts && posts.errors || err});
                } else {
                    send({code: 200, data: posts});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Posts updated');
                    redirect(path_to.posts(posts));
                } else {
                    flash('error', 'Posts can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.posts.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy posts');
                } else {
                    flash('info', 'Posts successfully removed');
                }
                send("'" + path_to.posts + "'");
            });
        });
    });
});

function loadPosts() {
    Posts.find(params.id, function (err, posts) {
        if (err || !posts) {
            if (!err && !posts && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.posts);
        } else {
            this.posts = posts;
            next();
        }
    }.bind(this));
}
