'use strict';

angular
  .module('starter.services',[])
  .factory('AuthService', ['Customer', '$q', '$rootScope', '$ionicPopup', '$localStorage',
    function(Customer, $q, $rootScope, $ionicPopup, $localStorage) {
    function login(loginData) {
      return Customer
        .login(loginData)
        .$promise
        .then(function(response) {
          $rootScope.currentUser = {
            id: response.user.id,
            tokenId: response.id,
            username: loginData.username
          };
          $rootScope.$broadcast('login:Successful');
        },
        function(response){

              var message = '<div><p>' +  response.data.error.message +
                  '</p><p>' + response.data.error.name + '</p></div>';

               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Login Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Login Failed!');
                });
        });
    }

    function isAuthenticated() {
        if ($rootScope.currentUser) {
            return true;
        }
        else{
            if ($localStorage.get("userinfo") != null)
            {
                $rootScope.currentUser = {
                    id: $localStorage.get("$LoopBack$currentUserId"),
                    tokenId: $localStorage.get("$LoopBack$accessTokenId"),
                    username: $localStorage.getObject("userinfo").username
                };
                console.log("Got credentials from localstorage: ",$rootScope.currentUser);
                return true;
            } else{
                return false;
            }
        }
    }

    function getUsername() {
        return $rootScope.currentUser.username;
    }

    function logout() {
      return Customer
       .logout()
       .$promise
       .then(function() {
         $rootScope.currentUser = null;
       });
    }

    function register(registerData) {
      return Customer
        .create({
         username: registerData.username,
         email: registerData.email,
         password: registerData.password
       })
       .$promise
      .then (function(response) {

        },
        function(response){

              var message = '<div><p>' +  response.data.err.message +
                  '</p><p>' + response.data.err.name + '</p></div>';

               var alertPopup = $ionicPopup.alert({
                    title: '<h4>Registration Failed!</h4>',
                    template: message
                });

                alertPopup.then(function(res) {
                    console.log('Registration Failed!');
                });

        });
    }

    return {
      login: login,
      logout: logout,
      register: register,
      isAuthenticated: isAuthenticated,
      getUsername: getUsername
    };
  }])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])
;
