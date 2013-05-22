
var WidgetAPI = require('./widget.js');
var ImportStreamAPI = require('./importStream.js');
var HooksAPI = require('./hooks.js');
var NotificationAPI = require('./notification.js');
var PageAPI = require('./page.js');
var ErrorsAPI = require('./errors.js');
var ModelContextAPI = require('./modelContext.js');
var UploadAPI = require('./upload.js');
var ThemesAPI = require('./themes.js');
var CryptoAPI = require('./crypto.js');
var ContentTypeAPI = require('./contentType.js');
var PermissionsAPI = require('./permissions.js');
var SearchAPI = require('./search.js');
var ExportAPI = require('./export.js');

module.exports = function(hatch) {
    hatch.widget = new WidgetAPI(hatch);
    hatch.importStream = new ImportStreamAPI(hatch);
    hatch.hooks = new HooksAPI(hatch);
    hatch.notification = new NotificationAPI(hatch);
    hatch.page = new PageAPI(hatch);
    hatch.errors = new ErrorsAPI(hatch);
    hatch.modelContext = new ModelContextAPI(hatch);
    hatch.upload = new UploadAPI(hatch);
    hatch.themes = new ThemesAPI(hatch);
    hatch.crypto = new CryptoAPI(hatch);
    hatch.contentType = new ContentTypeAPI(hatch);
    hatch.permissions = new PermissionsAPI(hatch);
    hatch.search = new SearchAPI(hatch, 'reds');
    hatch.exportData = new ExportAPI(hatch);
};
