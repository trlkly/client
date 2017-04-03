/*
 * Copyright (C) 2016, 2017 Alexander Krivács Schrøder <alexschrod@gmail.com>
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

var constants;

(function(constants) {
	'use strict';

	constants.settingsKey = 'settings';
	
	// Comics after 3132 should have a tagline
	constants.taglineThreshold = 3132;

	// Set this to true when working against your local test server.
	// NEVER CHECK THIS FILE IN WITH developmentMode = true!
	constants.developmentMode = false;
	if (constants.developmentMode) {
		constants.baseUrl =
			'http://localhost/questionablecontentextensions/web/';
		constants.webServiceBaseUrl = constants.baseUrl + 'app_dev.php/';
	} else {
		constants.baseUrl = 'https://questionablextensions.net/';
		constants.webServiceBaseUrl = constants.baseUrl;
	}

	constants.comicDataUrl = constants.webServiceBaseUrl + 'comicdata/';
	constants.addItemToComicUrl = constants.comicDataUrl + 'additem';
	constants.removeItemFromComicUrl = constants.comicDataUrl + 'removeitem';
	constants.setComicTitleUrl = constants.comicDataUrl + 'settitle';
	constants.setComicTaglineUrl = constants.comicDataUrl + 'settagline';
	constants.setPublishDateUrl = constants.comicDataUrl + 'setpublishdate';
	constants.setGuestComicUrl = constants.comicDataUrl + 'setguest';
	constants.setNonCanonUrl = constants.comicDataUrl + 'setnoncanon';
	
	constants.itemDataUrl = constants.webServiceBaseUrl + 'itemdata/';
	constants.itemFriendDataUrl = constants.itemDataUrl + 'friends/';
	constants.itemLocationDataUrl = constants.itemDataUrl + 'locations/';
	constants.setItemDataPropertyUrl = constants.itemDataUrl + 'setproperty';
	
	constants.characterImageBaseUrl = constants.baseUrl + 'images/characters/';
	constants.characterImageExtension = 'png';

	constants.comicExtensions = ['png', 'gif', 'jpg'];

	constants.comicdataLoadingEvent = 'comicdata-loading';
	constants.comicdataLoadedEvent = 'comicdata-loaded';
	constants.comicdataErrorEvent = 'comicdata-error';
	constants.itemsChangedEvent = 'items-changed';
	
	constants.messages = {
		maintenance: 'The Questionable Extensions' +
			' server is currently undergoing maintenance.' +
			' Normal operation should resume within a' +
			' few minutes.'
	};
})(constants || (constants = {}));
