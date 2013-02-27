var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
	document.addEventListener('batterylow', this.onBatteryLow, false);
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);
	
	$(document).bind( 'mobileinit', function(){
		  $.mobile.loader.prototype.options.html = "";
		  $.support.touchOverflow = true;
	    	  $.mobile.touchOverflowEnabled = true;
	});

	$(window).bind( 'orientationchange', function(event){
		refreshScroll();
	    });	
    },
    deviceready: function() {
         var topPositionOfSearchDiv= $("#imageLogoDiv").height();
         $("#searchDiv").css('top', topPositionOfSearchDiv+5+'px');
    },
	onBatteryLow: function(info) {
        	alert("Battery Level Low " + info.level + "%"); 
 	},
	
	checkConnection : function(networkState){
		if(networkState == false){
			alert('No network connection');
			return false;
		}
		else{
			return true;
		}
	},

	calculateDatePostedTime : function(datePosted){
		var currentDate = new Date(); 
		var postedDate=datePosted.split('T')[0];
		postedDate=postedDate.replace (/-/gi, '/');
		var postedDate=new Date(postedDate);
		var dateDiff=(currentDate.getTime()-postedDate.getTime())/1000;
		var time='';
		if(dateDiff<86400){
			var hrs =dateDiff/3600;
			if(hrs <= 1){
				if(hrs<0.60){
					hrs = Math.floor(hrs*100);
					time=hrs+" minutes ago"
				}
				else{
					time = "1 hour ago";
				}
			}
			else 
				time = Math.floor(hrs) + " hours ago";
		}
						
		else{
			var day = Math.floor(dateDiff/86400);
			if(day == 1)
				time = day + " day ago";
			else
				time = day + " days ago";
		}
		return time;
	},
	
	recentSearchClick :function (searchKey){
	//	$('#recentSearchString').css('color','#FFA500');
		searchKey=searchKey.split('">')[1];
		searchKey=searchKey.split('<')[0];
		$("#searchTextBox").val(searchKey);
		findJobs();
	}
};

var pageNumber=1, totalNoOfPage,listJobScroll,jobDetailScroll,searchPageScroll;
var recentSearchJobList= [];
var availableEmails= []; 

$(document).ready(function() {

	    $(document).delegate('#listView','pageshow',function(e) {
			refreshScroll();
			var topPositionOfSearchResultDiv= $(".scalaJobHeader").height();
			$("#searchHeadingResult").css('top', topPositionOfSearchResultDiv+'px');
			$("#jobDetailsContent").css('top', topPositionOfSearchResultDiv+'px');
	    });
	
	   $("#indexPage").bind("pageshow", function(e) {
		$('#recentSearchDiv').css('display','block');	
		$("#searchTextBox").val('');
		$('#suggestions > *').remove();
		$('#suggestions').append('<li><span id="recentSearch">Recent Searches</span></li><hr style="color:#A5A1A0"/>')
		if( recentSearchJobList.length > 3){
			recentSearchJobList.shift();
		}

		for(var i=recentSearchJobList.length-1;i>=0;i--){
				$('#suggestions').append('<li onclick="app.recentSearchClick(this.innerHTML);"><span id="recentSearchString">'+recentSearchJobList[i]+'</span><img src="images/arrow.png" align="right" id="arrowImage"/></li><hr/>')
		}
		$('#suggestions').append('<li><br/></li>');
		refreshScroll();
	  });

	$(document).on("tap", "#searchHeadingResult ul a li",function(e){ 

		$(this).css("color", "#426685");
		id=$(this).find('input').attr('value');
		showLoadingImage();
        if(device.platform == 'iOS')
                addBackButtonToiOSApp();
		$.mobile.changePage( "#jobDetailsContainer");
		HideDialog();
		addJobDetailsToPage(id);
	});
});


function loaded() {
	listJobScroll = new iScroll('searchHeadingResult',{hScroll: false});
	jobDetailScroll=new iScroll('jobDetails',{hScroll: false, bounce : false, momentum:false});
	searchPageScroll = new iScroll('searchDiv', {
        	useTransform: false,
		bounce : false, 
		momentum:false,
        	onBeforeScrollStart: function (e) {
		    var target = e.target;
		    while (target.nodeType != 1) target = target.parentNode;

		    if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
		        e.preventDefault();
		}
   	 });
}

