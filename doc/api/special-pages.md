hatch-special-pages(3) - special pages API
========================================

## DESCRIPTION

Special page encapsulates some behavior for page: default URL, params, handler
and initial look (set of widgets and columns). Examples of special pages:
restore forgotten password page, account/profile page, search results.

Reason for using special pages is ability to provide some functionality bundled
together without any configuration. Since module registered special page
globally developer don't even need to activate module to activate special page.

## API

To define special page hatch offers API:

    hatch.page.register(name, descriptor);

All special pages located at `./app/pages/*.js` registered automatically.

### Special Page Descriptor: overview

Special page descriptor should export following data:

- defaultPath: string, relative page path, may include named params
- handler: function(env, cb), called before page rendering
- defaultPage: object, setting for default page look

### Special Page Descriptor: defaultPath, req.specialPageParams

To specify default path special page should respond to use `defaultPath` member.
Default path may contain named parameters, indicated by ':' symbol, for example
for profile special page default path will be `/profile/:username`. In that case
`username` is name of special page param, in handler this param will be
available as part of `req.specialPageParams` hash.

### Special Page Descriptor: handler

Handler is a function that will be called before page renderging with two
arguments: controller context and callback. Main purpose of that method -
prepare controller context before further processing, for example in case of
special page for password recovery we have to validate security token and load
user for reset password widget.

In handler `callback` param should be called once.

### Special Page Descriptor: defaultPage

Special page with default path should have `defaultPage` object describing how
page should look like. This object should contain all necessary data for
instantiating Page object, example of defaultPage object:

    exports.defaultPage = {
        title: 'Register',
        grid: '01-one-column',
        columns: [{size: 12, widgets: [1, 2]}, {size: 12, widgets: [3]}],
        widgets: [
            {id: 1, type: 'core-widgets/group-header'},
            {id: 2, type: 'core-widgets/mainmenu'},
            {id: 3, type: 'user/account', settings: { title: 'Registration'}}
        ]
    };

## CUSTOMIZATION

Special page could be customized in group by adding special page to group. It
allows to customize page URL and widgets/columns/layout of the page.

To create special page visit admin area, "Pages" section, and click a link on sidebar "New special page". Then select page type and enter URL, after that special page may be customize using edit console.
