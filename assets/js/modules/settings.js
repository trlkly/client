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

import GM from 'greasemonkey';

import constants from '../constants';

/**
 * Because we used a shim for GM4 temporarily, we should
 * load our shimmed settings when migrating, to give the
 * user a better UX.
 */
function loadFromGM4Shim() {
	let storagePrefix = GM.info.script.name.replace(/[^A-Z]*/g, '') + '-';
	function shimGetValue(aKey, aDefault) {
		let aValue = localStorage.getItem(storagePrefix + aKey);
	    if (null === aValue && 'undefined' !== typeof aDefault) { return aDefault; }
		return aValue;
	}
	function shimDeleteValue(aKey) {
		localStorage.removeItem(storagePrefix + aKey);
	}

	let shimSettings = shimGetValue(constants.settingsKey);
	if (shimSettings) {
		shimDeleteValue(constants.settingsKey);
	}
	return shimSettings;
}

type SettingValues = {
	showDebugLogs: boolean,
	scrollToTop: boolean,

	showAllMembers: boolean,
	showCast: boolean,
	showStorylines: boolean,
	showLocations: boolean,
	useColors: boolean,

	skipNonCanon: boolean,
	skipGuest: boolean,

	editMode: boolean,
	editModeToken: string,

	showIndicatorRibbon: boolean,
	showSmallRibbonByDefault: boolean,
	useCorrectTimeFormat: boolean
};

class Settings {
	defaults: SettingValues;
	settings: SettingValues;

	constructor() {
		this.defaults = {
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

			showIndicatorRibbon: true,
			showSmallRibbonByDefault: false,
			useCorrectTimeFormat: true
		};

		// This proxy makes it so you can access properties within the settings object
		// directly on the settings class object also.
		const self = this;
		return new Proxy(this, {
			get(target, prop) {
				if (!(prop in target)) {
					return target.settings[prop];
				}
				return (target: any)[prop];
			},
			set(target, prop, value) {
				if (!(prop in target) && target.settings && (prop in target.settings)) {
					target.settings[prop] = value;
				} else {
					(target: any)[prop] = value;
				}
				return true;
			}
		});
	}

	async loadSettings() {
		let shimSettings = loadFromGM4Shim();
		let settingsValue = shimSettings
			? shimSettings
			: await GM.getValue(constants.settingsKey,
				JSON.stringify(this.defaults));

		let settings = JSON.parse(settingsValue);

		// This makes sure that when new settings are added, users will
		// automatically receive the default values for those new settings when
		// they update.
		$.each(this.defaults, function (key, defaultValue) {
			if (!(key in settings)) {
				settings[key] = defaultValue;
			}
		});

		this.settings = settings;
	}

	async saveSettings() {
		await GM.setValue(constants.settingsKey, JSON.stringify(this.settings));
	}
}

export default new Settings();
