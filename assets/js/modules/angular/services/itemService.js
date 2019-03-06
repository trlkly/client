// @flow
/*
 * Copyright (C) 2016-2019 Alexander Krivács Schrøder <alexschrod@gmail.com>
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

import $ from 'jquery';
import angular from 'angular';
import type { AngularModule, $Log, $Scope, AngularHttpService } from 'angular';

import constants from '../../../constants';

import type { EventService } from './eventService';
import type { MessageReportingService } from './messageReportingService';

import type { ItemBaseData } from '../api/itemData';

export class ItemService {
	$log: $Log;
	$scope: $Scope<Object>;
	$http: AngularHttpService;
	eventService: EventService;
	messageReportingService: MessageReportingService;

	itemData: ItemBaseData[];

	isLoading: boolean;

	constructor($log: $Log, $scope: $Scope<Object>, $http: AngularHttpService, eventService: EventService,
		messageReportingService: MessageReportingService) {
		this.$log = $log;
		this.$scope = $scope;
		this.$http = $http;
		this.eventService = eventService;
		this.messageReportingService = messageReportingService;

		eventService.itemsChangedEvent.subscribe($scope,
			(event, data) => {
				this.refreshItemData();
			});
		this.refreshItemData();
	}

	async _loadItemData() {
		if (this.isLoading){
			return;
		}
		this.isLoading = true;

		this.eventService.itemDataLoadingEvent.publish();
		const response = await this.$http.get(constants.itemDataUrl);

		let itemData: ItemBaseData[] = [];
		if (response.status === 200) {
			itemData = response.data;
			this.eventService.itemDataLoadedEvent.publish(itemData);
		} else {
			if (response.status === 503) {
				this.eventService.maintenanceEvent.publish();
			} else {
				this.eventService.itemDataErrorEvent.publish(response);
				this.messageReportingService.reportError(response.data);
			}
		}
		this.itemData = itemData;
		this.isLoading = false;
	}

	refreshItemData() {
		this._loadItemData();
	}
}

export default function (app: AngularModule) {
	app.service('itemService', ['$log', '$rootScope', '$http', 'eventService', 'messageReportingService',
		function ($log: $Log, $scope: $Scope<Object>, $http: AngularHttpService, eventService: EventService,
			messageReportingService: MessageReportingService) {

			$log.debug('START itemService()');
			const itemService = new ItemService($log, $scope, $http, eventService,
				messageReportingService);
			$log.debug('END itemService()');
			return itemService;
		}]);
}
