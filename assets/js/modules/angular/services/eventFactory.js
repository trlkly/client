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

export default function (app) {
	app.factory('eventFactory', ['$rootScope', '$log',
		function ($rootScope, $log) {
			var eventFactory = function (eventName) {
				this.eventName = eventName;
			};

			eventFactory.prototype.subscribe = function (scope, callback) {
				var handle = $rootScope.$on(this.eventName, callback);

				scope.$on('$destroy', handle);
			};

			eventFactory.prototype.notify = function (data) {
				var eventData = [this.eventName];

				if (typeof data !== 'undefined') {
					eventData = eventData.concat(data);
				}

				$log.debug('Event data: ', eventData);
				$rootScope.$emit.apply($rootScope, eventData);
			};

			return eventFactory;
		}]);
}
