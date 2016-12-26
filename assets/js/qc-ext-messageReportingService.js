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

	qcExt.app.service('messageReportingService', ['$log', '$timeout',
		function($log, $timeout) {
			$log.debug('START messageReportingService()');
			
			var messageQueue = [];
			var isProcessing = false;
			
			function processMessages() {
				isProcessing = true;
				
				var nextMessage = messageQueue.shift();
				if (typeof nextMessage === 'undefined') {
					isProcessing = false;
					return;
				}
				
				var unique = Math.random().toString(36).slice(-5);

				var messageHtml = '<div class="alert alert-' +
					nextMessage.type + '" ' +
					'id="' + unique + '" ' +
					'style="display: none;" ' +
					'role="alert">' +
					nextMessage.message +
					'</div>';

				$('#messageSeat').append(messageHtml);
				var messageElement = $('#' + unique);
				messageElement.slideDown();

				function removeMessage() {
					messageElement.slideUp(
						function() {
							messageElement.remove();
							processMessages();
						});
				}

				var timeoutHandle = $timeout(removeMessage, 5000, false);

				messageElement.click(function() {
					$timeout.cancel(timeoutHandle);
					removeMessage();
				});
			}

			function reportMessage(type, message) {
				messageQueue.push({type: type, message: message});
				if (!isProcessing) { processMessages(); }
			}

			this.reportError = function(message) {
				reportMessage('danger', message);
			};

			$log.debug('END messageReportingService()');
		}]);
})(qcExt || (qcExt = {}));