function findJobs(){
	var value= checkSearchStringValidity();
	if (value == ' ' || value == ''){
		alert('Enter valid search string');
	}
	else{
		var connectionStatus=app.checkConnection(window.navigator.onLine);
		if(connectionStatus == true){
			showListJobsPage(value);
		}
	}
}

function checkSearchStringValidity(){
	var idToGet = $("#searchTextBox").attr('value');
	var clearString= idToGet.replace(/[`~!#@@$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ')
	var value= clearString.replace(/\s{2,}/g, ' ');
	return value;
}

function addMoreJobsToList(){
	pageNumber++;
	var searchStringValue=$('#searchTextBox').val();
	if( totalNoOfPage >= pageNumber){
	showLoadingImage();
	  $.getJSON(" http://www.scalajobz.com/getJobsForACriteria/"+searchStringValue+"?page="+pageNumber+"&jobsPerPage=25",function(data) {
		
		addJobsToList(data.results);
		refreshScroll();
		hideLoadingImage();
	   });
	}
}

function showListJobsPage(value){
        	
		var searchValue=value;
			if (searchValue.length > 10){
				searchValue=searchValue.substring(0,9);
				searchValue+="...";
			}
		if( jQuery.inArray(searchValue, recentSearchJobList) < 0 )
			recentSearchJobList.push(searchValue);
		pageNumber=1;
		
		$.mobile.changePage( "#listView",null,true,true);
		showLoadingImage();
		$("#listContent").css("display", "none");
		$('ul#thelist > *').remove();
		$.getJSON(" http://www.scalajobz.com/getJobsForACriteria/"+value+"?page="+pageNumber+"&jobsPerPage=25",function(data) {
			$("#listContent").css("display", "block");
			$('ul#thelist > *').remove();
			if(data.responseDescription !=undefined){
				if(data.responseDescription.totalResults == 1){
					var result='result found';
				}
				else{
					var result='results found';
				}
		
				totalNoOfPage= Math.ceil(data.responseDescription.totalResults / 25);
				$('ul#thelist').append("<li id='searchHeadingList' style='background-color:#EEEEEE;'><div id='searchHeadingStringDiv'><div id='searchStringDiv'><span id=searchString>"+searchValue+"</span><span id='totalNoOfResult'><h3>"+data.responseDescription.totalResults+" "+result+ "</h3></span></div><div id='seachHeadingBtn' align='right'><a href='#indexPage' data-role='button' id='searchButtonOnList' data-inline='true'>Search</a></div></div></li><br/>");

				addJobsToList(data.results);
				
			}
			else{
				$('ul#thelist').append("<li id='noResultFoundList'><b>"+data.alertType+"</b></li><br/>");
				$('ul#thelist').append('<li style="text-align:center"><div id="searchAgainBtn" class="listview-buttons"><a href="#indexPage" data-role="button">Search Again</a></div></li><br/>');
				
		  	}
			$('#searchAgainBtn').children('a').buttonMarkup();
			$('#searchButtonOnList').buttonMarkup();
			refreshScroll();
			listJobScroll.scrollTo(0,0,100);
			setTimeout(function()
			{
				hideLoadingImage();
			},500);
		});
	
}

function setAutoCompleteValueToTextBox(searchValue){
			$('#emailTextBox').val(searchValue);
			$('ul#emailSuggestions').css('display','none');
}

function ShowDialog()
        {
            
	$("#jobDetailsContent").fadeTo("slow", 0.33);
	$("#emailTextBox").val('');
	$("#emailTextBox").autocomplete({
			target: $('#emailSuggestions'),
			source: availableEmails,
			minLength: 1,
			matchFromStart: false
		});
	$("#dialog").fadeIn(100);
        }

 function HideDialog()
        {
            $("#dialog").fadeOut(100);
	    $("#jobDetailsContent").fadeTo("slow", 1);
        } 
 function applyToJobLink(urlAddress){
	window.open(urlAddress, "_blank");
}

function showAutoCompleteBox(){
	$('ul#emailSuggestions').css('display','block');
}

function emailJob(){
	var email = $("#emailTextBox").val();
	var jobId= $("#hiddenId").val();
                var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
                if (pattern.test(email)){
			if( jQuery.inArray(email, availableEmails) < 0 )
				availableEmails.push(email);
	              	HideDialog();
                	$.getJSON("http://www.scalajobz.com/sendJobDetailMail?emailId="+email+"&jobId="+jobId,function(data) {
                		alert(data.message);
                	});
                }
                else{
                	alert('Enter correct email address');
                }
}

function addJobsToList(results){
	for(i in results){

		var time= app.calculateDatePostedTime(results[i].datePosted);
		$('ul#thelist').append("<a class='listItemLink'><li><input type='hidden' class='hiddenId' value='"+results[i].jobId+"'/><b>"+results[i].position+"</b><br/> "+results[i].company+" <img src='images/arrow.png' align='right' id='arrowImage'/><br/>"+results[i].location+"<br/><span id='datePosted'>"+time+"</span></li></a><hr/>");
		}

}

function addJobDetailsToPage(jobId){
	$.getJSON("http://www.scalajobz.com/getJobDetail/"+jobId,function(data) {
		var applyContactString="" ;
		var skills="";
		$('#jobDescription > *').remove();
		hideLoadingImage();
		if(data.contactType=='url'){
			applyContactString="Click to apply:<br/><a id='jobDetailLink'  class='ui-link' rel='external' target='_blank' data-ajax='false'><span class='jobValues' id='"+data.contactAddress+"' onclick='applyToJobLink(this.id);'>"+data.tinyUrl+"</span></a><br/><hr/>";

		}
					
		else{
			applyContactString="Email address to apply:<br/><a href='#'><span class='jobValues'>"+data.contactAddress+"</span></a><br/><hr/>";
		}
					
		var skillsCollection=data.skillsRequired;
		for(i in skillsCollection){
			if(skills=="")
				skills=skillsCollection[i];
			else
				skills=skills+","+skillsCollection[i];
		}
		$('ul#jobDescription').append('<li style="background-color:#EEEEEE;padding:0;"><div class="listview-buttons"> <a href="#indexPage" data-role="button" style="width:30%;margin:4% 0.5% 4% 17%;" data-inline="true">Search</a><a href="#" onclick="ShowDialog();" data-role="button" style="width:30%;margin:4% 13% 4% 0.5%" data-inline="true">Email</a></div></li>');
		$('ul#jobDescription').append("<li><span><h3><u>"+data.position+" - "+data.location+"</u></h3><br/>"+
								"<input type='hidden' id='hiddenId' value='"+jobId+"'/>"+
								"Company:<br/><span class='jobValues'>"+data.company+"</span><br/><br/>"+
								"JobType:<br/><span class='jobValues'>"+data.jobType+"</span><br/><br/>"+
								"Skills Required:<br/><span class='jobValues'>"+skills+"</span><br/><br/>"+
 							"Date Posted:<br/><span class='jobValues'>"+data.datePosted+"</span><br/><br/>"+
								applyContactString+
								data.description+"</span><br/><br/></li>");
					$('ul#jobDescription').append('<li style="padding:0;"><div class="listview-buttons" id="bottomSearchJobDiv"><a href="#indexPage" data-role="button" data-inline="true">Search for more jobs</a></div></li><br/><br/><br/>');
					
		$('.listview-buttons').children('a').buttonMarkup();
		refreshScroll();
		jobDetailScroll.scrollTo(0,0,100);
					
	});
}

function refreshScroll(){
		searchPageScroll.refresh();
        	listJobScroll.refresh();
		jobDetailScroll.refresh();
}

function showLoadingImage(){
	$("#loadingImageDiv").css("display", "block");
}

function hideLoadingImage(){
	$("#loadingImageDiv").css("display", "none");
}

function addBackButtonToiOSApp(){
        $('div#backBtnForiOS').remove();
        $('#jobDetailsContainer .scalaJobHeader').append("<div id='backBtnForiOS'><img id='backArrowImage' src='images/back.png' onclick='goBack();'/></div>");
}

function goBack() {
        $('img#backArrowImage').attr('src','images/enable.png');
        history.back();
        return false;
    }
