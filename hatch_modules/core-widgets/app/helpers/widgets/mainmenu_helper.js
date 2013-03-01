var _ = require('underscore');

/**
 * Breadcrumb generates the breadcrumb for the specified page, relys on 
 * req.group.pagesCache
 *
 * @param {Page} current page
 */
exports.breadcrumb = function(current) {
    var pages = [];
    var allPages = this.locals.group.pagesCache.filter(function (p) {
        return p && p.id && p.url;
    });
    var prev = null;
    var parents = null;

    var topLevelParent = null;

    // loop through all of the pages to build the breadcrumb
    allPages.forEach(function(page) {
        if(page.level <= 1 && isParentOf(page)) topLevelParent = page;

        if(
            //(page.level >= 2 && isParentOf(page)) ||
            isParentOf(page) ||
            (page.level >= 2 && (page.parentId == current.id || page.parentId == current.parentId))) {

            page.selected = current.id == page.id;
            pages.push(page);

            //determine the correct separator to use in the navigation
            if(prev != null) {
                prev.separator = "separator";
                if (prev.level < page.level) {
                    prev.separator = "chevron-right";
                } else if (prev.level > page.level) {
                    prev.separator = "chevron-left";
                }
            }
            prev = page;
        }
    });

    if (topLevelParent) {
        topLevelParent.isActive = true;
    }

    // don't show breadcrumb if we don't have any pages at level 2 or higher
    if (!_.find(pages, function(page) { return page.level >= 2; })) {
        return [];
    } else {
        return pages;
    }

    // function to test if a page is a parent of the current page
    function isParentOf(parent) {
        // cache the parent list
        if (parents == null) {
            parents = [];
            var node = current;
            while(node != null) {
                parents.push(node);
                node = _.find(allPages, function(page) {
                    return page.id == node.parentId;
                });
            }
        }

        // parent equality check
        return _.find(parents, function(page) {
            return page && parent && page.id == parent.id;
        })
    }

};
