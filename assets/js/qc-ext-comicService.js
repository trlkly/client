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

/* global constants, unsafeWindow */

var qcExt;

(function(qcExt) {
	'use strict';

	qcExt.app.service('comicService', ['$log', '$stateParams', '$location',
		'$rootScope', '$http', 'latestComic', 'eventFactory', 'colorService',
		'styleService',
		function($log, $stateParams, $location,
			$scope, $http, latestComic, Event, colorService,
			styleService) {
			$log.debug('START comicService()');
			var comicDataLoadingEvent =
				new Event(constants.comicdataLoadingEvent);
			var comicDataLoadedEvent =
				new Event(constants.comicdataLoadedEvent);
			var comicDataErrorEvent = new Event(constants.comicdataErrorEvent);

			var self = this;

			var comicExtensionIndex = 0;

			function updateComic() {
				var comic;

				if (typeof $stateParams.comic === 'string') {
					comic = Number($stateParams.comic);
				} else {
					comic = latestComic;
				}

				self.comic = comic;
				self.nextComic = comic + 1 > latestComic ?
					latestComic : comic + 1;
				self.previousComic = comic - 1 < 1 ? 1 : comic - 1;
				self.latestComic = latestComic;
				comicExtensionIndex = 0;
				self.comicExtension =
					constants.comicExtensions[comicExtensionIndex];
			}

			$scope.$on('$stateChangeSuccess', function() {
				updateComic();
				self.refreshComicData();
			});

			this.refreshComicData = function() {
				comicDataLoadingEvent.notify();
				var comicDataUrl = constants.comicDataUrl + self.comic;

				var urlParameters = {};
				if (qcExt.settings.skipGuest) {
					urlParameters.exclude = 'guest';
				} else if (qcExt.settings.skipNonCanon) {
					urlParameters.exclude = 'non-canon';
				}
				if (qcExt.settings.showAllMembers) {
					urlParameters.include = 'all';
				}
				var urlQuery = $.param(urlParameters);
				if (urlQuery) {
					comicDataUrl += '?' + urlQuery;
				}

				$http.get(comicDataUrl)
					.then(function(response) {
						var comicData = response.data;

						if (comicData.hasData) {
							angular.forEach(comicData.items,
								function(value) {
									/* jshint eqeqeq:false */
									if (value.first == self.comic) {
										value.first = null;
									}

									if (value.last == self.comic) {
										value.last = null;
									}
									/* jshint eqeqeq:true */

									var qcNavItem = '#qcnav_item_' +
										value.id;
									var qcNavItemWithColor = qcNavItem +
										'.with_color';

									if (!styleService
										.hasStyle(qcNavItemWithColor)) {
										var backgroundColor = value.color;
										var foregroundColor = colorService
											.createTintOrShade(value.color);
										var hoverFocusColor = colorService
											.createTintOrShade(value.color, 2);

										// jscs:disable maximumLineLength
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
										// jscs:enable maximumLineLength

										styleService.addCustomStyle(
											qcNavItemWithColor, itemStyle);
									}
								});
						}

						comicData.comic = self.comic;
						self.comicData = comicData;
						comicDataLoadedEvent.notify(self.comicData);

						if (qcExt.settings.scrollToTop) {
							$(unsafeWindow).scrollTop(0);
						}
					}, function(errorResponse) {

						// TODO: ERROR HANDLING
						comicDataErrorEvent.notify(errorResponse.data);
					});
			};

			function onErrorLog(response) {
				$log.error(response.data);
				return response;
			}

			function onSuccessRefreshElseErrorLog(response) {
				if (response.status === 200) {
					self.refreshComicData();
				} else {
					onErrorLog(response);
				}
				return response;
			}

			this.addItem = function(item) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					item: item
				};
				return $http.post(constants.addItemToComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.removeItem = function(item) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					item: item
				};
				return $http.post(constants.removeItemFromComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setTitle = function(title) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					title: title
				};
				return $http.post(constants.setComicTitleUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setTagline = function(tagline) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					tagline: tagline
				};
				return $http.post(constants.setComicTaglineUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setGuestComic = function(value) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					value: value
				};
				return $http.post(constants.setGuestComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setNonCanon = function(value) {
				var data = {
					token: qcExt.settings.editModeToken,
					comic: self.comic,
					value: value
				};
				return $http.post(constants.setNonCanonUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.gotoComic = function(comicNo) {
				$location.url('/view.php?comic=' + comicNo);
			};

			this.canFallback = function() {
				return comicExtensionIndex <
					constants.comicExtensions.length - 1;
			};

			this.tryFallback = function() {
				comicExtensionIndex++;
				self.comicExtension = constants
					.comicExtensions[comicExtensionIndex];
			};

			this.first = function() {
				self.gotoComic(1);
			};

			this.previous = function() {
				var previousComic = Number($stateParams.comic) - 1;

				if (previousComic < 1) {
					previousComic = 1;
				}

				self.gotoComic(previousComic);
			};

			this.next = function() {
				var nextComic = Number($stateParams.comic) + 1;

				if (nextComic > latestComic) {
					nextComic = latestComic;
				}

				self.gotoComic(nextComic);
			};

			this.last = function() {
				self.gotoComic(latestComic);
			};

			$log.debug('END comicService()');
		}]);
})(qcExt || (qcExt = {}));
