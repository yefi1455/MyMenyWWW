angular.module('Menu.controllers', ['Menu.services'])
.controller('SignInCtrl', function ($rootScope, $scope, API, $window) {
    // if the user is already logged in, take him to his Menu
    //$rootScope.setToken(""); //YK temp
    if ($rootScope.isSessionActive()) {
        $window.location.href = ('#/main/list'); 
    }

    $scope.user = {
        email: "",
        password: ""
    };

    $scope.validateUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        if(!email || !password) {
        	$rootScope.notify("Please enter valid credentials");
        	return false;
        }
        $rootScope.show('Please wait.. Authenticating');
        API.signin({
            email: email,
            password: password
        }).success(function (data) {
            $rootScope.setToken(email); // create a session kind of thing on the client side
            $rootScope.hide();
            $window.location.href = ('#/main/list');
        }).error(function (error) {
            $rootScope.hide();
            $rootScope.notify("Invalid Username or password");
        });
        //$rootScope.hide();                               //YK - temp
        //$rootScope.notify("Oops Username or password"); //YK - temp
    }

})

.controller('SignUpCtrl', function ($rootScope, $scope, API, $window) {
    $scope.user = {
        email: "",
        password: "",
        name: ""
    };

    $scope.createUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        var uName = this.user.name;
        if(!email || !password || !uName) {
        	$rootScope.notify("Please enter valid data");
        	return false;
        }
        $rootScope.show('Please wait.. Registering');
        API.signup({
            email: email,
            password: password,
            name: uName
        }).success(function (data) {
            $rootScope.setToken(email); // create a session kind of thing on the client side
            $rootScope.hide();
            $window.location.href = ('#/main/list');
        }).error(function (error) {
            $rootScope.hide();
        	if(error.error && error.error.code == 11000)
        	{
        		$rootScope.notify("A user with this email already exists");
        	}
        	else
        	{
        		$rootScope.notify("Oops something went wrong, Please try again!");
        	}
            
        });
    }
})

.controller('myListCtrl', function ($rootScope, $scope, API, $timeout, $ionicModal, $window) {
    $scope.userHold = '';
    $rootScope.$on('fetchAll', function () {
        //console.log('fetchAll1');
            API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
            $rootScope.show("Please wait... Processing");
            listMenu = [];
            for (var i = 0; i < data.length; i++) {
                listMenu.push(data[i]);
            };
            if (listMenu.length == 0)
            {
                $scope.noData = true;
            }
            else
            {
                $scope.listMenu = listMenu;
                $scope.noData = false;
            }

            $ionicModal.fromTemplateUrl('templates/newItem.html', function (modal) {
                $scope.newTemplate = modal;
            });

            $scope.newItem = function () {
                $scope.newTemplate.show();
            };

            $rootScope.logout = function () {
                $rootScope.setToken("");
                $window.location.href = '#/auth/signin';
            };

            $rootScope.hide();

        }).error(function (data, status, headers, config) {
            $rootScope.hide();
            $rootScope.notify("Oops something went wrong!! Please try again later");
        });
    })
;

    $rootScope.$broadcast('fetchAll');

    $scope.deleteItem = function (id) {
        $rootScope.show("Please wait... Deleting from List");
        API.deleteItem(id, $rootScope.getToken())
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
            }).error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
    };

})

.controller('myListDetCtrl', function ($rootScope, $scope, $stateParams) {
    $scope.item1 = listMenu[$stateParams.ItemId].item;// API.get($stateParams.ItemId);
        //$scope.item1=1

  
})

.controller('newCtrl', function ($rootScope, $scope, $ionicModal, API, $window, $state) {

    $ionicModal.fromTemplateUrl('templates/index_1.html', function (modal) { //was cam.html
        $rootScope.camTemplate = modal;
    });

    $scope.getimage = function () {
        //$window.location.href = '#/list/cam';
        $rootScope.camTemplate.show();
        //$state.go('/cam');
    };

    //$scope.takePicture = function () {
    //    var i=1
    //}

    $scope.data = {
	        item: ""
	    };

        $scope.close = function () {
            $scope.modal.hide();
        };

        $scope.createNew = function () {
            var item = {
                name:        this.data.name,
                description: this.data.description,
                price:       this.data.price,
                cuisine:     this.data.cuisine,
                spicelevel:  this.data.spicelevel,
                vegetarian:  this.data.vegetarian,
                vegan:       this.data.vegan,
                nuts:        this.data.nuts
            };
        	if (!item) return;
            $scope.modal.hide();
            $rootScope.show();
            
            $rootScope.show("Please wait... Creating new");

            var form = {
                item: item,
                //YK isCompleted: false,
                user: $rootScope.getToken(),
                created: Date.now(),
                updated: Date.now()
            }

            API.saveItem(form, form.user)
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.doRefresh(1);
                })
                .error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });
        };
})

.controller('CamCtrl', ['$scope', '$location', 'GetUU',
	function ($scope, $location, GetUU) {

	    // init variables
	    $scope.data = {};
	    $scope.obj;
	    var pictureSource;   // picture source
	    var destinationType; // sets the format of returned value
	    var url;

	    // on DeviceReady check if already logged in (in our case CODE saved)
	    ionic.Platform.ready(function () {
	        //console.log("ready get camera types");
	        if (!navigator.camera) {
	            // error handling
	            return;
	        }
	        //pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
	        pictureSource = navigator.camera.PictureSourceType.CAMERA;
	        destinationType = navigator.camera.DestinationType.FILE_URI;
	    });

	    // get upload URL for FORM
	    GetUU.query(function (response) {
	        $scope.data = response;
	        console.log("got upload url ", $scope.data.uploadurl);
	    });

	    // take picture
	    $scope.takePicture = function () {
	        //console.log("got camera button click");
	        var options = {
	            quality: 50,
	            destinationType: destinationType,
	            sourceType: pictureSource,
	            encodingType: 0
	        };
	        if (!navigator.camera) {
	            // error handling
	            return;
	        }
	        navigator.camera.getPicture(
                function (imageURI) {
                    //console.log("got camera success ", imageURI);
                    $scope.mypicture = imageURI;
                    //alert(imageURI);
                },
                function (err) {
                    console.log("got camera error ", err);
                    // error handling camera plugin
                },
                options);
	    };

	    // do POST on upload url form by http / html form    
	    $scope.update = function (obj) {
	        $scope.data.uploadurl = GetUU.query();

	        if (!$scope.data.uploadurl) {
	            // error handling no upload url
	            return;
	        }
	        if (!$scope.mypicture) {
	            // error handling no picture given
	            return;
	        }
	        var options = new FileUploadOptions();
	        options.fileKey = "ffile";
	        options.fileName = $scope.mypicture.substr($scope.mypicture.lastIndexOf('/') + 1);
	        options.mimeType = "image/jpeg";
	        options.chunkedMode = false; //YK
	        options.headers = {Connection: "close"}; //YK
	        var params = {};
	        //YK params.other = obj.text; // some other POST fields
	        options.params = params;

	        //console.log("new imp: prepare upload now");
	        var ft = new FileTransfer();
	        ft.upload($scope.mypicture, encodeURI($scope.data.uploadurl), uploadSuccess, uploadError, options, true);
	        function uploadSuccess(r) {
	            // handle success like a message to the user
	            var i = 1;
	        }
	        function uploadError(error) {
	            //console.log("upload error source " + error.source);
	            //console.log("upload error target " + error.target);
	            var i = 1;
	        }
	    };
	}])

;
