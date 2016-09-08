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

	qcExt.app.directive('qcSearchQuery', ['$log', function($log) {
		return {
			restrict: 'E',
			// !replace: true,
			scope: {
				query: '=',
				type: '@',
				onDropped: '&'
			},
			controller: ['$scope', function($scope) {
				this.searchElements = [];
				
				Object.defineProperty(this, 'isEmpty', {
					get: function() {
						return this.searchElements.length === 0;
					}
				});
				
				var self = this;
				this.onDropped = function(dropData) {
					$log.debug('DropData', dropData);
					$log.debug('Search Query', $scope.query);
					$scope.query[dropData.dragData] = {};
					self.searchElements.push(dropData.dragData);
					$scope.onDropped({dropData: dropData});
				};
			}],
			controllerAs: 'sqvm',
			template: qcExt.variables.angularTemplates.searchQuery
		};
	}]);
})(qcExt || (qcExt = {}));

