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
import variables from '../../../../generated/variables.pass2';

export default function (app) {
	app.directive('qcRibbon', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$scope', 'eventFactory',
				function ($scope, Event) {
					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);

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

					this.settings = settings;
					this.isNonCanon = false;
					this.isGuestComic = false;
					this.isSmall = settings.showSmallRibbonByDefault;

					var self = this;
					comicDataLoadedEvent.subscribe($scope,
						function (event, comicData) {
							$scope.safeApply(function () {
								self.isNonCanon = comicData.isNonCanon;
								self.isGuestComic = comicData.isGuestComic;
							});
						});
				}],
			controllerAs: 'r',
			template: variables.html.ribbon
		};
	});
}
