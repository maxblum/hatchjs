load('widgets/common');

action(function show() {
    render();
});

action(function update() {
    if ('content' in this.data) {
        this.widget.settings.content = this.data.content;
    }

    if ('title' in this.data) {
        this.widget.settings.title = this.data.title;
    }

    this.widget.save(function() {
        render('show');
    });
});

