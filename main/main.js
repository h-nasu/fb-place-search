'use strict';

angular.module('myApp.main', ['ngRoute', 'uiGmapgoogle-maps', 'duScroll' /*'infinite-scroll'*/])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/main', {
    templateUrl: 'main/main.html',
    controller: 'MainCtrl'
  });
}])

.controller('MainCtrl', ['$rootScope', '$scope', 'uiGmapGoogleMapApi', 'placeFactory', 'filterListFactory', '$document',
function($rootScope, $scope, uiGmapGoogleMapApi, placeFactory, filterListFactory, $document) {
  $scope.makers = [];
  $scope.cat = {};
  $scope.filteredPlaces = [];
  $scope.listPlaces = [];
  $scope.placeDetail = '';
  $scope.marker = '';
  
  // Forever Scroll
  // $scope.pageSize = 10;
  
  $scope.map = {
    center: {
      latitude: $rootScope.queryLatitude,
      longitude: $rootScope.queryLongitude
    },
    zoom: 14,
    bounds: {}
  };
  $scope.options = {
    //scrollwheel: false
  };
  $scope.selected = '';
  
  $scope.loadMap = function(place){
    
    var makeMaker = function (obj){
      var ret = {
        latitude: obj.location.latitude,
        longitude: obj.location.longitude,
        title: obj.name,
        id: obj.id,
        show: false,
        category: obj.category,
        likes: obj.likes,
        checkins: obj.checkins,
        talking: obj.talking_about_count,
        link: obj.link,
        website: obj.website,
        cover: obj.cover ? obj.cover.picture : ''
      };
      ret.onClick = function(a){
        ret.show = !ret.show;
        $scope.loadPhotos(false, obj);
        $scope.selected = ret.id;
        if (a) $scope.$apply();
      };
      return ret;
    };
    if (place) {
      $scope.makers = [
        makeMaker(place)
      ];
      $scope.makers[0].onClick(false);
    } else if ($scope.filteredPlaces) {
      $scope.makers = $scope.filteredPlaces.map(function(obj){
        return makeMaker(obj);
      });
    }
    $document.scrollToElement(angular.element(document.getElementById('googleMap')), 10, 500);
  };
  
  $scope.showMakerWindow = function(id) {
    var place = _.find($scope.filteredPlaces, function(obj){return obj.id == id;});
    $scope.loadMap(place);
    $scope.loadPhotos(false, place);
  };
  
  $scope.loadPhotos = function(id, detail) {
    $scope.placeDetail = false;
    if (id) {
      var detail = _.find($scope.filteredPlaces, function(obj){return obj.id == id;});
    } else {
      id = detail.id;
    }
    var photos = [];
    var finLoadPhotos = function(d, p){
      $scope.$apply(function(){
        d.photos = p; 
        $scope.placeDetail = d;
      });
    };
    placeFactory.getPhotos(id, {limit:20}, function(res){
      if (res.data.length) {
        _.each(res.data, function(el, i){
          photos[i] = {
            thumbnail: el.picture,
            fullImage: el.source
          };
          if (res.data.length <= (i+1)) {
            finLoadPhotos(detail, photos);
            setTimeout(function(){
              $('#placePhotos').magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery:{
                  enabled:true
                }
              });
            }, 1000);
          }
        });
      } else {
        finLoadPhotos(detail, photos);
      }
    });
    
  };
  
  /*
  $scope.loadMore = function() {
    $scope.pageSize += $scope.pageSize;
  };
  */
  
  $scope.$watch('cat.flCategory', function(){
    $scope.makers = [];
    $scope.placeDetail = '';
  }, true);
  
  /*
  $scope.$on('ngRepeatStart', function(ngRepeatFinishedEvent) {
    $rootScope.spinner.spin('spinner-1');
  });
  
  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    $rootScope.spinner.stop('spinner-1');
  });
  */
  
  $rootScope.$on('places', function(ev){
    if (typeof $rootScope.places.data != 'undefined') {
      $scope.makers = [];
      $scope.searchPosition();
      $scope.listPlaces = $rootScope.places.data;
      $scope.categories = filterListFactory.getCatogories($rootScope.places.data);
      $scope.map = {
        center: {
          latitude: $rootScope.queryLatitude,
          longitude: $rootScope.queryLongitude
        },
        zoom: 14,
        bounds: {}
      };
      setTimeout(function(){ 
        $scope.cat.flCategory = '--Select--';
        $scope.$apply();
        $rootScope.spinner.stop('spinner-1');
      }, 1000);
    } else {
      
    }
  });
  
  $scope.coordsUpdates = 0;
  $scope.dynamicMoveCtr = 0;
  
  $scope.searchPosition = function(){
    $scope.marker = {
      id: 0,
      coords: {
        latitude: $rootScope.queryLatitude,
        longitude: $rootScope.queryLongitude
      },
      options: { draggable: true },
      icon: { url:'img/me.png' },
      events: {
        dragend: function (marker, eventName, args) {
          $rootScope.queryLatitude = marker.getPosition().lat();
          $rootScope.queryLongitude = marker.getPosition().lng();
          $scope.marker.myLocation = 'http://maps.google.com?q='+$rootScope.queryLatitude+','+$rootScope.queryLongitude;
        }
      },
      show: false,
      onClick: function(a){
        this.show = !this.show;
        if (a) $scope.$apply();
      },
      myLocation: 'http://maps.google.com?q='+$rootScope.queryLatitude+','+$rootScope.queryLongitude
    };
    $scope.map.center = {
      latitude: $rootScope.queryLatitude,
      longitude: $rootScope.queryLongitude
    };
  };
  
  $scope.$watchCollection("marker.coords", function (newVal, oldVal) {
    if (_.isEqual(newVal, oldVal))
      return;
    $scope.coordsUpdates++;
  });
  
  $rootScope.$on('myPosition', function(){
    $scope.searchPosition();
  });
  
  $scope.sendTo = function(link){
    link = link ? link : $scope.marker.myLocation;
    console.log(link);
    FB.ui({
      method: 'send',
      link: link
    });
  };
  
  $scope.copyMessage = function() {
    alert('Copied to clip board!');
  };
  
}]);