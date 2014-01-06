(function () {
	$('#<%- widget.id %>.widget form').on('ajax:success', function (data) {
		// show noty
		$.noty({ text: '<i class="icon-ok"></i> Post successful', type: 'success' });

		// refresh all widgets on the page
		$('.widget').each(function (i, widget) {
			var $widget = $(widget);
			var id = $widget.data('id');

			widgetAction('render:' + id);
		});
	});
})();