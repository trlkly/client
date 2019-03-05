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

import type { AngularModule, $Log, $Timeout, $Http, $Filter } from 'angular';

import constants from '../../../constants';
import variables from '../../../../generated/variables.pass2';

import { SetValueControllerBase } from '../controllers/ControllerBases';

import type { $DecoratedScope } from '../decorateScope';
import type { ComicService } from '../services/comicService';
import type { EventService } from '../services/eventService';
import type { MessageReportingService } from '../services/messageReportingService';
import type { ItemBaseData, ItemData } from '../api/itemData';
import type { ComicData, ComicItem } from '../api/comicData';

const addCastTemplate = 'Add new cast member';
const addCastItem: ItemBaseData = {
	id: -1,
	type: 'cast',
	shortName: `${addCastTemplate} ''`,
	name: ''
};
const addStorylineTemplate = 'Add new storyline';
const addStorylineItem: ItemBaseData = {
	id: -1,
	type: 'storyline',
	shortName: `${addStorylineTemplate} ''`,
	name: ''
};
const addLocationTemplate = 'Add new location';
const addLocationItem: ItemBaseData = {
	id: -1,
	type: 'location',
	shortName: `${addLocationTemplate} ''`,
	name: ''
};
const maintenanceItem: ItemBaseData = {
	id: -2,
	type: 'cast',
	shortName: 'Maintenance ongoing. Choose this to attempt refresh.',
	name: ''
};
const errorItem: ItemBaseData = {
	id: -3,
	type: 'cast',
	shortName: 'Error loading item list. Choose this to attempt refresh.',
	name: ''
};

function escapeRegExp(s) {
	return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

let triggeredFocus = false;
let dropdownOpen = false;
let firstRun = true;

export class AddItemController extends SetValueControllerBase<AddItemController> {
	static $inject: string[];

	$log: $Log;
	$http: $Http;
	$timeout: $Timeout;
	$filter: $Filter;
	messageReportingService: MessageReportingService;

	searchFieldId: string;
	dropdownId: string;
	dropdownButtonId: string;

	itemFilterText: string;
	items: ItemBaseData[];

	isUpdating: boolean;

	constructor(
		$scope: $DecoratedScope<AddItemController>,
		$log: $Log,
		comicService: ComicService,
		eventService: EventService,
		$http: $Http,
		$timeout: $Timeout,
		$filter: $Filter,
		messageReportingService: MessageReportingService
	) {
		$log.debug('START AddItemController');

		super($scope, comicService, eventService);

		this.$log = $log;
		this.$http = $http;
		this.$timeout = $timeout;
		this.$filter = $filter;
		this.messageReportingService = messageReportingService;

		this.searchFieldId = `#addItem_${this.unique}_search`;
		this.dropdownId = `#addItem_${this.unique}_dropdown`;
		this.dropdownButtonId = `#addItem_${this.unique}_dropdownButton`;
		
		this.items = [];
		this.itemFilterText = '';

		(this: any).itemFilter = this.itemFilter.bind(this);

		this._loadItemData();

		$log.debug('END AddItemController');
	}

	async _loadItemData() {
		this.eventService.itemDataLoadingEvent.publish();
		const response = await this.$http.get(constants.itemDataUrl);

		let itemData: ItemBaseData[] = [];
		if (response.status === 200) {
			itemData = response.data;

			this.eventService.itemDataLoadedEvent.publish(itemData);

			itemData.push(addCastItem);
			itemData.push(addStorylineItem);
			itemData.push(addLocationItem);
		} else {
			if (response.status === 503) {
				itemData.push(maintenanceItem);
			} else {
				this.eventService.itemDataErrorEvent.publish(response);
				this.messageReportingService.reportError(response.data);
				itemData.push(errorItem);
			}
		}

		this.$scope.safeApply(() => {
			this.items = itemData;
		});
	}

	_updateValue() {
		// Add the top item in the list
		const filteredList = this.$filter('filter')(this.items,
			this.itemFilter);
		const chosenItem = filteredList[0];
		this.addItem(chosenItem);
	}

	_comicDataLoaded(comicData: ComicData) {
		this.itemFilterText = '';
		this.$scope.isUpdating = false;
	}

	_itemsChanged() {
		this._loadItemData();
	}

	searchChanged() {
		let filterText = this.itemFilterText;

		if (filterText.charAt(0) === '!') {
			filterText = filterText.substr(1);
		} else if (filterText.charAt(0) === '@') {
			filterText = filterText.substr(1);
		} else if (filterText.charAt(0) === '#') {
			filterText = filterText.substr(1);
		}

		addCastItem.shortName = `${addCastTemplate} '${filterText}'`;
		addCastItem.name = filterText;
		addStorylineItem.shortName = `${addStorylineTemplate} '${filterText}'`;
		addStorylineItem.name = filterText;
		addLocationItem.shortName = `${addLocationTemplate} '${filterText}'`;
		addLocationItem.name = filterText;
	}

	itemFilter(value: ItemBaseData) {
		let filterText = this.itemFilterText;

		let result = true;
		if (filterText.charAt(0) === '!') {
			result = value.type === 'cast';
			filterText = filterText.substr(1);
		} else if (filterText.charAt(0) === '@') {
			result = value.type === 'location';
			filterText = filterText.substr(1);
		} else if (filterText.charAt(0) === '#') {
			result = value.type === 'storyline';
			filterText = filterText.substr(1);
		}

		const searchRegex = new RegExp(escapeRegExp(filterText), 'i');
		result = result &&
			value.shortName.match(searchRegex) !== null;

		return result;
	}

	focusSearch() {
		this.$log.debug('AddItemController::focusSearch(): #1 Search focused');
		if (firstRun) {
			$(this.dropdownId).on('shown.bs.dropdown', () => {
				dropdownOpen = true;
				this.$log.debug('AddItemController::focusSearch(): #4 Dropdown opened');

				// Opening the dropdown makes the search field
				// lose focus. So set it again.
				$(this.searchFieldId).focus();
				triggeredFocus = false;

				$(this.dropdownId + ' .dropdown-menu').width($(
					this.dropdownId).width());
			});
			$(this.dropdownId).on('hidden.bs.dropdown', () => {
				this.$log.debug('AddItemController::focusSearch(): #5 Dropdown closed');
				dropdownOpen = false;
			});

			firstRun = false;
		}

		if (!dropdownOpen && !triggeredFocus) {
			this.$log.debug(
				'AddItemController::focusSearch(): #2 Focus was user-initiated');
			triggeredFocus = true;
			this.$timeout(() => {
				if (!dropdownOpen) {
					this.$log.debug(
						'AddItemController::focusSearch(): #3 Toggle dropdown');
					($(this.dropdownButtonId): any).dropdown('toggle');
				}
			}, 150);
		}
	}

	async addItem(item: ComicItem) {
		if (item.id < -1) {
			this._loadItemData();
			return;
		}

		this.$scope.isUpdating = true;
		const response = await this.comicService.addItem(item);
		if (response.status === 200) {
			this.eventService.itemsChangedEvent.publish();
			this.$scope.safeApply(() => {
				this.itemFilterText = '';
			});
		} else {
			this.$scope.safeApply(() => {
				this.$scope.isUpdating = false;
			});
		}
	}
}
AddItemController.$inject = [
	'$scope', '$log', 'comicService', 'eventService',
	'$http', '$timeout', '$filter', 'messageReportingService'
];

export default function (app: AngularModule) {
	app.directive('qcAddItem', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: { isUpdating: '=' },
			controller: AddItemController,
			controllerAs: 'a',
			template: variables.html.addItem
		};
	});
}
