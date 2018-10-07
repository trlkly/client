// Found at: https://gist.github.com/etienned/2934516
/*! License unknown */
(function($) {
	'use strict';

	$.fn.changeElementType = function(newType) {
		var newElements = [];
		this.each(function() {
			var attrs = {};
			$.each(this.attributes, function(idx, attr) {
				attrs[attr.nodeName] = attr.nodeValue;
			});
			$(this).replaceWith(function() {
				var newElement = $('<' + newType + '/>', attrs);
				newElements.push(newElement.get()[0]);
				return newElement.append($(this).contents());
			});
		});
		return $(newElements);
	};
})(jQuery);
