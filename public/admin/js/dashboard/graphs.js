import grap from './graphs.html';

function graph(Restangular) {
	'use strict';

	return {
		restrict: 'E',
		scope: {},
		controller: function($scope, VisDataSet) {

			$scope.onSelect = function(items) {
				// debugger;
				alert('select');
			};

			$scope.onClick = function(props) {
				//debugger;
				alert('Click');
			};

			$scope.onDoubleClick = function(props) {
				// debugger;
				alert('DoubleClick');
			};

			$scope.rightClick = function(props) {
				alert('Right click!');
				props.event.preventDefault();
			};


			$scope.options = {
				//stack: false,
				//style:'bar',
				//barChart: {width:50, align:'center'}, // align: left, center, right
				//drawPoints: false,


				start: '2017-05-05',
				end: Date.now(),

				editable: true,

				//orientation: 'top'
			};

			var items = [
				{x: '2014-06-11', y: 10},
				{x: '2014-06-12', y: 25},
				{x: '2014-06-13', y: 30},
				{x: '2014-06-14', y: 10},
				{x: '2014-06-15', y: 15},
				{x: '2014-06-16', y: 30}
			];
			// Model Test


		},
		template: grap
	};
}

graph.$inject = ['Restangular'];
export default graph;