// @flow
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

import type { AngularModule, $Log, $Http } from 'angular';

import angular from 'angular';

import constants from '../../../constants';
import settings from '../../settings';
import variables from '../../../../generated/variables.pass2';

import type { $DecoratedScope } from '../decorateScope';
import type { ComicService } from '../services/comicService';
import type { EventService } from '../services/eventService';
import type { ComicData, ComicItem } from '../api/comicData';
import type { LogEntryData } from '../api/logEntryData';

export class EditLogController {
	static $inject: string[];

	$scope: $DecoratedScope<EditLogController>;
	$log: $Log;
	$http: $Http;

	currentPage: number;
	logEntryData: LogEntryData;

	constructor(
		$scope: $DecoratedScope<EditLogController>,
		$log: $Log,
		$http: $Http
	) {
		$log.debug('START EditLogController');

		this.$scope = $scope;
		this.$log = $log;
		this.$http = $http;

		this.currentPage = 1;

		$('#editLogDialog').on('show.bs.modal', () => {
			this._loadLogs();
		});

		$log.debug('END EditLogController');
	}

	_loadLogs() {
		this.$http.get(`${constants.editLogUrl}?page=${this.currentPage}&token=${settings.values.editModeToken}`).then((response) => {
			if (response.status === 200) {
				this.$scope.safeApply(() => {
					this.logEntryData =  (response.data: LogEntryData);
				});
			}
		});
	}

	previousPage() {
		this.currentPage--;
		if (this.currentPage < 1) {
			this.currentPage = 1;
		}
		this._loadLogs();
	}

	nextPage() {
		this.currentPage++;
		if (this.currentPage > this.logEntryData.pageCount) {
			this.currentPage = this.logEntryData.pageCount;
		}
		this._loadLogs();
	}

	close() {
		($('#editLogDialog'): any).modal('hide');
	}
}
EditLogController.$inject = ['$scope', '$log', '$http'];

export default function (app: AngularModule) {
	app.directive('qcEditLog', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: EditLogController,
			controllerAs: 'elvm',
			template: variables.html.editLog
		};
	});
}
