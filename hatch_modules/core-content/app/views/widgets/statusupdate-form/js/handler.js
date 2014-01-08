(function () {
	$('#<%- widget.id %>.widget form').on('ajax:success', function (data) {
		$.noty({ text: '<i class="fa fa-check"></i> Post successful', type: 'success' });

		// refresh all widgets on the page
		$('.widget').each(function (i, widget) {
			var $widget = $(widget);
			var id = $widget.data('id');

			// only refresh content-list widgets
			if ($widget.data('type') === 'core-content/content-list') {
				widgetAction('render:' + id);
			}
		});

		// clear the form text
		$('#<%- widget.id %>.widget form textarea').val('');
	});

	$('#<%- widget.id %>.widget form').on('ajax:error', function (xhr, res) {
		$.noty({ text: '<i class="fa fa-exclamation-triangle"></i> Please enter some text', type: 'error' });
	});
})();