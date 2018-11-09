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

import angular from 'angular';

import constants from '../../../constants';
import variables from '../../../../generated/variables.pass2';

export default function (app) {
	app.directive('qcEditComicData', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$scope', '$log', 'eventFactory', 'comicService',
				function ($scope, $log, Event, comicService) {
					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);
					var itemsChangedEvent =
						new Event(constants.itemsChangedEvent);

					$scope.safeApply = function (fn) {
						var phase = this.$root.$$phase;
						if (phase === '$apply' || phase === '$digest') {
							if (fn && typeof fn === 'function') {
								fn();
							}
						} else {
							this.$apply(fn);
						}
					};

					var self = this;

					comicDataLoadedEvent
						.subscribe($scope, function (event, comicData) {
							$scope.safeApply(function () {
								var editData = { comicData: comicData };

								if (comicData.hasData) {
									angular.forEach(comicData.items,
										function (value) {

											if (!(value.type in editData)) {
												editData[value.type] = {};
											}

											editData[value.type][value.id] =
												value;
										});
								}

								self.editData = editData;
							});
						});

					$('#editComicDataDialog').on('show.bs.modal', function () {
						// If something needs to be done, do it here.
					});

					this.remove = function (item) {
						comicService.removeItem(item).then(function (response) {
							if (response.status === 200) {
								itemsChangedEvent.notify();
							}
						});
					};

					this.changeGuestComic = function () {
						comicService.setGuestComic(
							self.editData.comicData.isGuestComic);
					};

					this.changeNonCanon = function () {
						comicService.setNonCanon(
							self.editData.comicData.isNonCanon);
					};

					this.close = function () {
						$('#editComicDataDialog').modal('hide');
					};
				}],
			controllerAs: 'ecdvm',
			template: variables.html.editComicData
		};
	});
}
