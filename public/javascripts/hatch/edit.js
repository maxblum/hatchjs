EditController = function (options) {
	this.options = $.extend(EditController.defaultOptions, options);
	this.widgets = [];
	this.columns = [];
};

EditController.defaultOptions = {
	columns: 12,
	classes: {
		widget: 'widget',
		widgetList: 'widget-list',
		column: 'column',
		resizer: 'resizer'
	}
};

EditController.prototype.init = function () {
	//TODO: setup widget edit links
};

EditController.prototype.showEditConsole = function () {

};

EditController.prototype.showWidgetSettings = function (widget) {

};

EditController.prototype.saveWidgetSettings = function (widget, settings) {

};

EditController.prototype.inlineEdit = function (widget) {

};

EditController.prototype.refreshWidget = function (widget) {

};

EditController.prototype.addWidget = function (widget, position) {

};

EditController.prototype.removeWidget = function (widget) {

};

EditController.prototype.toggleWidgetContrast = function (widget) {

};

EditController.prototype.setLayout = function (layout) {

};

EditController.prototype.saveColumns = function (columns) {

};