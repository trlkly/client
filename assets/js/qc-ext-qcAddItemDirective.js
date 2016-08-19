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

	qcExt.app.directive('qcAddItem', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$http', '$scope', '$log', '$timeout', '$filter',
				'comicService', 'eventFactory',
				function($http, $scope, $log, $timeout, $filter,
					comicService, Event) {
					$log.debug('START qcAddItem()');

					var self = this;

					this.unique = Math.random().toString(36).slice(-5);

					var itemsChangedEvent =
						new Event(constants.itemsChangedEvent);

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

					var searchFieldId = '#addItem_' + this.unique + '_search';
					var dropdownId = '#addItem_' + this.unique + '_dropdown';
					var dropdownButtonId = '#addItem_' + this.unique +
						'_dropdownButton';
					this.items = [];

					var addCastTemplate = 'Add new cast member ';
					var addCastItem = {
						id: -1,
						type: 'cast',
						shortName: addCastTemplate + '\'\'',
						name: ''
					};
					var addStorylineTemplate = 'Add new storyline ';
					var addStorylineItem = {
						id: -1,
						type: 'storyline',
						shortName: addStorylineTemplate + '\'\'',
						name: ''
					};
					var addLocationTemplate = 'Add new location ';
					var addLocationItem = {
						id: -1,
						type: 'location',
						shortName: addLocationTemplate + '\'\'',
						name: ''
					};

					function loadItemData() {
						$http.get(constants.itemDataUrl)
							.then(function(response) {
								var itemData = response.data;

								itemData.push(addCastItem);
								itemData.push(addStorylineItem);
								itemData.push(addLocationItem);

								$scope.safeApply(function() {
									self.items = itemData;
								});
							});
					}
					loadItemData();
					
					function escapeRegExp(s) {
						return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					}

					this.searchChanged = function() {
						var filterText = self.itemFilterText;
						
						if (filterText.charAt(0) === '!') {
							filterText = filterText.substr(1);
						} else if (filterText.charAt(0) === '@') {
							filterText = filterText.substr(1);
						} else if (filterText.charAt(0) === '#') {
							filterText = filterText.substr(1);
						}
						
						addCastItem.shortName = addCastTemplate +
							'\'' + filterText + '\'';
						addCastItem.name = filterText;
						addStorylineItem.shortName = addStorylineTemplate +
							'\'' + filterText + '\'';
						addStorylineItem.name = filterText;
						addLocationItem.shortName = addLocationTemplate +
							'\'' + filterText + '\'';
						addLocationItem.name = filterText;
					};

					var triggeredFocus = false;
					var dropdownOpen = false;
					var firstRun = true;

					this.itemFilterText = '';
					this.itemFilter = function(value) {
						var filterText = self.itemFilterText;
						
						var result = true;
						if (filterText.charAt(0) === '!') {
							result = value.type === 'cast';
							filterText = filterText.substr(1);
						} else if (filterText.charAt(0) === '@') {
							result = value.type === 'location';
							filterText = filterText.substr(1);
						} else if (filterText.charAt(0) === '#') {
							result = value.type === 'storyline';
							filterText = filterText.substr(1);
						}
						
						var searchRegex = new RegExp(
							escapeRegExp(filterText), 'i');
						result = result &&
							value.shortName.match(searchRegex) !== null;
						
						return result;
					};
					// {shortName: ''};
					this.focusSearch = function() {
						$log.debug('qcAdditem(): #1 Search focused');
						if (firstRun) {
							$(dropdownId).on('shown.bs.dropdown', function() {
								dropdownOpen = true;
								$log.debug('qcAdditem(): #4 Dropdown opened');

								// Opening the dropdown makes the search field
								// lose focus. So set it again.
								$(searchFieldId).focus();
								triggeredFocus = false;

								$(dropdownId + ' .dropdown-menu').width($(
									dropdownId).width());
							});
							$(dropdownId).on('hidden.bs.dropdown', function() {
								$log.debug('qcAdditem(): #5 Dropdown closed');
								dropdownOpen = false;
							});

							firstRun = false;
						}

						if (!dropdownOpen && !triggeredFocus) {
							$log.debug(
								'qcAdditem(): #2 Focus was user-initiated');
							triggeredFocus = true;
							$timeout(function() {
								if (!dropdownOpen) {
									$log.debug(
										'qcAdditem(): #3 Toggle dropdown');
									$(dropdownButtonId).dropdown('toggle');
								}
							}, 150);
						}
					};

					this.keyPress = function(event) {
						if (event.keyCode === 13) {
							// ENTER key

							// Add the top item in the list
							var filteredList = $filter('filter')(self.items,
								self.itemFilter);
							var chosenItem = filteredList[0];
							self.addItem(chosenItem);
						}
					};

					/*#this.blurSearch = function() {
					 if (!intendedFocus) {
					 $log.debug('addItem(): blur!');
					 }
					 };*/

					this.addItem = function(item) {
						comicService.addItem(item).then(function(response) {
							if (response.status === 200) {
								itemsChangedEvent.notify();
								$scope.safeApply(function() {
									self.itemFilterText = '';
								});
							}
						});
					};

					itemsChangedEvent.subscribe($scope, function() {
						loadItemData();
					});

					$log.debug('END qcAddItem()');
				}],
			controllerAs: 'a',
			template: qcExt.variables.angularTemplates.addItem
		};
	});
})(qcExt || (qcExt = {}));
