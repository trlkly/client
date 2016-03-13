/*
 * Copyright (C) 2016 Alexander Krivács Schrøder <alexschrod@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var qcExt;

(function(qcExt) {
	'use strict';

	qcExt.app.controller('bodyController', ['$log', '$scope', 'comicService',
		function($log, $scope, comicService) {
			$log.debug('START bodyController()');

			var isStupidFox =
				navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

			function previous() {
				$scope.$apply(function() {
					comicService.previous();
				});
			}

			function next() {
				$scope.$apply(function() {
					comicService.next();
				});
			}

			var shortcut =
			/* jshint evil:true */
				window.eval('window.shortcut');
			/* jshint evil:false */
			
			// Firefox balks at me trying to use the "shortcut" object from
			// my user script. Works just fine in Chrome. I can't be bothered
			// to cater to one browser's stupidity.
			if (isStupidFox) {
				var shortcutRemove =
				/* jshint evil:true */
					window.eval('window.shortcut.remove').bind(shortcut);
				/* jshint evil:false */
				shortcutRemove('Left');
				shortcutRemove('Right');
				
				// This is a sort of replacement for "shortcut". Only supports
				// simple Left/Right navigation. Is missing the editor mode
				// shortcuts because Firefox is shit.
				window.addEventListener('keydown', function(event) {
					if (event.keyCode === 37) {
						// LEFT
						previous();
					} else if (event.keyCode === 39) {
						// RIGHT
						next();
					}
				}, false);
			} else {
				// See how nice it can be done when your browser doesn't
				// actively try to sabotage you?
				shortcut.remove('Left');
				shortcut.remove('Right');
				
				// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
				shortcut.add('Left', previous,
					{disable_in_input: true});
				shortcut.add('Ctrl+Left', previous);

				shortcut.add('Right', next,
					{disable_in_input: true});
				shortcut.add('Ctrl+Right', next);

				shortcut.add('Q', function() {
					if (qcExt.settings.editMode) {
						$('input[id^="addItem"]').focus();
					}
				}, {disable_in_input: true});
				// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
			}
			$log.debug('END bodyController()');
		}]);
})(qcExt || (qcExt = {}));
