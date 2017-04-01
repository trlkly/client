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

/* global constants */

var qcExt;

(function(qcExt) {
	'use strict';

	var defaults = {
		showDebugLogs: false,
		scrollToTop: true,

		showAllMembers: false,
		showCast: true,
		showStorylines: true,
		showLocations: true,
		useColors: true,

		skipNonCanon: false,
		skipGuest: false,

		editMode: false,
		editModeToken: '',
		
		useCorrectTimeFormat: true
	};

	qcExt.settings = JSON.parse(GM_getValue(constants.settingsKey,
	JSON.stringify(defaults)));

	// This makes sure that when new settings are added, users will
	// automatically receive the default values for those new settings when
	// they update.
	$.each(defaults, function(key, defaultValue) {
		if (!(key in qcExt.settings)) {
			qcExt.settings[key] = defaultValue;
		}
	});
})(qcExt || (qcExt = {}));
