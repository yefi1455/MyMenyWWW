angular.module('Menu', ['ionic', 'Menu.controllers', 'Menu.services'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('auth', {
                url: "/auth",
                abstract: true,
                templateUrl: "templates/auth.html"
            })
            .state('auth.signin', {
                url: '/signin',
                views: {
                    'auth-signin': {
                        templateUrl: 'templates/auth-signin.html',
                        controller: 'SignInCtrl'
                    }
                }
            })
            .state('auth.signup', {
                url: '/signup',
                views: {
                    'auth-signup': {
                        templateUrl: 'templates/auth-signup.html',
                        controller: 'SignUpCtrl'
                    }
                }
            })

           .state('item', {
                url: "/main",
                abstract: true,
                templateUrl: "templates/main.html"
                //controller: 'myItemDetailCtrl'
            })

            .state('item.list', {
                url: '/list',
                views: {
                    'menu-list': {
                        templateUrl: 'templates/menu-list.html',
                        controller: 'myListCtrl'
                    }
                }
            })

            .state('item.listdet', {
                url: '/list/:ItemId',
                views: {
                    'menu-list': {
                        templateUrl: 'templates/item-detail.html',
                        controller: 'myListDetCtrl'
                    }
                }
            })

    .state('cam', {
        url: '/cam',
        views: {
            'menu-list1': {
                templateUrl: 'templates/index_1.html', //cam.html
                controller: 'CamCtrl'
            }
        }
    })


    $urlRouterProvider.otherwise('/main/list');
    //$urlRouterProvider.otherwise('/auth/signin');
    
 });