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

	qcExt.app.directive('qcItemDetails', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$log', '$http', '$scope', 'colorService',
				'comicService', 'messageReportingService', 'styleService',
				function($log, $http, $scope, colorService,
					comicService, messageReportingService, styleService) {
					var self = this;

					this.isLoading = true;
					this.settings = qcExt.settings;

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
					
					function getItemDetails() {
						var itemId = $('#itemDetailsDialog').data('itemId');
						$log.debug('qcItemDetails::showModal() - item id:',
							itemId);
							
						function handleRelationData(response) {
							if (response.status === 200) {
								var relationData = response.data;
								
								$.each(relationData, function(_, relation) {
									relation.percentage = relation.count /
										self.itemData.appearances * 100;
								});
								
								return relationData;
							}
							return null;
						}
							
						function handleItemFriendsData(response) {
							var friends = handleRelationData(response);
							if (friends === null) {
								friends = [];
							}
							$scope.safeApply(function() {
								self.itemData.friends = friends;
							});
						}
							
						function handleItemLocationsData(response) {
							var locations = handleRelationData(response);
							if (locations === null) {
								locations = [];
							}
							$scope.safeApply(function() {
								self.itemData.locations = locations;
							});
						}

						function handleItemData(response) {
							if (response.status === 200) {
								var itemData = response.data;

								itemData.highlightColor = colorService
									.createTintOrShade(itemData.color);

								if (itemData.hasImage) {
									itemData.imagePath =
										constants.characterImageBaseUrl +
										itemData.id + '.' +
										constants.characterImageExtension;
								}

								$log.debug('qcItemDetails::showModal() - ' +
									'item data:', itemData);

								// If the color changes, also update the
								// highlight color
								$scope.safeApply(function() {
									self.itemData = itemData;
									self.isLoading = false;

									$scope.$watch(function() {
										return self.itemData.color;
									}, function() {
										itemData.highlightColor =
											colorService
											.createTintOrShade(
												itemData.color);
									});
								});

								$http.get(constants.itemFriendDataUrl + itemId)
									.then(handleItemFriendsData);
								$http.get(constants.itemLocationDataUrl +
									itemId).then(handleItemLocationsData);
							} else {
								messageReportingService.reportError(
									response.data);
							}
						}

						self.itemData = {};
						self.isLoading = true;
						$http.get(constants.itemDataUrl + itemId)
							.then(handleItemData);
					}

					$('#itemDetailsDialog').on('show.bs.modal', getItemDetails);
					
					this.showInfoFor = function(id) {
						$('#itemDetailsDialog').data('itemId', id);
						getItemDetails();
					};

					this.keypress = function(event, property) {
						if (event.keyCode === 13) {
							// ENTER key
							self.update(property);
						}
					};

					function onErrorLog(response) {
						messageReportingService.reportError(response.data);
						return response;
					}

					function onSuccessRefreshElseErrorLog(response) {
						if (response.status === 200) {
							comicService.refreshComicData();
						} else {
							onErrorLog(response);
						}
						return response;
					}

					this.update = function(property) {
						function updateItemColor(response) {
							if (response.status === 200) {
								if (property === 'color') {
									$log.debug('qcItemDetails::update() - ' +
									'update item color');
									styleService.removeItemStyle(
										self.itemData.id);
								}
							}
							return onSuccessRefreshElseErrorLog(response);
						}
						
						var data = {
							token: qcExt.settings.editModeToken,
							item: self.itemData.id,
							property: property,
							value: self.itemData[property]
						};
						$http.post(constants.setItemDataPropertyUrl, data)
							.then(updateItemColor, onErrorLog);
					};

					this.goToComic = function(comic) {
						comicService.gotoComic(comic);
						self.close();
					};

					this.close = function() {
						$('#itemDetailsDialog').modal('hide');
					};
				}],
			controllerAs: 'idvm',
			template: qcExt.variables.angularTemplates.itemDetails
		};
	});
})(qcExt || (qcExt = {}));

