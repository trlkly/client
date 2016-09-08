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

/* global constants */

var qcExt;

(function(qcExt) {
	'use strict';
	
	function makeid() {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
			'0123456789';

		for (var i = 0; i < 24; i++) {
			text += possible.charAt(Math.floor(Math.random() *
				possible.length));
		}

		return text;
	}
	
	qcExt.app.directive('qcDraggable', ['eventFactory', '$log',
		function(Event) {
		var dragStartEvent = new Event(constants.dragStartEvent);
		var dragEndEvent = new Event(constants.dragEndEvent);
		
		return {
			restrict: 'A',
			scope: {
				dragStart: '&',
				dragEnd: '&',
				dragType: '@',
				dragData: '@'
			},
			link: function(scope, element) {
				angular.element(element).attr('draggable', 'true');

				var id = angular.element(element).attr('id');
				if (!id) {
					id = makeid();
					angular.element(element).attr('id', id);
				}

				element.bind('dragstart', function(e) {
					var transferData = {
						id: id,
						dragType: scope.dragType,
						dragData: scope.dragData
					};
					e.originalEvent.dataTransfer.setData('application/json',
						JSON.stringify(transferData));
					dragStartEvent.notify(transferData);
					$(element).addClass('qc-dragging');
					scope.dragStart();
				});

				element.bind('dragend', function() {
					dragEndEvent.notify();
					$(element).removeClass('qc-dragging');
					scope.dragEnd();
				});
				
			}
		};
	}]);

	qcExt.app.directive('qcDropTarget', ['eventFactory', '$log',
		function(Event, $log) {
		var dragStartEvent = new Event(constants.dragStartEvent);
		var dragEndEvent = new Event(constants.dragEndEvent);
		
		return {
			restrict: 'A',
			scope: {
				dropped: '&',
				acceptTypes: '@'
			},
			link: function(scope, element) {
				var id = angular.element(element).attr('id');
				if (!id) {
					id = makeid();
					angular.element(element).attr('id', id);
				}
				
				function isAcceptableType(dragType) {
					if (!scope.acceptTypes) {
						$log.warn('acceptTypes is unset');
						return false;
					}
					var acceptedTypes = scope.acceptTypes.split(',');
					$log.debug('isAcceptableType', dragType, acceptedTypes);
					var accepted = false;
					angular.forEach(acceptedTypes, function(type) {
						if (type === dragType) {
							accepted = true;
						}
					});
					return accepted;
				}

				element.bind('dragover', function(e) {
					e.preventDefault();
					e.stopPropagation();

					e.originalEvent.dataTransfer.dropEffect = 'move';
					return false;
				});

				element.bind('dragenter', function(e) {
					angular.element(e.target).addClass('qc-drag-over');
				});

				element.bind('dragleave', function(e) {
					angular.element(e.target).removeClass('qc-drag-over');
				});

				element.bind('drop', function(e) {
					e.preventDefault();

					var data = null;
					try {
						data = JSON.parse(e.originalEvent.dataTransfer
							.getData('application/json'));
					} catch(error) {
						// Just in case somebody drops something random on us...
						return;
					}
					
					if (isAcceptableType(data.dragType)) {
						scope.$apply(function() {
							scope.dropped({dropData: data});
						});
					}
				});

				dragStartEvent.subscribe(scope, function(event, transferData) {
					if (isAcceptableType(transferData.dragType)) {
						angular.element(element).addClass('qc-drop-target');
					}
				});

				dragEndEvent.subscribe(scope, function() {
					angular.element(element).removeClass('qc-drop-target');
					angular.element(element).removeClass('qc-drag-over');
				});
			}
		};
	}]);
})(qcExt || (qcExt = {}));
