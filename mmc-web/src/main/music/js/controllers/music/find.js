'use strict';

angular.module('mmcApp')
.controller('musicListCtrl', ['$scope', 'musicService', 'userService', 'refValues', 'appService', 'utils', 
function ($scope, musicService, userService, refValues, appService, utils) {

 $scope.$on('music', function(event, args) {
  $scope.list(0);	 
 });
 
 $scope.selectItem = function(index) {
  appService.nav().index = index;
 };
	
 $scope.list = function (page) {
  $scope.action = { 'result' : -1};	 
  musicService.getDocs(appService.app().query, page, false, 'music', 'json', function(response) {
   $scope.totalPages = response.totalPages;
   $scope.action.result = 0; 
   $scope.docsInfos = [];
   var idxDoc;
   var doc;
   
   appService.setNav(newNavFromListResponse(response));
   
   for (idxDoc in response.docs) {
	 var doc = response.docs[idxDoc];
	 var lines = [];
	 var docInfos = {'id' : doc.id, 'url' : doc.thumbImageUrl, 'title' : doc.title
			 , 'line1' : '', 'line2' : '', 'line3' : '', 'line4' : ''};
	 $scope.docsInfos.push(docInfos);
	 
	 docInfos.sleeveGrade = doc.sleeveGrade;
	 docInfos.recordGrade = doc.recordGrade;
	 docInfos.sleeveGradeTip = refValues.getGradeToString(doc.sleeveGrade);
	 docInfos.recordGradeTip = refValues.getGradeToString(doc.recordGrade);
	 docInfos.origin = doc.origin;
	 
	 docInfos.line1 = doc.artist;
	 docInfos.line2 = appendToLine(docInfos.line2, doc.issue);

	 docInfos.line2 = appendToLine(docInfos.line2, doc.mainType, function(value) {
      if (doc.nbType != null && doc.nbType > 1) {
       return doc.nbType + ' ' + value;
	  }
      return value;	
     });
  
	 docInfos.line2 = appendToLine(docInfos.line2, response.reEdition, function(value) {
   	  return value ? 're-edition' : '';   
     });  
	 
	 docInfos.line2 = appendToLine(docInfos.line2, doc.promo, function(value) {
	  return value == true ? 'promo' : '';   
     });
   
   	 docInfos.line3 = appendToLine(docInfos.line3, doc.serialNumber, function(value) {
	  return 'N°' + value;   
     });
	 docInfos.line3 = appendToLine(docInfos.line3, doc.pubNum, function(value) {
	  return 'Limited Edition : ' + value + '/' + doc.pubTotal;   
     });
	 
	 docInfos.line4 = appendToLine(docInfos.line4, doc.recordCompany);
	 docInfos.line4 = appendToLine(docInfos.line4, doc.label);
   }
   
   var navigHtml = '';
   
   if (response.totalPages > 1) {
    var currentPage = response.page + 1; // premiere page est 0
    var i=1;
    var j=0;
    navigHtml = '<ul class="pagination">';
    for (i = 1; i <= response.totalPages; i++) {
     j=i-1; 
     navigHtml+= '<li';
     if (response.page == j) {
      navigHtml += ' class="active"';
     }
     navigHtml += '><a href ng-click="list('+j+')">' + i + '</a></li>';
    }
    navigHtml += '</ul>';
   }
  
   $scope.navigation = navigHtml;   

  }, function() {
   $scope.action.result = 1;	  
  });
 };

 musicService.clearCache('music');
 $scope.list(0);
 
}]);


angular.module('mmcApp').controller('musicListingCtrl', ['$scope', 'appService', 'musicService', '$sce', 
function ($scope, appService, musicService, $sce) {
 $scope.wating = true;
 $scope.listing=true;
 musicService.getDocs(appService.app().query, -1, false, 'music', 'pdf', function(response) {
  $scope.listing = $sce.trustAsResourceUrl(URL.createObjectURL(new Blob([response], {type: 'application/pdf'})));
  $scope.wating = false;
 });
}]);
