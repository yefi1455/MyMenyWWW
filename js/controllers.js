angular.module('Menu.controllers', ['Menu.services'])

//YK to share item:
.factory('ShareData', function () {
    var shareItem;
})

//-----------Sign In -------------------------------------------
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

//---------Sign Up ----------------------------------------------------------------------
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

//--------- List ----------------------------------------------------------------
.controller('myListCtrl', function ($rootScope, $scope, API, $timeout, $ionicModal, $window) {

    //$scope.data = { item: "" };
    shareItem = { item: "" }; //clear for a New Item
    shareItem._id = -1;

    $rootScope.getBase64FromImageUrl = function (url, document) {

        if (url == '') { return '' } 

        var img = new Image();
        var imgObj = document.getElementById('myImage');
        var canvas = document.createElement("canvas");

        try {
            canvas.width = imgObj.width;
            canvas.height = imgObj.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(imgObj, 0, 0);

            var dataURL = canvas.toDataURL("image/jpg");

            img.src = url;

            return (dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
        }
        catch (e) {
            return '';
        }
    }


    $scope.userHold = '';
    $rootScope.$on('fetchAll', function () {
        //console.log('fetchAll1');
        API.getAll($rootScope.getToken()).success(function (data, status, headers, config) {
            $rootScope.show("Please wait... Processing");
            listMenu = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].item.image) {
                    data[i].item.src = 'data:image/jpg;base64,' + data[i].item.image;
                }
                else {
                    data[i].item.src = '';
                }
                data[i].item.myIndex = i;
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

    $ionicModal.fromTemplateUrl('templates/newItem.html', function (modal) {
        $scope.newTemplate = modal;
    });

    $scope.newItem = function () {
        shareItem._id = -1; //to distinguish new.update

        //$scope.data = { item: "" };
        //shareItem = { item: "" };
        //$scope.$apply()

        $scope.newTemplate.show();
    };


})

//-------- Detail (one Item) -------------------------------------------------
.controller('myListDetCtrl', function ($rootScope, $scope, $stateParams, $window, API, $ionicModal) {
    $scope.item1 = listMenu[$stateParams.ItemId];// API.get($stateParams.ItemId);
    //document.getElementById('myImage').src = 'data:image/jpg;base64,' + $scope.item1.ImageURI; //10/09/15 added 'data:image/jpg;base64,' + 
    
    shareItem = $scope.item1;

    $scope.goBack = function () { $window.location.href = ('#/main/list'); }

    //$scope.dupdItem = function (id) {
    //    $rootScope.show("Please wait... Updating");
    //    API.updateItem(id, $rootScope.getToken())
    //        .success(function (data, status, headers, config) {
    //            $rootScope.hide();
    //            $scope.goBack();
    //            //$rootScope.doRefresh(1);
    //        }).error(function (data, status, headers, config) {
    //            $rootScope.hide();
    //            $rootScope.notify("Oops something went wrong!! Please try again later");
    //        });
    //}

    $scope.editItem = function (id) {

        $ionicModal.fromTemplateUrl('templates/newItem.html', function (modal) { //updItem.html
            $scope.newTemplateUpd = modal;
        });

        $scope.$apply();

        $scope.newTemplateUpd.show(); 
        
        //works, but without ionic: $window.location.href = '/templates/newItem.html';
    }
    
    $scope.delItem = function (id) {
        $rootScope.show("Please wait... Deleting from List");
        API.deleteItem(id, $rootScope.getToken())
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $scope.goBack();
                $rootScope.doRefresh(1);
            }).error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
    }
})

//--------- New Item --------------------------------------------------------------
.controller('newCtrl', function ($rootScope, $scope, $ionicModal, API, $window, $state, $location) {//, GetUU) {

    //$scope.$on('$ionicView.enter', function () {
    //    $scope.data = shareItem.item;
    //    $scope._id = shareItem._id;
    //});

    //YK temp(?) - only for new $scope.data = {item: ""};
    $scope.data = shareItem.item;
    $scope._id = shareItem._id;


    $ionicModal.fromTemplateUrl('templates/cam.html', function (modal) { //was cam.html
        $rootScope.camTemplate = modal;
    });

    $scope.getimage = function () {
        $rootScope.camTemplate.show();
        //$scope.getPicture();
    };
    
    $scope.removeimage = function () {
        $scope.data.ImageURI = '';
        document.getElementById('myImage').src = $scope.data.ImageURI; 
        $scope.$apply();
        //$scope.data.src = '';
    }

    $scope.close = function () { $scope.modal.hide(); $scope.data = { item: "" }; }; //clear data not to show it for another item. 
                                                                     
    $scope.createNew = function () { 

        //doesn't help $scope.$apply();  
        var item;

        var imageBase64 = $rootScope.getBase64FromImageUrl(shareItem.ImageURI, document); //10/09/15 $scope.data.ImageURI, document);

        //document.getElementById('myImage').src = 'data:image/jpg;base64,' + imageBase64; //10/09/15 

        if (shareItem._id == -1) {
            item = {
                name:        document.getElementById("name").value,
                description: document.getElementById("description").value,
                rating:      document.getElementById("rating").value,
                price:       document.getElementById("price").value,
                cuisine:     document.getElementById("cuisine").value,
                spicelevel:  document.getElementById("spicelevel").value,
                vegetarian:  document.getElementById("vegetarian").value,
                vegan:       document.getElementById("vegan").value,
                nuts:        document.getElementById("nuts").value,
                image: imageBase64
            };
        }
        else {
            item = {
                name:        this.data.name,
                description: this.data.description,
                rating:      this.data.rating,
                price:       this.data.price,
                cuisine:     this.data.cuisine,
                spicelevel:  this.data.spicelevel,
                vegetarian:  this.data.vegetarian,
                vegan:       this.data.vegan,
                nuts:        this.data.nuts,
                image:       imageBase64
            };
        }
        if (!item) return;

        $scope.modal.hide();
        $rootScope.show();
            
        if ($scope._id == -1) {
            $rootScope.show("Please wait... Creating new");
        } else {
            $rootScope.show("Please wait... Updating");
        }
        
        var form = {
            item: item,
            user: $rootScope.getToken(),
            created: Date.now(),
            updated: Date.now()
        }

        if (($scope._id == -1)  || ($scope._id ==undefined)) {
            API.saveItem(form, form.user)
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
                //$scope.data.ImageURI = 
            })
            .error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
        }
        else {
            API.updateItem($scope._id, form, '')
                .success(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.doRefresh(1);
                })
                .error(function (data, status, headers, config) {
                    $rootScope.hide();
                    $rootScope.notify("Oops something went wrong!! Please try again later");
                });
        }
    };
})

