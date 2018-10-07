/*
 * Copyright (C) 2016-2018 Alexander Krivács Schrøder <alexschrod@gmail.com>
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

export default function (app) {
	app.service('styleService', ['$log', 'colorService',
		function ($log, colorService) {
			$log.debug('START styleService()');

			function addStyle(style) {
				var styleElement =
					$('<style type="text/css">' + style + '</style>');
				$('head').append(styleElement);
				return styleElement;
			}

			var customStyles = {};
			var customStyleElements = {};

			this.addCustomStyle = function (key, style) {
				if (this.hasCustomStyle(key)) {
					return;
				}

				var styleElement = addStyle(style);
				customStyles[key] = style;
				customStyleElements[key] = styleElement;
			};

			this.removeCustomStyle = function (key) {
				delete customStyles[key];
				customStyleElements[key].remove();
				delete customStyleElements[key];
			};

			this.hasCustomStyle = function (key) {
				return key in customStyles;
			};

			this.addItemStyle = function (id, color) {
				var itemId = 'item_' + id;
				if (!this.hasCustomStyle(itemId)) {
					var qcNavItem = '#qcnav_item_' + id + ' > table';
					var qcNavItemWithColor = qcNavItem + '.with_color';

					var backgroundColor = color;
					var foregroundColor = colorService.createTintOrShade(color);
					var hoverFocusColor = colorService
						.createTintOrShade(color, 2);

					var itemStyle =
						qcNavItemWithColor + '{' +
						'background-color:' + backgroundColor + ';' +
						'}' +
						qcNavItemWithColor + ',' +
						qcNavItemWithColor + ' a.qcnav_name_link,' +
						qcNavItemWithColor + ' a:link,' +
						qcNavItemWithColor + ' a:visited{' +
						'color:' + foregroundColor + ';' +
						'}' +
						qcNavItem + ' a.qcnav_name_link{' +
						'cursor: pointer;' +
						'text-decoration: none;' +
						'}' +
						qcNavItemWithColor + ' a:hover,' +
						qcNavItemWithColor + ' a:focus{' +
						'color: ' + hoverFocusColor + ';' +
						'}';

					this.addCustomStyle(itemId, itemStyle);
				}
			};

			this.removeItemStyle = function (id) {
				var itemId = 'item_' + id;
				if (this.hasCustomStyle(itemId)) {
					this.removeCustomStyle(itemId);
				}
			};

			this.hasItemStyle = function (id) {
				var itemId = 'item_' + id;
				return this.hasCustomStyle(itemId);
			};

			$log.debug('END styleService()');
		}]);
}
