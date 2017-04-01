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

var qcExt;

(function(qcExt) {
	'use strict';

	(function(modules) {
		// TODO: Since we're not using the original service at all, we might
		// as well completely replace it rather than decorate it...
		// http://www.bennadel.com/blog/
		// 2927-overriding-core-and-custom-services-in-angularjs.htm
		modules.decorateHttpService = function($provide) {

			// Let's take over $http and make it use Greasemonkey's cross-domain
			// XMLHTTPRequests instead of the browser's.
			$provide.decorator('$http', function() {

				// START Code bits borrowed from angular
				// (see angular's license for details)
				var APPLICATION_JSON = 'application/json';
				var JSON_START = /^\[|^\{(?!\{)/;
				var JSON_ENDS = {
					'[': /]$/,
					'{': /}$/
				};
				var JSON_PROTECTION_PREFIX = /^\)\]\}',?\n/;

				function isJsonLike(str) {
					var jsonStart = str.match(JSON_START);

					return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
				}

				function isString(value) {
					return typeof value === 'string';
				}

				function fromJson(json) {
					return isString(json) ? JSON.parse(json) : json;
				}

				function defaultHttpResponseTransform(data, headers) {
					if (!isString(data)) {
						return data;
					}

					// Strip json vulnerability protection prefix
					// and trim whitespace
					var tempData = data.replace(JSON_PROTECTION_PREFIX, '')
						.trim();

					if (!tempData) {
						return data;
					}

					var contentType = headers('Content-Type');

					if (contentType &&
						contentType.indexOf(APPLICATION_JSON) === 0 ||
						isJsonLike(tempData)) {
						data = fromJson(tempData);
					}

					return data;
				}

				// END Code bits borrowed from angular

				function getHeaderFunction(headers) {
					var keyedHeaders = {};

					angular.forEach(headers, function(value) {
						var splitValue = value.trim().split(':', 2);

						if (splitValue.length < 2) {
							return;
						}

						keyedHeaders[splitValue[0].trim()] =
							splitValue[1].trim();
					});

					return function(key) {
						return keyedHeaders[key] || null;
					};
				}

				var injector = angular.injector(['ng']);
				var $q = injector.get('$q');
				var ourHttp = {
					get: function(url, config) {
						return $q(function(resolve, reject) {
							GM_xmlhttpRequest({
								method: 'GET',
								url: url,
								headers: {
									Accept: APPLICATION_JSON
								},
								onload: function(gmResponse) {
									var headers = getHeaderFunction(
										gmResponse.responseHeaders
										.split('\n'));
									var responseData = gmResponse.response;

									responseData = defaultHttpResponseTransform(
										responseData, headers);
									var response = {
										data: responseData,
										status: gmResponse.status,
										headers: headers,
										config: config,
										statusText: gmResponse.statusText
									};

									resolve(response);
								},
								onerror: function(gmResponse) {
									var headers = getHeaderFunction(gmResponse
										.responseHeaders.split('\n'));
									var responseData = gmResponse.response;

									responseData = defaultHttpResponseTransform(
										responseData, headers);
									var response = {
										data: responseData,
										status: gmResponse.status,
										headers: headers,
										config: config,
										statusText: gmResponse.statusText
									};

									reject(response);
								}
							});
						});
					},
					post: function(url, data, config) {
						return $q(function(resolve, reject) {
							GM_xmlhttpRequest({
								method: 'POST',
								url: url,
								data: JSON.stringify(data),
								headers: {
									'Content-Type': APPLICATION_JSON,
									Accept: APPLICATION_JSON
								},
								onload: function(gmResponse) {
									var headers = getHeaderFunction(
										gmResponse.responseHeaders
										.split('\n'));
									var responseData = gmResponse.response;

									responseData = defaultHttpResponseTransform(
										responseData, headers);
									var response = {
										data: responseData,
										status: gmResponse.status,
										headers: headers,
										config: config,
										statusText: gmResponse.statusText
									};

									resolve(response);
								},
								onerror: function(gmResponse) {
									var headers = getHeaderFunction(gmResponse
										.responseHeaders.split('\n'));
									var responseData = gmResponse.response;

									responseData = defaultHttpResponseTransform(
										responseData, headers);
									var response = {
										data: responseData,
										status: gmResponse.status,
										headers: headers,
										config: config,
										statusText: gmResponse.statusText
									};

									reject(response);
								}
							});
						});
					}
				};

				/* Methods/properties to implement for full compatibility:
				 *     pendingRequests
				 *     delete
				 *     head
				 *     jsonp
				 *     post
				 *     put
				 *     patch
				 *     defaults
				 */

				return ourHttp;
			});
		};
	})(qcExt.modules || (qcExt.modules = {}));
})(qcExt || (qcExt = {}));
