'use strict';

angular.module('myApp.service', [])

.factory('placeFactory', function($rootScope){
  return({
    'getPlaces': function(params, cb){
      FB.api('/search', 'get', params, cb);
    },
    'getPage': function(id, cb){
      FB.api(id, cb);
    },
    'getPhotos': function(id, params, cb){
      FB.api('/'+id+'/photos', 'get', params, cb);
    }
  });
})
.factory('filterListFactory', function($rootScope){
  return({
    'getCatogories': function(placesData){
      var list = ['--Select--'];
      for (var i in placesData) {
        for (var i2 in placesData[i].category_list) {
          if (list.indexOf(placesData[i].category_list[i2].name) == -1 
          && typeof placesData[i].category_list[i2].name != 'undefined') {
            list.push(placesData[i].category_list[i2].name);
          }
        }
      }
      return list;
    },
  });
});