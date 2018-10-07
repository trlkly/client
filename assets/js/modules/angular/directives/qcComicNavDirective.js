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
import variables from '../../../../generated/variables.pass2';

export default function (app) {
	app.directive('qcComicNav', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$log', 'comicService', 'latestComic', 'eventFactory',
				'$scope',
				function ($log, comicService, latestComic, Event, $scope) {
					$log.debug('START qcComicNav()');

					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);

					this.currentComic = null;
					this.latestComic = latestComic;
					var self = this;

					this.go = function () {
						$log.debug('qcComicNav.go(): ' + self.currentComic);
						if (self.currentComic === undefined ||
							self.currentComic === null) {
							self.currentComic = latestComic;
						} else if (self.currentComic < 1) {
							self.currentComic = 1;
						} else if (self.currentComic > latestComic) {
							self.currentComic = latestComic;
						}
						comicService.gotoComic(self.currentComic);
					};

					this.keyPress = function (event) {
						if (event.keyCode === 13) {
							// ENTER key
							self.go();
						}
					};

					comicDataLoadedEvent.subscribe($scope,
						function (event, comicData) {
							self.currentComic = comicData.comic;
						});

					$log.debug('END qcComicNav()');
				}],
			controllerAs: 'cn',
			template: variables.html.comicNav
		};
	});
}
