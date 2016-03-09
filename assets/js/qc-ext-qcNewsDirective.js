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

	qcExt.app.directive('qcNews', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$scope', '$sce', '$compile', 'eventFactory',
				function($scope, $sce, $compile, Event) {
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

					function nl2br(str, isXhtml) {
						var breakTag = isXhtml ||
							typeof isXhtml === 'undefined' ?
							'<br />' : '<br>';

						return String(str).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
							'$1' + breakTag + '$2');
					}

					function angularizeLinks(str) {
						var comicLinkRegexp =
							/<a[^>]*href=(?:"|')(?:http:\/\/(?:www\.)?questionablecontent.net\/)?view\.php\?comic=(\d+)(?:"|')[^>]*>/;

						return String(str).replace(comicLinkRegexp,
							'<a ng-href="view.php?comic=$1">');
					}

					var self = this;

					this.news = $sce.trustAsHtml('Loading...');
					comicDataLoadedEvent.subscribe($scope,
						function(event, comicData) {
							$scope.safeApply(function() {
								self.news = $sce.trustAsHtml(nl2br(
									angularizeLinks(comicData.news), false));
							});
						});
				}],
			controllerAs: 'n',
			template:
				'<div id="news" ng-bind-html="n.news" compile-template></div>'
		};
	});
})(qcExt || (qcExt = {}));
