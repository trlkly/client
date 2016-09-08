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

/* global constants */

var qcExt;

(function(qcExt) {
	'use strict';

	qcExt.app.directive('qcSearchItem', ['$log', function($log) {
		return {
			restrict: 'E',
			// !replace: true,
			scope: {
				query: '=',
				type: '@'
			},
			controller: ['$scope', '$http', '$timeout', '$filter',
				function($scope, $http, $timeout, $filter) {
				var self = this;
				this.unique = Math.random().toString(36).slice(-5);
				
				$scope.query.id = 0;
				Object.defineProperty($scope.query, 'valid', {
					get: function() {
						return this.id !== 0;
					}
				});
				
				this.searchElement = null;
				
				Object.defineProperty(this, 'isEmpty', {
					get: function() {
						return this.searchElement === null;
					}
				});
				
				Object.defineProperty(this, 'itemType', {
					get: function() {
						switch($scope.type) {
							case 'cast':
								return 'character';
							default:
								return $scope.type;
						}
					}
				});

				$scope.safeApply = function(fn) {
					var phase = this.$root.$$phase;
					if (phase === '$apply' || phase === '$digest') {
						if (fn && typeof fn === 'function') {
							fn();
						}
					} else {
						this.$apply(fn);
					}
				};

				var searchFieldId = '#searchItem_' + this.unique +
					'_search';
				var dropdownId = '#searchItem_' + this.unique +
					'_dropdown';
				var dropdownButtonId = '#searchItem_' + this.unique +
					'_dropdownButton';
				this.items = [];

				function loadItemData() {
					var urlParameters = {
						types: $scope.type
					};
					var urlQuery = $.param(urlParameters);
					$http.get(constants.itemDataUrl + '?' + urlQuery)
						.then(function(response) {
							var itemData = response.data;

							$scope.safeApply(function() {
								self.items = itemData;
							});
						});
				}
				loadItemData();

				var triggeredFocus = false;
				var dropdownOpen = false;
				var firstRun = true;

				this.itemFilter = {name: ''};
				
				this.focusSearch = function() {
					$log.debug('searchItem(): #1 Search focused', dropdownOpen,
					firstRun);
					if (firstRun) {
						$(dropdownId).on('shown.bs.dropdown', function() {
							dropdownOpen = true;
							$log.debug('searchItem(): #4 Dropdown opened');

							// Opening the dropdown makes the search field
							// lose focus. So set it again.
							$(searchFieldId).focus();
							triggeredFocus = false;

							$(dropdownId + ' .dropdown-menu').width($(
								dropdownId).width());
						});
						$(dropdownId).on('hidden.bs.dropdown', function() {
							$log.debug('searchItem(): #5 Dropdown closed');
							dropdownOpen = false;
						});

						firstRun = false;
					}

					if (!dropdownOpen && !triggeredFocus) {
						$log.debug(
							'searchItem(): #2 Focus was user-initiated');
						triggeredFocus = true;
						$timeout(function() {
							if (!dropdownOpen) {
								$log.debug(
									'searchItem(): #3 Toggle dropdown');
								$(dropdownButtonId).dropdown('toggle');
							}
						}, 150);
					}
				};

				this.keyPress = function(event) {
					if (event.keyCode === 13) {
						// ENTER key

						// Set our desired character to the top one
						var filteredList = $filter('filter')(self.items,
							self.itemFilter);
						if (filteredList.length === 0) {
							return;
						}
						$(dropdownButtonId).dropdown('toggle');
						var chosenItem = filteredList[0];
						self.selectItem(chosenItem);
					}
				};
				
				this.selectItem = function(item) {
					$timeout(function() {
						self.searchElement = item;
						$scope.query.id = item.id;
						self.itemFilter.name = '';
					}, 150);
				};
				
				this.resetItem = function() {
					self.searchElement = null;
					$scope.query.id = 0;
				};
			}],
			controllerAs: 'scvm',
			template: qcExt.variables.angularTemplates.searchItem
		};
	}]);
})(qcExt || (qcExt = {}));