//------------ Camera --------------------------------------------------------
.controller('CamCtrl', ['$rootScope', '$scope', '$location', //, 'GetUU',
	function ($rootScope, $scope, $location) { //, GetUU) {
	    // init variables
	    $scope.data = { "ImageURI": "Select Image" };
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
	        destinationType = navigator.camera.DestinationType.FILE_URI; //DATA_URL;//YK!
	    });

	    // get upload URL for FORM
	    //GetUU.query(function (response) {
	    //    $scope.data = response;
	    //    //console.log("got upload url ", $scope.data.uploadurl);
	    //});

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
                    //10/09/15 $scope.mypicture = "data:image/jpeg;base64," + imageURI;
                    $scope.data.ImageURI = imageURI;
        
                    $scope.update(); 
                    //alert(imageURI);
                },
                function (err) {
                    console.log("got camera error ", err);
                    // error handling camera plugin
                },
                options);
	    }; //takePicture


	    $scope.update = function () {
	        $rootScope.camTemplate.hide(); //YK! - temp?'$scope', '$location', 'GetUU',
	        document.getElementById('myImage').src = $scope.data.ImageURI;
	        shareItem.ImageURI = $scope.data.ImageURI;

	        //var myBlob = dataURItoBlob($scope.data.ImageURI);
	        return; //YK!

	        /*
	        //$scope.data.uploadurl = GetUU.query();

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

	        //YK - try to make a blob:
	        var f1 = new File("My File", $scope.mypicture)
	        //YK end make a blob
	        
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
	        */
	    };
}
]
) 
/*
.controller('updCtrl', function ($rootScope, $scope, $stateParams, $window, API, $ionicModal) {  //YK try to separate
    $scope.data = shareItem.item;
    $scope._id = shareItem._id;

    $scope.updItem = function () {
        var k = 1;
        
        var imageBase64 = $rootScope.getBase64FromImageUrl($scope.data.ImageURI, document);
        var item = {
            name:        this.data.name, 
            description: this.data.description, 
            price:       this.data.price,
            cuisine:     this.data.cuisine,
            spicelevel:  this.data.spicelevel,
            vegetarian:  this.data.vegetarian,
            vegan:       this.data.vegan,
            nuts:        this.data.nuts,
            image:       imageBase64
        };
        if (!item) return;

        $scope.modal.hide();
        $rootScope.show();
            
        $rootScope.show("Please wait... Updating");

        var form = {
            item: item,
            user: $rootScope.getToken(),
            created: Date.now(),
            updated: Date.now()
        }

        API.updateItem($scope._id, form, '')
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
            })
            .error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
        
    }//updItem

})
*/
;
