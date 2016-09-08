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

	qcExt.app.directive('qcSearchLogic', ['$log', function() {
		return {
			restrict: 'E',
			// !replace: true,
			scope: {
				query: '=',
				type: '@'
			},
			controller: ['$scope',
				function($scope) {
				$scope.query.operand = [{}];
				
				Object.defineProperty($scope.query, 'valid', {
					get: function() {
						return this.operand.length > 2;
					}
				});
				
				Object.defineProperty(this, 'isEmpty', {
					get: function() {
						return $scope.operand.length === 1;
					}
				});
				
				Object.defineProperty(this, 'operator', {
					get: function() {
						return $scope.type.toUpperCase();
					}
				});
				
				this.dropped = function() {
					$scope.query.operand.push({});
				};
			}],
			controllerAs: 'slvm',
			template: qcExt.variables.angularTemplates.searchLogic
		};
	}]);
})(qcExt || (qcExt = {}));

