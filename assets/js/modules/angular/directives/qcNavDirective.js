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

import variables from '../../../../generated/variables.pass2';

export default function (app) {
	app.directive('qcNav', function () {
		return {
			restrict: 'E',
			scope: { randomComic: '=' },
			controller: ['$scope', 'comicService', 'latestComic',
				function ($scope, comicService, latestComic) {
					this.comicService = comicService;

					function updateRandomComic() {
						$scope.randomComic = Math.floor(Math.random() *
							(parseInt(latestComic) + 1));
					}

					updateRandomComic();

					this.first = function (event) {
						event.preventDefault();
						event.stopPropagation();
						comicService.first();
					};

					this.previous = function (event) {
						event.preventDefault();
						event.stopPropagation();
						comicService.previous();
					};

					this.next = function (event) {
						event.preventDefault();
						event.stopPropagation();
						comicService.next();
					};

					this.last = function (event) {
						event.preventDefault();
						event.stopPropagation();
						comicService.last();
					};

					this.random = function (event) {
						event.preventDefault();
						event.stopPropagation();

						comicService.gotoComic($scope.randomComic);
						updateRandomComic();
					};
				}],
			controllerAs: 'n',
			template: variables.html.navigation
		};
	});
}
