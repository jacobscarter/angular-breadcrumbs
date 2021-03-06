/**
 * Easy to use breadcrumbs for AngularJS
 * @version v1.1.3 - 2015-08-04 * @link https://github.com/jacobscarter/jsc-breadcrumbs
 * @author Jacob Carter <jacob@ieksolutions.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
var jscBreadcrumbs = angular.module('jscBreadcrumbs', ['templates-jscBreadcrumbs']);

jscBreadcrumbs.directive('jscBreadcrumbs', ['$rootScope', '$log', '$state', '$stateParams', 'JSCBreadcrumbs',
    function ($rootScope, $log, $state, $stateParams, JSCBreadcrumbs) {

        return {
            restrict: 'E',
            scope: {
                backbutton : "=",
                breadcrumbtrail : "="
            },
            replace: true,
            templateUrl: 'template.html',
            link: function ($scope, $element, $attrs) {

                $scope.backButtonShow = false;
                $scope.breadcrumbTrailShow = false;

                if($scope.backbutton){
                    $scope.backButtonShow = true;
                }
                if($scope.breadcrumbtrail){
                    $scope.breadcrumbTrailShow = true;
                }

                var breadcrumbs;
                $scope.trailArray = [];
                //this stores the state you just left via backButton
                var backButtonState



                //making sure the breadcrumbs array in directive scope is up to date with the breadcrumbs stored
                //in local storage
                if(sessionStorage.getItem('jscBreadcrumbs') && angular.isArray(JSON.parse(sessionStorage.getItem('jscBreadcrumbs')))){
                    breadcrumbs = JSON.parse(sessionStorage.getItem('jscBreadcrumbs'));
                } else {
                    breadcrumbs = [];
                }                

                
                //if the state has a hide param we wont show breadcrumbs
                if($stateParams.breadcrumbs && $stateParams.breadcrumbs.doNotShow === true){
                    JSCBreadcrumbs.breadcrumbData.hide = true;
                }

                $scope.hide = JSCBreadcrumbs.breadcrumbData.hide;                
                
                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

                    if(sessionStorage.getItem('jscBreadcrumbs') && angular.isArray(JSON.parse(sessionStorage.getItem('jscBreadcrumbs')))){
                        breadcrumbs = JSON.parse(sessionStorage.getItem('jscBreadcrumbs'));
                    }


                    


                    //hide breadcrumbs logic
                    if(toState.data && toState.data.breadcrumbs && toState.data.breadcrumbs.doNotShow === true){
                        JSCBreadcrumbs.breadcrumbData.hide = true;
                        $scope.hide = JSCBreadcrumbs.breadcrumbData.hide;
                    } else {
                        JSCBreadcrumbs.breadcrumbData.hide = false;
                        $scope.hide = JSCBreadcrumbs.breadcrumbData.hide;
                    }


                    //check to stop duplicate adding of states for multiple loading of directive
                    //this is why I hate digest cycle sometimes...
                    if(fromState.data && fromState.data.breadcrumbs && fromState.data.breadcrumbs.name){
                        var breadcrumbName = fromState.data.breadcrumbs.name;
                    } else {
                        var breadcrumbName = fromState.name;
                    }
                    if(fromState.name.length > 0){
                        breadcrumbs.push({
                            name : breadcrumbName,
                            state : fromState,
                            params : fromParams
                        });
                        firstLoop = false;
                    } 



                    //check stateParam to see if state should not be stored
                    //this is one of the last steps done!
                    if(fromState.data && fromState.data.breadcrumbs && fromState.data.breadcrumbs.doNotStore){
                        $scope.breadcrumbPop();
                    }

                    //resetting breadcrumb if fromState matches reset state
                    if(toState.data && toState.data.breadcrumbs && toState.data.breadcrumbs.reset){
                        breadcrumbs.length = 0;
                    }
                
                    sessionStorage.setItem('jscBreadcrumbs', JSON.stringify(breadcrumbs));
                    $scope.trailArray = breadcrumbs;


                    //if breadcrumbs array is empty we wont show breadcrumbs
                    if(breadcrumbs.length === 0){
                        JSCBreadcrumbs.breadcrumbData.hide = true;
                        $scope.hide = true;
                    }

                    


                    

                });




                //used to remove last item from breadcrumb array
                $scope.breadcrumbPop = function(){
                    breadcrumbs.pop();
                    updateStorage(breadcrumbs);  
                };

                //function to update sessionStorage
                function updateStorage(breadcrumbData){
                    sessionStorage.setItem('jscBreadcrumbs', JSON.stringify(breadcrumbData));
                }

                function updateBreadCrumbs(){
                    breadcrumbs = JSON.parse(sessionStorage.getItem('jscBreadcrumbs'));
                }

                $scope.backButton = function(){
                    updateBreadCrumbs();
                    var breadcrumbObject = breadcrumbs[breadcrumbs.length - 1];
                    $state.go(breadcrumbObject.state.name, breadcrumbObject.params);
                    breadcrumbs.splice(breadcrumbs.length -2, 2);
                    sessionStorage.setItem('jscBreadcrumbs', JSON.stringify(breadcrumbs));
                    if(breadcrumbs.length === 0){
                        JSCBreadcrumbs.breadcrumbData.hide = true;
                        $scope.hide = JSCBreadcrumbs.breadcrumbData.hide = true;
                        sessionStorage.removeItem('jscBreadcrumbs');
                    }
                };

                $scope.breadcrumbClick = function(index) {
                    $state.go(breadcrumbs[index].state.name, breadcrumbs[index].params);
                    breadcrumbs.splice(breadcrumbs.length -2, 2);
                    sessionStorage.setItem('jscBreadcrumbs', JSON.stringify(breadcrumbs));
                    if(breadcrumbs.length === 0){
                        JSCBreadcrumbs.breadcrumbData.hide = true;
                        $scope.hide = JSCBreadcrumbs.breadcrumbData.hide = true;
                        sessionStorage.removeItem('jscBreadcrumbs');
                    }
                };
                //end Breadcrumbs


            } // link

        }; // return

    }
]);
angular.module('templates-jscBreadcrumbs', ['template.html']);

angular.module("template.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template.html",
    "<div class=\"jscbreadcrumbs\">\n" +
    "	<div class=\"back-button\" ng-hide=\"hide\" ng-click=\"backButton()\" ng-if=\"backButtonShow\">\n" +
    "		<a>BACK</a>\n" +
    "	</div>\n" +
    "	<div class=\"breadcrumb-trail\" ng-if=\"breadcrumbTrailShow\" ng-hide=\"hide\">\n" +
    "		<ul>\n" +
    "			<li ng-repeat=\"item in trailArray\" ng-click=\"breadcrumbClick($index)\">{{item.name}} /</li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "</div>");
}]);

jscBreadcrumbs.factory('JSCBreadcrumbs', ['$rootScope', '$state', '$log', '$timeout',
	function ($rootScope, $state, $log, $timeout) {



	//breadcrumbs
	var breadcrumbsArray = [];
	var breadcrumbData = {};
	breadcrumbData.hide = true;
	

	var breadcrumbsPop = function(){
		breadcrumbsArray = JSON.parse(sessionStorage.getItem('jscBreadcrumbs'));
		breadcrumbsArray.pop();
		sessionStorage.setItem('jscBreadcrumbs', JSON.stringify(breadcrumbsArray));
		//return breadcrumbs;
	};

	var breadcrumbs = function(){
		breadcrumbsArray = JSON.parse(sessionStorage.getItem('jscBreadcrumbs'));
		return breadcrumbsArray;
	}


	return {
		breadcrumbs : breadcrumbs,
		breadcrumbsPop : breadcrumbsPop,
		breadcrumbData : breadcrumbData
	}

}]);