'use strict';

angular.module('myApp.version.filter', [])
.filter('interpolate', ['version', function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);

angular.module('myApp.filter', [])
.filter('filterCategory', function() {
  return function(input, arg) {
    if (arg && arg != '--Select--') {
      return input.filter(function(obj){
        if (obj.category_list) {
          for (var i in obj.category_list) {
            if (obj.category_list[i].name == arg) {
              return obj;
            }
          }
        }
      });
    } else {
      return input;
    }
  };
});
