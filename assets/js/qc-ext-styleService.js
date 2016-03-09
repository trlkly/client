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

	qcExt.app.service('styleService', ['$log',
		function($log) {
			$log.debug('START styleService()');

			function addStyle(style) {
				$('head').append(
					$('<style type="text/css">' + style + '</style>'));
			}

			var customStyles = {};

			this.addCustomStyle = function(key, style) {
				if (this.hasStyle(key)) {
					return;
				}

				addStyle(style);
				customStyles[key] = style;
			};

			this.hasStyle = function(key) {
				return key in customStyles;
			};

			$log.debug('END styleService()');
		}]);
})(qcExt || (qcExt = {}));
