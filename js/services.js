angular.module('Menu.services', [])
    .factory('API', function ($rootScope, $http, $ionicLoading, $window, $ionicModal) {
        var base = "http://localhost:27018";//9804";//  27017(Bharath)   //YK "http://mainlistapplication.herokuapp.com";
        var listMenu = [' '];
        $rootScope.show = function (text) {
            $rootScope.loading = $ionicLoading.show({
                content: text ? text : 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        };

        $rootScope.hide = function () {
            $rootScope.loading.hide();//YK $ionicLoading.hide();
        };

        $rootScope.notify =function(text){
            $rootScope.show(text);
            $window.setTimeout(function () {
              $rootScope.hide();
            }, 1999);
        };

        $rootScope.doRefresh = function (tab) {
            if(tab == 1)
                $rootScope.$broadcast('fetchAll');
            else
                $rootScope.$broadcast('fetchCompleted');
            
            $rootScope.$broadcast('scroll.refreshComplete');
        };

        $rootScope.setToken = function (token) {
            return $window.localStorage.token = token;
        }

        $rootScope.getToken = function () {
            return $window.localStorage.token;
        }

        $rootScope.isSessionActive = function () {
            return $window.localStorage.token ? true : false;
        }

        return {
            signin: function (form) {
                return $http.post(base + '/api/v1/Menu/auth/login', form);
            },

            signup: function (form) {
                return $http.post(base + '/api/v1/Menu/auth/register', form); //RecipesNew
            },

            getAll: function (email) {
                return $http.get(base +'/api/v1/Menu/data/list', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },

            getOne: function (id, email) {
                return $http.get(base+'/api/v1/Menu/data/item/' + id, {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },

            get: function (itemId) {
                var MenuItem = listMenu[itemId];
                return MenuItem;
            },

            saveItem: function (form, email) {
                return $http.post(base + '/api/v1/Menu/data/item', form, {
                    method: 'POST',
                    params: {
                        token: email
                    }
                });
            },
            putItem: function (id, form, email) {
                return $http.put(base+'/api/v1/Menu/data/item/' + id, form, {
                    method: 'PUT',
                    params: {
                        token: email
                    }
                });
            },
            deleteItem: function (id, email) {
                return $http.delete(base+'/api/v1/Menu/data/item/' + id, {
                    method: 'DELETE',
                    params: {
                        token: email
                    }
                });
            }
        }
    })

// get upload url for file transfer (upload to http post service)
    //"http://localhost:27018/upl";
.factory('GetUU', function () {
    var uploadurl = "http://localhost/upl";  //base + "/upload"; 
    return {
        query: function () {
            return uploadurl;
        }
    }
})
; //
