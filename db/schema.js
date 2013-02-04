
var Group = define('Group', function () {
    property('url', String, {index: true});
});

var User = define('User', function () {
    property('username', String,   { index: true, sort: true });
    property('email', String, { index: true });
    property('type', String, { index: true });
    property('password', String);
    property('hasPassword', Boolean);
    property('avatar', String);
    property('name', String);
    property('firstname', String);
    property('lastname', { sort: true });
    property('lastnameLetter', String, { index: true });
    property('displayName', String, { sort: true });
    property('oneLiner', String);
    property('membership', JSON);
    property('customListIds', JSON, { index: true });
    property('ifollow', JSON); // array of ids of user who followed by user
    property('otherFields', JSON);
    property('mailSettings', JSON);
    property('fulltext', String);

    set('safe', true);
});

User.schema.adapter.defineFulltextIndex('User', 'fulltext');

var Group = define('Group', function () {
    property('name',  { fulltext: true, sort: true });
    property('pagesCache', JSON);
    property('homepage', JSON);
    property('modules', JSON);
    property('joinPermissions', String);
    property('favicon', String);
    property('metaKeywords', String);
    property('metaDescription', String);
    property('navBarType', String);
    property('navBarStyle', String);
    property('hideSearch', Boolean);
    property('headerHtml', String);
    property('footerHtml', String);
    property('cssVersion', String);
    property('googleAnalyticsId', String);
    property('customProfileFields', JSON);
    property('memberLists', JSON);
    property('tags', JSON);
    property('importStreams', JSON);
});

var Stylesheet = define('Stylesheet', function () {
    property('groupId', Number, { index: true });
    property('css', String);
    property('version', Number);
    property('lastUpdate', Date);
    property('less', JSON);
});

var Page = define('Page', {
    property('title', String, { fulltext: true });
    property('url', String, { index: true });
    property('customUrl', Boolean);
    property('grid', String);
    property('columns', JSON); // JSON [ {size: 6, widgets: [1,2,3]}, {size: 6, widgets: [4,5,6]}]
    property('widgets', [WidgetInstance]);
    property('metaTitle', String);
    property('metaDescription', String);
    property('metaKeywords', String);
    property('type', {type: String, index: true});
    property('tags', String);
    property('hideFromNavigation', Boolean);
    property('order', Number);
    property('templateId', Number);
    property('parentId', {type: Number, index: true});
    property('groupId', Number, {index: true});
});

var Content = define('Content', {
    property('type', { type: String, index: true });
    property('imported', { type: Boolean, index: true });
    property('title', { type: String, index: true });
    property('text', String);
    property('excerpt', String);
    property('previewImage', String);
    property('attachment', JSON);
    property('poll', JSON);
    property('location', JSON);
    property('comments', { type: [], fulltext: true });
    property('repliesTotal', { type: Number, index: true, sort: true });
    property('likes', []);
    property('dislikes', []);
    property('likesTotal', Number, {index: true, sort: true });
    property('views', Number, {index: true, sort: true });
    property('score', Number, {index: true, sort: true });
    property('groupId', Number, {index: true });
    property('replyToId', Number, {index: true });
    property('tags', JSON);
    property('tagString', String, {index: true });
    property('authorId', Number, {index: true });
    property('privacy', String, {index: true });
    property('createdAt', Date, {index: true, sort: true });
    property('updatedAt', Date, {index: true });
    property('timestamp', Number, {index: true, sort: true });
    property('priority', Number, {index: true, sort: true });
    property('url', String, {index: true });
    property('fulltext', String);
    property('importData', JSON);
});

Content.schema.adapter.defineFulltextIndex('Content', 'fulltext');

var ContentFeedItem = define('ContentFeedItem', function () {
    property('userId', Number, {index: true });
    property('contentId',  Number ),
    property('createdAt', Date, {index: true} );
});

var Media = define('Media', function () {
    property('type', String, {index: true});
    property('userId', Number, {index: true});
    property('createdAt', Date, {index: true, sort: true});
    property('url', String);
});

var Notification = define('Notification', function () {
    property('userId', Number, {index: true});
    property('createdAt', Date, {index: true, sort: true});
    property('isRead', Boolean, {index: true});
    property('isActioned', Boolean);
    property('url', String);
    property('html', String);
});

var ImportStream = define('ImportStream', {
    property('groupId', Number, {index: true});
    property('type', String, {index: true});
    property('title', String);
    property('query', String);
    property('source', String);
    property('tags', []);
    property('interval', Number);
    property('enabled', Boolean, {index: true});
    property('lastRun', Date);
});

