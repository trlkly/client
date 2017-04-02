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

	qcExt.app.directive('qcDate', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$scope', '$log', 'eventFactory',
				function($scope, $log, Event) {
					var comicDataLoadingEvent =
						new Event(constants.comicdataLoadingEvent);
					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);
					
					$log.debug('START qcDate()');

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
					
					function formatDate(dateTime) {
						var monthNames = [
							'January', 'February', 'March',
							'April', 'May', 'June', 'July',
							'August', 'September', 'October',
							'November', 'December'
						];
						
						var weekDayNames = [
							'Sunday', 'Monday', 'Tuesday',
							'Wednesday', 'Thursday', 'Friday',
							'Saturday'
						];

						var dayIndex = dateTime.getDay();
						var date = dateTime.getDate();
						var monthIndex = dateTime.getMonth();
						var year = dateTime.getFullYear();
						
						var dateText = weekDayNames[dayIndex] + ', ' +
							monthNames[monthIndex] + ' ' + date + ', ' + year;
						
						var hours = dateTime.getHours();
						var minutes = dateTime.getMinutes();
						
						if (minutes < 10) {
							minutes = '0' + minutes;
						}
						
						var timeText;
						if (qcExt.settings.useCorrectTimeFormat) {
							if (hours < 10) {
								hours = '0' + hours;
							}
							timeText = hours + ':' + minutes;
						} else {
							var meridiem;
							if (hours < 12) {
								meridiem = 'a.m.';
							} else {
								meridiem = 'p.m.';
							}
							hours = hours % 12;
							if (hours === 0) {
								hours = 12;
							}
							
							timeText = hours + ':' + minutes + ' ' + meridiem;
						}

						return dateText + ' ' + timeText;
					}

					var self = this;
					this.date = '';
					comicDataLoadingEvent.subscribe($scope,
						function() {
							$scope.safeApply(function() {
								self.date = '';
							});
						});
					comicDataLoadedEvent.subscribe($scope,
						function(event, comicData) {
							$scope.safeApply(function() {
								var publishDate = comicData.publishDate;
								$log.debug('qcDate(): ', publishDate);
								if (publishDate !== null &&
									publishDate !== undefined) {
									var date = new Date(publishDate);
									self.date = formatDate(date);
								} else {
									$log.debug('qcDate(): ', 'UNKNOWN');
									self.date = '<Unknown publish date>';
								}
							});
						});
						
					$log.debug('END qcDate()');
				}],
			controllerAs: 'd',
			template: '<div class="row"><b>{{d.date}}</b></div>'
		};
	});
})(qcExt || (qcExt = {}));
