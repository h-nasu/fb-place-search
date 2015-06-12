'use strict';

// angular.element($0).scope()
var angularRoot;
var latitude = '13.75';
var longitude = '100.516667';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.main',
  'myApp.service',
  'myApp.filter',
  'myApp.directive',
  'ngAnimate',
  'angularSpinner',
  'ui.bootstrap',
  'geolocation',
  'ngClipboard'
  //'ngLoadingSpinner'
]).
config(['$routeProvider', 'ngClipProvider', function($routeProvider, ngClipProvider) {
  //$routeProvider.otherwise({redirectTo: '/view1'});
  $routeProvider.otherwise({redirectTo: '/main'});
  ngClipProvider.setPath("//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.1.6/ZeroClipboard.swf");
}]).
run(['$rootScope', 'placeFactory', 'usSpinnerService', 'geolocation',
function($rootScope, placeFactory, usSpinnerService, geolocation){
  $rootScope.currentUser = false;
  $rootScope.places = [];
  
  $rootScope.query = 'bar';
  $rootScope.queryLatitude = latitude;
  $rootScope.queryLongitude = longitude;
  $rootScope.queryLimit = 10;
  $rootScope.queryType = 'place';
  $rootScope.queryDistance = 50000;
  $rootScope.searchLoadFlg = false;
  $rootScope.geoResult = '';
  
  $rootScope.spinner = usSpinnerService;
  
  $rootScope.countries = _.sortBy(countries, function(obj){ return obj.CountryName });
  
  $rootScope.countryUpdate = function(){
    $rootScope.queryLatitude = $rootScope.selCountry.CapitalLatitude;
    $rootScope.queryLongitude = $rootScope.selCountry.CapitalLongitude;
    $rootScope.geoResult = '';
  };
  
  $rootScope.geoLoc = function(){
    geolocation.getLocation().then(function(data){
      $rootScope.queryLatitude = data.coords.latitude;
      $rootScope.queryLongitude = data.coords.longitude;
      $rootScope.geoResult = 'Your location is set for search.';
      $rootScope.$emit('myPosition');
    });
  };
  
  $rootScope.alerts = [];

  $rootScope.addAlert = function(type, msg) {
    $rootScope.alerts.push({type: type, msg: msg});
  };

  $rootScope.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  };
  
  $rootScope.search = function(paging){
    $rootScope.searchLoadFlg = false;
    $rootScope.spinner.spin('spinner-1');
    $rootScope.alerts = [];
    $rootScope.geoResult = '';
    
    if (paging) {
      var params = paging.split('?');
      $rootScope.queryParams = JSON.parse('{"' + decodeURI(params[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
      $rootScope.queryParams.q = $rootScope.queryParams.q.replace(/\+/g, ' '); 
    } else {
      $rootScope.queryParams = {
        q:$rootScope.query,
        type:$rootScope.queryType,
        center:[$rootScope.queryLatitude,$rootScope.queryLongitude].join(),
        distance:$rootScope.queryDistance,
        limit:$rootScope.queryLimit
      };
    }
    
    placeFactory.getPlaces($rootScope.queryParams, function(res){
      $rootScope.places = res;
      if ($rootScope.places.data.length) {
        $rootScope.places.data.forEach(function(el, i , arr){
          placeFactory.getPage(el.id, function(detail){
            var checkFin = function(){
              if ($rootScope.places.data.length <= i+1) {
                $rootScope.searchLoadFlg = true;
                $rootScope.$emit('places');
                //$rootScope.$apply();
              }
            };
            $rootScope.places.data[i] = detail;
            if (detail.cover) {
              placeFactory.getPage(detail.cover.cover_id, function(res){
                $rootScope.places.data[i].cover.picture = res.picture;
                checkFin();
              });
            } else {
              checkFin();
            }
          });
        });
      } else {
        $rootScope.$emit('places');
        $rootScope.addAlert('danger', 'No Result Found!');
        $rootScope.spinner.stop('spinner-1');
      }
    });
  };
  
  $rootScope.statusChangeCallback = function(response) {
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      FB.api('/me', function(response) {
        $rootScope.currentUser = response;
        $rootScope.$apply();
        $rootScope.search();
        setTimeout(function(){
          $rootScope.selCountry = $rootScope.countries[215];
        }, 1000);
      });
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      $rootScope.currentUser = false;
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      $rootScope.currentUser = false;
    }
  }
  
  $rootScope.checkLoginState = function() {
    FB.getLoginStatus(function(response) {
      $rootScope.statusChangeCallback(response);
    });
  }
  
  $rootScope.logout = function() {
    FB.logout(function(response) {
      location.reload();
    });
  }
  
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1608774846056023',
      cookie     : true, 
      xfbml      : true, 
      version    : 'v2.3'
    });
    FB.getLoginStatus(function(response) {
      $rootScope.statusChangeCallback(response);
    });
  };
  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  angularRoot = $rootScope;
  
}]);


