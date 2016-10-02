angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, AuthService, $localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = $localStorage.getObject('userinfo','{}');
  $scope.reservation = {};
  $scope.registration = {};
  $scope.loggedIn = false;

  if(AuthService.isAuthenticated()) {
      $scope.loggedIn = true;
      $scope.username = AuthService.getUsername();
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function () {
      $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function () {
      $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userinfo',$scope.loginData);

      AuthService.login($scope.loginData);

      $scope.closeLogin();
  };

  $scope.logOut = function() {
     AuthService.logout();
      $scope.loggedIn = false;
      $scope.username = '';
  };

  $rootScope.$on('login:Successful', function () {
      $scope.loggedIn = AuthService.isAuthenticated();
      $scope.username = AuthService.getUsername();
  });


  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
      scope: $scope
  }).then(function (modal) {
      $scope.registerform = modal;
  });

  // Triggered in the register modal to close it
  $scope.closeRegister = function () {
      $scope.registerform.hide();
  };

  // Open the register modal
  $scope.register = function () {
      $scope.registerform.show();
  };

  $scope.doRegister = function () {
      console.log('Doing registration', $scope.registration);
      $scope.loginData.username = $scope.registration.username;
      $scope.loginData.password = $scope.registration.password;

      AuthService.register($scope.registration);
      AuthService.login($scope.loginData);
      $scope.closeRegister();
  };

  $rootScope.$on('registration:Successful', function () {
      $localStorage.storeObject('userinfo',$scope.loginData);
  });

})

