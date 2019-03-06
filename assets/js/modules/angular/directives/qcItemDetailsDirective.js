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

import angular from 'angular';

import type { AngularModule, $Log, $Http } from 'angular';

import constants from '../../../constants';
import settings, { Settings } from '../../settings';
import variables from '../../../../generated/variables.pass2';

import { convertDataUritoBlob } from '../util';

import type { $DecoratedScope } from '../decorateScope';
import type { ColorService } from '../services/colorService';
import type { ComicService } from '../services/comicService';
import type { MessageReportingService } from '../services/messageReportingService';
import type { StyleService } from '../services/styleService';
import type { DecoratedItemData, ItemRelationData, ItemImageData } from '../api/itemData';

export class ItemDetailsController {
	static $inject: string[];

	$log: $Log;
	$http: $Http;
	$scope: $DecoratedScope<ItemDetailsController>;
	colorService: ColorService;
	comicService: ComicService;
	messageReportingService: MessageReportingService;
	styleService: StyleService;

	isLoading: number;
	isUpdating: boolean;
	settings: Settings;
	itemData: DecoratedItemData;

	imagePaths: string[];
	currentImagePath: number;
	isImagePreview: boolean;
	imageFile: ?string;
	imageFileInfo: any;

	constructor(
		$log: $Log,
		$http: $Http,
		$scope: $DecoratedScope<ItemDetailsController>,
		colorService: ColorService,
		comicService: ComicService,
		messageReportingService: MessageReportingService,
		styleService: StyleService
	) {
		$log.debug('START ItemDetailsController');

		this.$log = $log;
		this.$http = $http;
		this.$scope = $scope;
		this.colorService = colorService;
		this.comicService = comicService;
		this.messageReportingService = messageReportingService;
		this.styleService = styleService;

		this.isLoading = 1;
		this.isUpdating = false;
		this.settings = settings;

		this.imagePaths = [];
		this.currentImagePath = 0;
		this.isImagePreview = false;
		this.imageFile = null;
		this.imageFileInfo = null;

		$('#itemDetailsDialog').on('show.bs.modal', () => this._getItemDetails());

		$log.debug('END ItemDetailsController');
	}

	async _getItemDetails() {
		const self = this;
		const itemId = $('#itemDetailsDialog').data('itemId');
		this.$log.debug('ItemDetailsController::showModal() - item id:',
			itemId);

		function handleRelationData(response): ?ItemRelationData[] {
			if (response.status === 200) {
				const relationData = (response.data: ItemRelationData[]);

				$.each(relationData, (_: number, relation) => {
					relation.percentage = relation.count /
						self.itemData.appearances * 100;
				});

				return relationData;
			}
			return null;
		}

		function handleItemFriendsData(response) {
			let friends = handleRelationData(response);
			self.$scope.safeApply(() => {
				self.itemData.friends = friends || [];
				self.isLoading--;
			});
		}

		function handleItemLocationsData(response) {
			let locations = handleRelationData(response);
			self.$scope.safeApply(() => {
				self.itemData.locations = locations || [];
				self.isLoading--;
			});
		}

		function handleItemImageData(response) {
			if (response.status === 200) {
				let images = response.data;
				let imagePaths: string[] = [];
				$.each(images, (_: number, image: ItemImageData) => {
					imagePaths.push(`${constants.itemDataUrl}image/${image.id}`);
				});
				self.$scope.safeApply(() => {
					self.imagePaths = imagePaths;
					self.currentImagePath = 0;
					self.isLoading--;
				});
			}
		}

		this.itemData = (({}: any): DecoratedItemData);
		this.isLoading = 1;

		this.imagePaths = [];
		this.currentImagePath = 0;
		this.isImagePreview = false;
		this.imageFile = null;
		this.imageFileInfo = null;

		const itemDataResponse = await this.$http.get(constants.itemDataUrl + itemId);
		if (itemDataResponse.status === 200) {
			const itemData = (itemDataResponse.data: DecoratedItemData);

			itemData.highlightColor = this.colorService
				.createTintOrShade(itemData.color);

			this.$log.debug('qcItemDetails::showModal() - ' +
				'item data:', itemData);

			this.isLoading += 2;
			const friendDataRequest = this.$http.get(constants.itemFriendDataUrl + itemId);
			const locationDataRequest = this.$http.get(constants.itemLocationDataUrl + itemId);
			this.$http.get(constants.itemFriendDataUrl + itemId)
				.then(handleItemFriendsData);
			this.$http.get(constants.itemLocationDataUrl + itemId)
				.then(handleItemLocationsData);
			if (itemData.hasImage) {
				this.isLoading++;
				this.$http.get(constants.itemDataUrl + itemId + '/images')
					.then(handleItemImageData);
			}

			// If the color changes, also update the
			// highlight color
			this.$scope.safeApply(() => {
				this.itemData = itemData;
				this.isLoading--;

				this.$scope.$watch(() => {
					return this.itemData.color;
				}, () => {
					this.itemData.highlightColor =
						this.colorService
							.createTintOrShade(
								itemData.color);
				});
			});
		} else {
			this.$scope.safeApply(() => {
				this.isLoading--;
			});
			if (itemDataResponse.status !== 503) {
				this.messageReportingService.reportError(itemDataResponse.data);
			} else {
				this.messageReportingService.reportError(
					constants.messages.maintenance);
				this.close();
			}
		}
	}

