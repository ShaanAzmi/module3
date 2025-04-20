(function () {
  'use strict';

  angular.module('NarrowItDownApp', [])
    .controller('NarrowItDownController', NarrowItDownController)
    .service('MenuSearchService', MenuSearchService)
    .directive('foundItems', FoundItemsDirective);

  function FoundItemsDirective() {
    return {
      restrict: 'E',
      scope: {
        foundItems: '<',
        onRemove: '&'
      },
      template: `
        <ul class="list-group">
          <li class="list-group-item" ng-repeat="item in foundItems track by $index">
            <strong>{{ item.name }} ({{ item.short_name }})</strong>: {{ item.description }}
            <button class="btn btn-danger btn-sm float-end" ng-click="onRemove({ index: $index })">
              Don't want this one!
            </button>
          </li>
        </ul>
      `
    };
  }

  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    ctrl.searchTerm = '';
    ctrl.found = [];
    ctrl.nothingFound = false;

    ctrl.narrow = function () {
      if (!ctrl.searchTerm) {
        ctrl.found = [];
        ctrl.nothingFound = true;
        return;
      }

      MenuSearchService.getMatchedMenuItems(ctrl.searchTerm)
        .then(function (foundItems) {
          ctrl.found = foundItems;
          ctrl.nothingFound = foundItems.length === 0;
        });
    };

    ctrl.removeItem = function (index) {
      ctrl.found.splice(index, 1);
    };
  }

  MenuSearchService.$inject = ['$http'];
  function MenuSearchService($http) {
    var service = this;

    service.getMatchedMenuItems = function (searchTerm) {
      return $http({
        method: 'GET',
        url: 'https://coursera-jhu-default-rtdb.firebaseio.com/menu_items.json'
      }).then(function (response) {
        var allItems = response.data.menu_items;
        var foundItems = [];

        for (var i = 0; i < allItems.length; i++) {
          var item = allItems[i];
          if (item.description.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
            foundItems.push(item);
          }
        }

        return foundItems;
      });
    };
  }

})();