.controller('SkillsCtrl', ['$scope', '$rootScope', 'Customer', 'Competence', 'Skill', function ($scope, $rootScope, Customer, Competence, Skill) {
    $scope.showContent = false;
    $scope.message = "Loading ...";


    function getDirections() {
        if ($rootScope.currentUser) {
        Customer.directions({id:$rootScope.currentUser.id, "filter":
            {"include":{"relation":"profiles", "scope": {"include":{"relation":"competences","scope":{"include":"skills"}}}}}
            })
            .$promise.then(
            function (response) {
                $scope.directions = response;
                console.log("Got directions from server: ", $scope.directions)
                $scope.showContent = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
        }
        else{
            $scope.message = "You are not logged in"
        }
    };
    getDirections()

    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
        } else {
          $scope.shownGroup = group;
        }
    };

    $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
    };

    $scope.editCompetence = function(index) {
        //alert("Editing competence: "+ index);
        $scope.editingCompetence = index;
    };

    $scope.saveCompetence = function(competence) {
    //    alert("Saving competence: "+ competence.name);
        Competence.prototype$updateAttributes({id: competence.id}, competence, function (instance) {
			console.log(instance);
		});
        competence.skills.forEach(function(entry){
            Skill.prototype$updateAttributes({id: entry.id}, entry, function (instance) {
			console.log(instance);
    		});
        });
        $scope.editingCompetence = null;
        getDirections();
    };

    $scope.addNewSkill = function(id){
        ("Adding new skill to competence "+id);
        var newName = prompt("Please enter name of the skill");
		if (newName) {
			Customer.skills.create({id:$rootScope.currentUser.id}, {"name":newName, "competenceId":id})
            .$promise.then(
            function (response) {
                console.log("Skill created:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
		};
    };

    $scope.removeSkill = function(id){
        if(confirm("Removing skill: "+id)){
		Customer.skills.destroyById({id:$rootScope.currentUser.id, fk:id})
            .$promise.then(
            function (response) {
                console.log("Skill deleted:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    };

    $scope.addNewCompetence = function(id){
        var newName = prompt("Please enter name of the competence");
		if (newName) {
			Customer.competences.create({id:$rootScope.currentUser.id}, {"name":newName, "profileId":id})
            .$promise.then(
            function (response) {
                console.log("Competence created:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
		};
    };

    $scope.removeCompetence = function(id){
        if(confirm("Removing competence: "+id)) {
		Customer.competences.destroyById({id:$rootScope.currentUser.id, fk:id})
            .$promise.then(
            function (response) {
                console.log("Competence deleted:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    };
    $scope.addNewProfile = function(direction){
        alert("Adding new profile to direction "+direction.name);
        var newName = prompt("Please enter name of the profile");
		if (newName) {
			Customer.profiles.create({id:$rootScope.currentUser.id}, {"name":newName, "directionId":direction.id})
            .$promise.then(
            function (response) {
                console.log("Profile created:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
		};
    };

    $scope.removeProfile = function(profile){
        if(confirm("Removing profile: "+profile.name)) {
		Customer.profiles.destroyById({id:$rootScope.currentUser.id, fk:profile.id})
            .$promise.then(
            function (response) {
                console.log("Profile deleted:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    };

    $scope.addNewDirection = function(){
        var newName = prompt("Please enter name of the direction");
		if (newName) {
			Customer.directions.create({id:$rootScope.currentUser.id}, {"name":newName})
            .$promise.then(
            function (response) {
                console.log("Direction created:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
		};
    };

    $scope.removeDirection = function(direction){
        if(confirm("Removing direction: "+direction.name)) {
		Customer.directions.destroyById({id:$rootScope.currentUser.id, fk:direction.id})
            .$promise.then(
            function (response) {
                console.log("Direction deleted:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    };

    $scope.editDirection = function(id){
        var newName = prompt("Please enter name of the direction");
        if (newName) {
            Customer.directions.updateById({id:$rootScope.currentUser.id, fk: id}, {"name":newName})
            .$promise.then(
            function (response) {
                console.log("Direction updated:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    }

    $scope.editProfile = function(id){
        var newName = prompt("Please enter new name of the profile");
        if (newName) {
            Customer.profiles.updateById({id:$rootScope.currentUser.id, fk: id}, {"name":newName})
            .$promise.then(
            function (response) {
                console.log("Profile updated:  ", response)
                getDirections();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    }


    $scope.log = function(){
        console.log($scope.data);
    };
}])

.controller('AchievCtrl', ['$scope', '$rootScope', '$ionicModal', 'Customer', 'Achievement',
 function ($scope, $rootScope, $ionicModal, Customer, Achievement) {
    $scope.showContent = false;
    $scope.message = "Loading ...";


    function toDate(dateStr) {
        var parts = dateStr.split("/");
        return new Date(parts[2], parts[0]-1, parts[1]);
    }

    function getAchievements() {
        if ($rootScope.currentUser) {
        Customer.achievements({id:$rootScope.currentUser.id, "filter":
            {"include":{"relation":"skills"}}
            })
            .$promise.then(
            function (response) {
                $scope.achievements = response;
                console.log("Got achievements from server: ", $scope.achievements)
                $scope.showContent = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            });
        }
        else{
            $scope.message = "You are not logged in"
        }
    };
    getAchievements()

    $scope.addNewAchievement = function (){
        $scope.editingAchievement = false;
        $scope.newAchiv = {};
        $scope.achievementForm = true;
    };

    $scope.editAchievement = function (achiv){
        $scope.achievementForm = true;
        $scope.editingAchievement = true;
        $scope.newAchiv = {name:achiv.name, id:achiv.id };
    };

    $scope.postAchievement = function() {
          $scope.achievementForm = false;
          console.log($scope.newAchiv);

        if(!$scope.editingAchievement){
          Customer.achievements.create({id:$rootScope.currentUser.id}, {"name":$scope.newAchiv.name, "date":$scope.newAchiv.date})
            .$promise.then(
            function (response) {
                console.log("Achievement created:  ", response)
                getAchievements();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        } else {
             Customer.achievements.updateById({id:$rootScope.currentUser.id, fk:$scope.newAchiv.id}, {"name":$scope.newAchiv.name, "date":$scope.newAchiv.date})
            .$promise.then(
            function (response) {
                alert("Achievement updated:  "+response);
                console.log("Achievement updated:  ", response);
                getAchievements();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        }
    };
    $scope.removeAchievement = function(achiv){
        if(confirm("Removing achievement: "+achiv.name)){
        Customer.achievements.destroyById({id:$rootScope.currentUser.id, fk:achiv.id})
            .$promise.then(
            function (response) {
                console.log("Achievement deleted:  ", response)
                getAchievements();
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            });
        };
    };

}]);
