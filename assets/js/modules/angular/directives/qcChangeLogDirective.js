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
	app.directive('qcChangeLog', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ['$log', 'eventFactory', '$scope',
				function ($log, Event, $scope) {
					$log.debug('START qcChangeLog()');

					$log.debug();

					this.versionUpdated = false;
					this.currentVersion = GM.info.script.version;
					this.previousVersion = null;
					var self = this;

					var comicDataLoadedEvent =
						new Event(constants.comicdataLoadedEvent);

					comicDataLoadedEvent.subscribe($scope,
						function () {
							if (settings.version === undefined) {
								// Version is undefined. We're a new user!
								$log.debug('qcChangeLog(): Version undefined!');
							} else if (settings.version !==
								self.currentVersion) {
								// Version is changed. Script has been updated!
								// Show the change log dialog.
								self.previousVersion = settings.version;
								$log.debug('qcChangeLog(): Version different!');
							} else {
								return;
							}
							self.versionUpdated = true;
						});

					$('#changeLogDialog').on('hide.bs.modal', function () {
						$log.debug('Saving settings...');
						settings.version = self.currentVersion;
						settings.saveSettings().then(() => {
							$log.debug('Settings saved.');
						});
					});

					this.close = function () {
						$('#changeLogDialog').modal('hide');
					};

					$log.debug('END qcChangeLog()');
				}],
			controllerAs: 'clvm',
			template: variables.html.changeLog
		};
	});
}
