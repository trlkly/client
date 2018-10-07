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

import constants from '../../../constants';

import settings from '../../settings';

export default function (app) {
	app.service('comicService', ['$log', '$stateParams', '$location',
		'$rootScope', '$http', 'latestComic', 'eventFactory', 'colorService',
		'styleService', 'messageReportingService',
		function ($log, $stateParams, $location,
			$scope, $http, latestComic, Event, colorService,
			styleService, messageReportingService) {
			$log.debug('START comicService()');
			var comicDataLoadingEvent =
				new Event(constants.comicdataLoadingEvent);
			var comicDataLoadedEvent =
				new Event(constants.comicdataLoadedEvent);
			var comicDataErrorEvent = new Event(constants.comicdataErrorEvent);

			var self = this;

			var comicExtensionIndex = 0;

			function updateComic() {
				$log.debug('comicService:updateComic()');
				var comic;

				if (typeof $stateParams.comic === 'string') {
					comic = Number($stateParams.comic);
				} else {
					comic = latestComic;
				}

				$log.debug('comicService:updateComic(): Comic is', comic);

				self.comic = comic;
				self.nextComic = self.comic + 1 > latestComic ?
					latestComic : self.comic + 1;
				self.previousComic = self.comic - 1 < 1 ? 1 : self.comic - 1;
				self.latestComic = latestComic;
				comicExtensionIndex = 0;
				self.comicExtension =
					constants.comicExtensions[comicExtensionIndex];

				if (settings.scrollToTop) {
					$(window).scrollTop(0);
				}
			}

			$scope.$on('$stateChangeSuccess', function () {
				updateComic();
				self.refreshComicData();
			});

			function onErrorLog(response) {
				if (response.status !== 503) {
					messageReportingService.reportError(response.data);
				} else {
					messageReportingService.reportError(
						constants.messages.maintenance);
				}
				return response;
			}

			this.refreshComicData = function () {
				if (typeof self.comic === 'undefined') {
					$log.debug('comicService::refreshComicData() called ' +
						'before the comicService was properly initialized. ' +
						'Ignored.');
					return;
				}

				comicDataLoadingEvent.notify(self.comic);
				var comicDataUrl = constants.comicDataUrl + self.comic;

				var urlParameters = {};
				if (settings.editMode) {
					urlParameters.token = settings.editModeToken;
				}
				if (settings.skipGuest) {
					urlParameters.exclude = 'guest';
				} else if (settings.skipNonCanon) {
					urlParameters.exclude = 'non-canon';
				}
				if (settings.showAllMembers) {
					urlParameters.include = 'all';
				}
				var urlQuery = $.param(urlParameters);
				if (urlQuery) {
					comicDataUrl += '?' + urlQuery;
				}

				$log.debug('comicService:refreshComicData(): URL is', comicDataUrl);
				$http.get(comicDataUrl)
					.then(function (response) {
						if (response.status === 503) {
							comicDataErrorEvent.notify(response);
							return;
						}
						if (response.status !== 200) {
							onErrorLog(response);
							comicDataErrorEvent.notify(response);
							return;
						}

						function fixItem(item) {
							if (item.first == self.comic) {
								item.first = null;
							}

							if (item.last == self.comic) {
								item.last = null;
							}

							styleService.addItemStyle(item.id,
								item.color);
						}

						var comicData = response.data;
						if (comicData.hasData) {
							if (comicData.next !== null) {
								self.nextComic = comicData.next;
							} else {
								self.nextComic = self.comic + 1 > latestComic ?
									latestComic : self.comic + 1;
							}
							if (comicData.previous !== null) {
								self.previousComic = comicData.previous;
							} else {
								self.previousComic = self.comic - 1 < 1 ? 1 :
									self.comic - 1;
							}

							angular.forEach(comicData.items, fixItem);
							if (settings.showAllMembers) {
								angular.forEach(comicData.allItems, fixItem);
							}
						} else {
							self.nextComic = self.comic + 1 > latestComic ?
								latestComic : self.comic + 1;
							self.previousComic = self.comic - 1 < 1 ? 1 :
								self.comic - 1;

							if (settings.showAllMembers) {
								angular.forEach(comicData.allItems, fixItem);
							}
						}

						comicData.comic = self.comic;
						self.comicData = comicData;
						comicDataLoadedEvent.notify(self.comicData);
					}, function (errorResponse) {
						onErrorLog(errorResponse);
						comicDataErrorEvent.notify(errorResponse);
					});
			};

			function onSuccessRefreshElseErrorLog(response) {
				if (response.status === 200) {
					self.refreshComicData();
				} else {
					onErrorLog(response);
				}
				return response;
			}

			this.addItem = function (item) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					item: item
				};
				return $http.post(constants.addItemToComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.removeItem = function (item) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					item: item
				};
				return $http.post(constants.removeItemFromComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setTitle = function (title) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					title: title
				};
				return $http.post(constants.setComicTitleUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setTagline = function (tagline) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					tagline: tagline
				};
				return $http.post(constants.setComicTaglineUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setPublishDate = function (publishDate, isAccurate) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					publishDate: publishDate,
					isAccuratePublishDate: isAccurate
				};
				return $http.post(constants.setPublishDateUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setGuestComic = function (value) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					value: value
				};
				return $http.post(constants.setGuestComicUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.setNonCanon = function (value) {
				var data = {
					token: settings.editModeToken,
					comic: self.comic,
					value: value
				};
				return $http.post(constants.setNonCanonUrl, data)
					.then(onSuccessRefreshElseErrorLog, onErrorLog);
			};

			this.gotoComic = function (comicNo) {
				$location.url('/view.php?comic=' + comicNo);
			};

			this.canFallback = function () {
				return comicExtensionIndex <
					constants.comicExtensions.length - 1;
			};

			this.tryFallback = function () {
				comicExtensionIndex++;
				self.comicExtension = constants
					.comicExtensions[comicExtensionIndex];
			};

			this.first = function () {
				self.gotoComic(1);
			};

			this.previous = function () {
				self.gotoComic(self.previousComic);
			};

			this.next = function () {
				self.gotoComic(self.nextComic);
			};

			this.last = function () {
				self.gotoComic(latestComic);
			};

			$log.debug('END comicService()');
		}]);
}
