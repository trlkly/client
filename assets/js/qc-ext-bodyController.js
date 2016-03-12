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

/* global unsafeWindow */

var qcExt;

(function(qcExt) {
	'use strict';

	qcExt.app.controller('bodyController', ['$log', '$scope', 'comicService',
		function($log, $scope, comicService) {
			$log.debug('START bodyController()');

			unsafeWindow.shortcut.remove('Left');
			unsafeWindow.shortcut.remove('Right');

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

			// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
			unsafeWindow.shortcut.add('Left', previous,
				{disable_in_input: true});
			unsafeWindow.shortcut.add('Ctrl+Left', previous);

			unsafeWindow.shortcut.add('Right', next, {disable_in_input: true});
			unsafeWindow.shortcut.add('Ctrl+Right', next);

			unsafeWindow.shortcut.add('Q', function() {
				if (qcExt.settings.editMode) {
					$('input[id^="addItem"]').focus();
				}
			}, {disable_in_input: true});
			// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

			$log.debug('END bodyController()');
		}]);
})(qcExt || (qcExt = {}));
