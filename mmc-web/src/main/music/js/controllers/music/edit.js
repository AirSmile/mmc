'use strict';

angular.module('mmcApp').controller('musicEditResultCtrl', function($scope, $modalInstance, utils, result) {
 $scope.result = result;
 utils.debug('musicEditResultCtrl doc: ' + JSON.stringify(result));

 /**
  * 
  */
 $scope.closePopup = function(event) {
  if ('back' == event) {
   $modalInstance.close('back');

  } else if ('yesdelete' == event) {
   $modalInstance.close('performDelete');  
  
  } else if ('nodelete' == event) {
	utils.debug('delete cancelled'); 
  }
  
  $modalInstance.close('close');
 };
 
});

angular.module('mmcApp')
.controller('musicEditCtrl', ['$document', '$scope', '$rootScope', '$http', '$location', '$routeParams'
                               ,'userService', 'musicService', 'refValues', 'utils'
                               , 'appService', '$modal', 
function($document, $scope, $rootScope, $http, $location, $routeParams
		, userService, musicService, refValues, utils, appService, $modal) {
 
 /**
  * 
  */
 $scope.initSelectedImages = function() {
  $scope.selectedImages = [];
  if ($scope.doc.images != null && $scope.doc.images.length > 0) {
   utils.debug($scope.doc.images.length + " photo(s)");
   for (var i=0; i < $scope.doc.images.length; i++) {
	$scope.selectedImages.push(false);
   }
  }
 };

 /**
  * 
  */
 $scope.displayPopup = function(booleanResult, docId, action) {
  var modalInstance = $modal.open({
   templateUrl : 'result',
   controller : 'musicEditResultCtrl',
   resolve: {
    result: function () {
 	 return {'ok' : booleanResult, 'id' : docId, 'action' : action};  
    }
   }
  });
  
  modalInstance.result.then(function (event) {
   if ('performDelete' == event) {
	var callback = function() {
	 $location.path('/music_list');
	};
	musicService.remove($scope.doc.id, callback, callback);	   
   } else if ('back' == event) {
    $location.path('/music_view/' + $scope.result.id);  
   }
   utils.debug(event);	  
  });
 };
 
 /**
  * 
  */
 $scope.initUpdatePrices = function() {
  $scope.updatePrices = [];
  // prices
  if ($scope.doc.prices != null) {
	  
   for (var i = 0; i < $scope.doc.prices.length; i++) {
	$scope.updatePrices.push({'value' : $scope.doc.prices[i].price
	                        , 'month' : $scope.doc.prices[i].month
		                    , 'year' : $scope.doc.prices[i].year
		                    , 'display' : 'read'
	                        });
   }    
  }
 };
 
 /**
  * 
  */
 $scope.selectTab = function(tabId) {
  if (typeof($scope.tabs) == 'undefined') {
   $scope.tabs = [];
   $scope.tabs.push({'name':'general','active':true});
   $scope.tabs.push({'name':'purchase','active':false});
   $scope.tabs.push({'name':'photos','active':false});
   $scope.tabs.push({'name':'prices','active':false});   
  }
  
  $scope.tabId = (typeof(tabId) == 'undefined') ? 'general' : tabId; 	

  for (var i = 0 ; i < $scope.tabs.length ; i++) {
   $scope.tabs[i].active = ($scope.tabs[i].name == $scope.tabId) ? true : false;	  
  }
 };

 /**
  * 
  */
 $scope.edit = function(docId, tabId) {
  $scope.selectTab(tabId); 
  $scope.countries = refValues.getCountries();
  $scope.grades = refValues.getGrades();
  $scope.nbTypeRange = refValues.getNbTypeRange();
  $scope.years = refValues.getYears();
  $scope.months = refValues.getMonths();
  $scope.defaultMusicCountry = settings.music.defaultCountry;
  $scope.types = settings.music.types;
  $scope.selectedImages = [];
  $scope.fileItems = [];
  $scope.newPrice = {};
  $scope.updatePrice = {};
  $scope.updatePrices = [];
  $scope.obiColors = refValues.getColors(); 
  utils.debug("$scope.obiColors:"+$scope.obiColors);
  musicService.getDoc(docId, function(response) {
   $scope.doc = response;
   $scope.initSelectedImages();
   $scope.initUpdatePrices();
  }, function() {
	$scope.displayPopup(false, docId, 'edit');	 
  });
 };	
 
 /**
  * 
  */
 $scope.selectImage = function(index) {
  $scope.selectedImages[index] = !$scope.selectedImages[index];
 };
 
 /**
  * 
  */
 $scope.update = function() {
  utils.debug('"Update: ' + JSON.stringify($scope.doc));
  musicService.updateDoc($scope.doc, function() {
	$scope.displayPopup(true, $scope.doc.id, 'save');
    $scope.initUpdatePrices();
    $scope.updatePrice = {};
    $scope.newPrice = {};
   }, function() {
	$scope.displayPopup(false, $scope.doc.id, 'save');	 
   });  
 };
 
 /**
  * 
  */
 $scope.removeFile = function(fileItem) {
  utils.debug('remove "' + fileItem.file.name + '"'); 
  var i = $scope.fileItems.indexOf(fileItem);
  if(i != -1) {
   $scope.fileItems.splice(i, 1);
  }
  utils.debug('files :  ' + $scope.fileItems.length);
 };
 
 /**
  * 
  */
 $scope.uploadFile = function(fileItem) { 
  // status 'i' : init, 'p' : progress, 'o' : ok, 'e' : error  
  var docId = $scope.doc.id;
  utils.debug('upload "' + fileItem.file.name + '", doc: "' + docId + '"');
  fileItem.status='p';
  musicService.uploadPhoto(docId, fileItem.file, function(photo) {
   utils.debug('upload ok "' + fileItem.file.name + '"');
   fileItem.status='o';
   // MAJ LIST
   if ($scope.doc.images == null) {
    $scope.doc.images = [];   
   }
   $scope.doc.images.push(photo);
  }, function() {
   utils.debug('upload error "' + fileItem.file.name + '"'); 	 
   fileItem.status='e';
  });
 };
  
 /**
  * 
  */
 $scope.removePhotos = function() {
  var selectedPhotoIds = []; 
  for (var i=0; i <$scope.selectedImages.length; i++) {
   if ($scope.selectedImages[i]) {
	selectedPhotoIds.push($scope.doc.images[i].id);
   }
  }
  
  if (selectedPhotoIds.length > 0) {
   musicService.removePhotos($scope.doc.id, selectedPhotoIds, function(doc) {
	utils.debug("removePhotos " + selectedPhotoIds + " ok"); 
	$scope.doc = doc;
   }, function() {
	utils.error("removePhotos " + selectedPhotoIds + " ko");
   });
   $scope.initSelectedImages();
  } else {
   utils.debug("nothing to remove");
  }
 };
 
 /**
  * 
  */
 $scope.getGrade = function(value) {
  return refValues.getGradeToString(value);
 }; 
 
 /**
  * 
  */
 $scope.view = function() {
  $location.path('/music_view/' + $scope.doc.id);
 };
 
 /**
  * 
  */
 $scope.remove = function(id) {
  $scope.displayPopup(false, $scope.doc.id, 'delete');
 };  
 
 /**
  * 
  */
 $scope.addNewPrice = function() {
  utils.debug('newPrice:' + JSON.stringify($scope.newPrice));
  $scope.doc.prices.push({'price': $scope.newPrice.value, 'month' : $scope.newPrice.month, 'year' : $scope.newPrice.year});
  $scope.update();
 };
 
 /**
  * 
  */
 $scope.editPrice = function($index) {
  $scope.updatePrices[$index].display = 'edit';
  $scope.updatePrice.value = $scope.updatePrices[$index].value;
  $scope.updatePrice.month = $scope.updatePrices[$index].month;
  $scope.updatePrice.year = $scope.updatePrices[$index].year;
 }
 
 /**
  * 
  */
 $scope.undoEditPrice = function($index) {
  $scope.updatePrices[$index].display = 'read';	 
 }
 
 /**
  * 
  */
 $scope.doUpdatePrice = function($index) {
  $scope.updatePrices[$index].display = 'read';
  $scope.doc.prices[$index].price = $scope.updatePrice.value;
  $scope.doc.prices[$index].month = $scope.updatePrice.month;
  $scope.doc.prices[$index].year = $scope.updatePrice.year;
  utils.debug('updatePrice:' + JSON.stringify($scope.doc.prices[$index]));
  $scope.update();
 }
 
 /**
  * 
  */
 $scope.removePrice = function($index) {
  utils.debug('removePrice:' + JSON.stringify($scope.doc.prices[$index]));
  $scope.doc.prices.splice($index, 1);
  $scope.update();
 }

 $scope.edit($routeParams.musicDocId, $routeParams.tabId);
 
}]);