	_onErrorLog(response: any) {
		this.messageReportingService.reportError(response.data);
		return response;
	}

	_onSuccessRefreshElseErrorLog(response: any) {
		if (response.status === 200) {
			this.comicService.refreshComicData();
		} else {
			this._onErrorLog(response);
		}
		return response;
	}

	showInfoFor(id: number) {
		$('#itemDetailsDialog').data('itemId', id);
		this._getItemDetails();
	}

	keypress(event: KeyboardEvent, property: string) {
		if (event.keyCode === 13) {
			// ENTER key
			this.update(property);
		}
	}

	async update(property: string) {
		this.$scope.safeApply(() => {
			this.isUpdating = true;
		});
		const data = {
			token: settings.values.editModeToken,
			item: this.itemData.id,
			property: property,
			value: this.itemData[property]
		};
		try {
			const response = await this.$http.post(constants.setItemDataPropertyUrl, data);
			this.$scope.safeApply(() => {
				this.isUpdating = false;
			});

			if (response.status === 200) {
				if (property === 'color') {
					this.$log.debug('ItemDetailsController::update() - ' +
						'update item color');
					this.styleService.removeItemStyle(
						this.itemData.id);
				}
			} else {
				this.$scope.safeApply(() => {
					this.isUpdating = false;
				});
			}
			return this._onSuccessRefreshElseErrorLog(response);
		}
		catch (r) {
			this.$scope.safeApply(() => {
				this.isUpdating = false;
			});
			return this._onErrorLog(r);
		}
	}

	goToComic(comic: number) {
		this.comicService.gotoComic(comic);
		this.close();
	}

	close() {
		($('#itemDetailsDialog'): any).modal('hide');
	}

	previewImage() {
		if (this.imageFile && this.imageFileInfo.type == 'image/png') {
			this.isImagePreview = true;
		}
	}

	uploadImage() {
		if (this.imageFile && this.imageFileInfo.type == 'image/png') {
			const imageBlob = convertDataUritoBlob(this.imageFile);

			const formData = new FormData();
			formData.append('ItemId', String(this.itemData.id));
			formData.append('Image', imageBlob, this.imageFileInfo.name);
			formData.append('Token', settings.values.editModeToken);

			this.$http.post(constants.itemDataUrl + 'image/upload', formData, { contentType: undefined, dataTransform: (d) => d })
				.then(() => {
					this._getItemDetails();
				}).catch((error) => {
					self.messageReportingService.reportError(
						error);
				});
		}
	}

	previousImage() {
		this.currentImagePath--;
		if (this.currentImagePath < 0) {
			this.currentImagePath = 0;
		}
	}

	nextImage() {
		this.currentImagePath++;
		if (this.currentImagePath >= this.imagePaths.length) {
			this.currentImagePath = this.imagePaths.length - 1;
		}
	}
}
ItemDetailsController.$inject = ['$log', '$http', '$scope', 'colorService',
	'comicService', 'messageReportingService', 'styleService'];

export default function (app: AngularModule) {
	app.directive('qcItemDetails', function () {
		return {
			restrict: 'E',
			replace: true,
			scope: {},
			controller: ItemDetailsController,
			controllerAs: 'idvm',
			template: variables.html.itemDetails
		};
	});
}
