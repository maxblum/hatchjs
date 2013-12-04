(function () {
	'use strict';

	/**
	 * Instantiate a new edit console.
	 */
	function EditConsoleController () {

	}

	/**
	 * Toggle the visibility of the edit console.
	 * 
	 * @param  {Boolean} show - force show
	 */
	EditConsoleController.prototype.toggle = function(show) {
        if (typeof show === 'undefined') {
            show = !$('.edit-console').is(':visible');
        }

        //set the cookie
        $.cookie('edit-console-visible', show, { path : '/' });

        if (show) {
            this.show();
        } else {
            this.hide();
        }
    };

    /**
     * Hide the edit console.
     */
    EditConsoleController.prototype.hide = function () {
        $('#edit-page-link i.fa-eye').show();
        $('#edit-page-link i.fa-eye-slash').hide();

        //set the cookie
        $.cookie('edit-console-visible', null, { path : '/' });

        $('.edit-console').fadeOut();
    };

    /**
     * Show the edit console.
     */
    EditConsoleController.prototype.show = function() {
    	var self = this;

        $('#edit-page-link i.fa-eye-slash').show();
        $('#edit-page-link i.fa-eye').hide();

        if ($('#editConsole').length === 0) {
            $('#editConsoleHolder').load(pathTo('admin/page/editconsole'), function() {
                $('.edit-console').fadeIn();

                //set the position
                self.position();

                //allow widget dragging
                $('#edit-console-widgets li span.widget').draggable({
                    appendTo: 'body',
                    helper: function(event) {
                        return $('<div class="drag-helper">' + $(this).html() + '</div>');
                    },
                    connectToSortable: '.widget-list.editable',
                    stop: function(event, ui) {
                    	var widget = $('a', this).attr('href').replace('#', '');
                        var $placeholder = $('.widget-list .widget.ui-draggable');

                        var row = $placeholder.index();
                        var col = $placeholder.parent().attr('id');

                        //if we don't have a column, give up
                        if (!col) {
                            return;
                        }

                        col = col.replace('col-', '');

                        //remove the placeholder
                        $placeholder.remove();

                        //add the new widget
                        createWidget(widget, col, row);
                    }
                });

                //initialise style editor
                var styleeditor = new StyleEditorController();
                styleeditor.init();

                //attach events
                $('.edit-console .close').bind('click', self.hide);
                $('.edit-console').draggable({
                    handle: 'div.console-header',
                    stop: function() {
                        $.cookie('edit-console-xy', JSON.stringify($('.edit-console').position()), { path : '/' });
                    }
                });
                $('#column-layout-choices input').bind('click', function() {
                    $('#templates-layouts, #columns-layouts').hide();
                    $('#' + this.value + '-layouts').show();
                });
            });
        }
        else {
            $('#editConsole').fadeIn();
            self.position();

            //reload the layouts tab
            $('#edit-console-layouts').load(pathTo('admin/page/editconsole?tab=layouts'));
        }
    };

    /**
     * Position the edit console using the value stored in the edit-console-xy cookie.
     */
    EditConsoleController.prototype.position = function() {
        //position the edit console
        var editConsolePosition = $.cookie('edit-console-xy');
        if (editConsolePosition) {
            editConsolePosition = JSON.parse(editConsolePosition);

            //make sure the position is within the bounds of the window
            if (editConsolePosition.left + $('.edit-console').outerWidth() > $(window).width()) {
                editConsolePosition.left = Math.max(0, $(window).width() - $('.edit-console').outerWidth());
            }

            if (editConsolePosition.top + $('.edit-console').outerHeight() > $(window).height()) {
                editConsolePosition.top = Math.max(0, $(window).height() - $('.edit-console').outerHeight());
            }

            $('.edit-console').css({left: editConsolePosition.left + 'px', top: editConsolePosition.top + 'px'});
        }
    };

    // EXPORTS
    window.EditConsoleController = EditConsoleController;
})();