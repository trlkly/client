/*
 * Copyright (C) 2016, 2017 Alexander Krivács Schrøder <alexschrod@gmail.com>
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

	qcExt.app.directive('qcSetPublishDate', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$scope', '$log', 'comicService', 'eventFactory',
				'messageReportingService',
				function($scope, $log, comicService, Event,
					messageReportingService) {
					$log.debug('START qcSetPublishDate()');

					var self = this;

					this.unique = Math.random().toString(36).slice(-5);

					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);

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

					this.keyPress = function(event) {
						if (event.keyCode === 13) {
							// ENTER key
							self.setPublishDate();
						}
					};

					this.setPublishDate = function() {
						if (self.publishDate === null || self.publishDate ===
							undefined) {
							// Error
							messageReportingService.reportWarning(
								'The date entered is not valid!');
							return;
						}
						comicService.setPublishDate(self.publishDate);
					};

					this.publishDate = '';
					comicDataLoadedEvent.subscribe($scope,
						function(event, comicData) {
							$scope.safeApply(function() {
								var publishDate = comicData.publishDate;
								if (publishDate !== null &&
									publishDate !== undefined) {
									var date = new Date(publishDate);
									self.publishDate = date;
								} else {
									self.publishDate = null;
								}
							});
						});

					$log.debug('END qcSetPublishDate()');
				}],
			controllerAs: 's',
			template: qcExt.variables.angularTemplates.setPublishDate
		};
	});
})(qcExt || (qcExt = {}));
