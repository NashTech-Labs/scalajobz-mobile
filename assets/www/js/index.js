var pageNumber=1, totalNoOfPage,value='',time='',id='';
var availableTags= [];
var availableEmails= [];
 
var myScroll,jobDetailScroll;
function loaded() {
	myScroll = new iScroll('searchHeadingResult',{ hScroll: false, hideScrollbar:false, desktopCompatibility:true});
	jobDetailScroll=new iScroll('jobDetails',{ hScroll: false, hideScrollbar:false, bounce : false, momentum:false, 			desktopCompatibility:true});
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);

$(document).ready(function() {

	$( document ).bind( 'mobileinit', function(){
		  $.mobile.loader.prototype.options.text = "loading";
		  $.mobile.loader.prototype.options.textVisible = false;
		  $.mobile.loader.prototype.options.theme = "a";
		  $.mobile.loader.prototype.options.html = "";
		  $.support.touchOverflow = true;
	    	  $.mobile.touchOverflowEnabled = true;
	});
	
	document.addEventListener("deviceready", onDeviceReady, true);

   $(window).bind( 'orientationchange', function(event){
	$("#loadingImageDiv").css("display", "block");
	if(event.orientation){
      		if(event.orientation == 'portrait'){	
			document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);
                 	myScroll.refresh();
			jobDetailScroll.refresh();
      		}
      		else  {	
			document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);
                    	myScroll.refresh();
			jobDetailScroll.refresh();
      		}
	}
   	 $("#loadingImageDiv").css("display", "none");
    });
	
	 $(document).delegate('#listView','pageshow',function(e) {
			myScroll.refresh();
	    	});
	$(document).delegate('#jobDetailsContainer','pageshow',function(e) {
			jobDetailScroll.refresh();
	    	});
	
	$("#indexPage").bind("pageshow", function(e) {
		$('#recentSearchDiv').css('display','block');	
		$("#searchTextBox").val('');
		$('#suggestions > *').remove();
		$('#suggestions').append('<li><span id="recentSearch">Recent Searches</span></li><hr style="color:#A5A1A0"/>')
		if( availableTags.length > 3){
			availableTags.shift();
		}

		for(var i=availableTags.length-1;i>=0;i--){
				$('#suggestions').append('<li onclick="recentSearchClick(this.innerHTML);"><span id="recentSearchString">'+availableTags[i]+'</span><img src="images/arrow.png" align="right" id="arrowImage"/></li><hr/>')
		}
		
	});

	$('#searchTextBox').on('input',function(e){
		$('ul#suggestions').show();
	});
	
	$('#emailTextBox').on('input',function(e){
		$('ul#emailSuggestions').show();
	});
	
	$("#btnShowDialog").click(function (e)
            {
                ShowDialog();
                e.preventDefault();
            });

   	$("#btnClose").click(function (e)
            {
                HideDialog();
                e.preventDefault();
            });

     $("#btnSubmit").click(function (e)
            {
                var email = $("#emailTextBox").val();
                var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
                if (pattern.test(email)){
			if( jQuery.inArray(email, availableEmails) < 0 )
				availableEmails.push(email);
	               	HideDialog();
                	$.getJSON("http://www.scalajobz.com/sendJobDetailMail?emailId="+email+"&jobId="+id,function(data) {
                		alert(data.message);
                	});
                	
                }
                else{
                	alert('Enter correct email address');
                }
		e.preventDefault();
       });

	$('#jobDetailsContainer').live("tap", function(event){
	     $('#popupEmailButton').show("fast");
	     setTimeout(function() {
		 $('#popupEmailButton').hide();
	    	}, 5000);
		e.preventDefault();
	});


	$(document).on("tap", "#searchHeadingResult ul a li",function(e){ 

			  $(this).css("color", "#336699");
			  id=$(this).find('input').attr('value');
			   $("#loadingImageDiv").css("display", "block");
			  $.mobile.changePage( "#jobDetailsContainer");
			 	HideDialog();
			  $('#popupEmailButton').show("fast");
			  $.getJSON("http://www.scalajobz.com/getJobDetail/"+id,function(data) {
					var applyContactString="" ;
					var skills="";
					$('#jobDescription > *').remove();
					$("#loadingImageDiv").css("display", "none");
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
					$('ul#jobDescription').append('<li style="background-color:#EEEEEE;padding:0;line-height:20px;"><div class="listview-buttons"> <a href="#indexPage" data-role="button" style="width:40%;margin:2% 5%" data-inline="true">Search</a><a href="#" onclick="ShowDialog();" data-role="button" style="width:40%;margin-right:5%" data-inline="true">Email</a></div></li>');

					$('ul#jobDescription').append("<li><span><h3><u>"+data.position+" - "+data.location+"</u></h3><br/>"+
								"Company:<br/><span class='jobValues'>"+data.company+"</span><br/><br/>"+
								"JobType:<br/><span class='jobValues'>"+data.jobType+"</span><br/><br/>"+
								"Skills Required:<br/><span class='jobValues'>"+skills+"</span><br/><br/>"+
 							"Date Posted:<br/><span class='jobValues'>"+data.datePosted+"</span><br/><br/>"+
								applyContactString+
								data.description+"</span><br/><br/></li>");
					$('ul#jobDescription').append('<li style="padding:0;"><div class="listview-buttons" id="bottomSearchJobDiv"><a href="#indexPage" data-role="button" style="width:100%;" data-inline="true">Search for more jobs</a></div></li><br/><br/><br/>');
					
					$('.listview-buttons').children('a').buttonMarkup();
					jobDetailScroll.refresh();
					jobDetailScroll.scrollTo(0,0,100);
					
				});
				
				setTimeout(function() {
        			 	$('#popupEmailButton').hide();
    		 		}, 4000);
			});

});

var onDeviceReady = function() {
        window.addEventListener("batterylow", onBatteryLow, false);
        
        $('#searchbtn').live("tap", function(event){
        	var networkState = navigator.network.connection.type;
        	if($("#searchTextBox").attr('value') != ''){
        		if(networkState == 'none'){
					alert('No network connection');        			
				}
				else{
					var searchValue=$("#searchTextBox").attr('value');
					if( jQuery.inArray(searchValue, availableTags) < 0 )
						availableTags.push(searchValue);
					showListJobsPage();
				}
			}
			else{
				alert('Enter search string');
			}
		});
    };
    
function onBatteryLow(info) {
        alert("Battery Level Low " + info.level + "%"); 
 }

function calculateDatePostedTime(datePosted){
		var currentDate = new Date(); 
		var postedDate=datePosted.split('T')[0];
		postedDate=postedDate.replace (/-/gi, '/');
		var postedDate=new Date(postedDate);
		var dateDiff=(currentDate.getTime()-postedDate.getTime())/1000;
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
}

function addMoreJobsToList(){
	pageNumber++;
	if( totalNoOfPage >= pageNumber){
	  $("#loadingImageDiv").css("display", "block");
	  $.getJSON(" http://www.scalajobz.com/getJobsForACriteria/"+value+"?page="+pageNumber+"&jobsPerPage=25",function(data) {
		
		for(i in data.results){
					var time= calculateDatePostedTime(data.results[i].datePosted);
					$("#loadingImageDiv").css("display", "none");
					$('ul#thelist').append("<a class='listItemLink'><li><input type='hidden' class='hiddenId' value='"+data.results[i].jobId+"'/><b>"+data.results[i].position+"</b><br/>"+data.results[i].company+" <br/>"+data.results[i].location+"<br/><span id='datePosted'>"+time+"</span></li></a><hr/>");
				}
				myScroll.refresh();
			});
		}
}


function showListJobsPage(){
		pageNumber=1;
		$.mobile.changePage( "#listView",null,true,true);
		value=document.getElementById('searchTextBox').value;
	    $("#listContent").css("display", "none");
	    $("#loadingImageDiv").css("display", "block");
	    $('ul#thelist > *').remove();
		$.getJSON(" http://www.scalajobz.com/getJobsForACriteria/"+value+"?page="+pageNumber+"&jobsPerPage=25",function(data) {
			$("#listContent").css("display", "block");
			$("#loadingImageDiv").css("display", "none");
			$('ul#thelist > *').remove();
			if(data.responseDescription !=undefined){
				totalNoOfPage= Math.ceil(data.responseDescription.totalResults / 25);
				$('ul#thelist').append("<li id='searchHeadingList'><div id='searchHeadingStringDiv'><div id='searchStringDiv' style='float:left;width:60%;'><h1 id=searchString>"+value+"</h1><span id='totalNoOfResult'>"+data.responseDescription.totalResults+" results found</span></div><div id='seachHeadingBtn' style='float:right;width:25%;'><a href='#indexPage' data-role='button' id='searchButtonOnList' data-inline='true'>Search</a></div></div></li><br/><br/><br/><br/><br>");

				$("#loadingImageDiv").css("display", "none");
				for(i in data.results){
					var time= calculateDatePostedTime(data.results[i].datePosted);
					$('ul#thelist').append("<a class='listItemLink'><li><input type='hidden' class='hiddenId' value='"+data.results[i].jobId+"'/><b>"+data.results[i].position+"</b><br/> "+data.results[i].company+" <br/>"+data.results[i].location+"<br/><span id='datePosted'>"+time+"</span></li></a><hr/>");
				}
			}
			else{
				$('ul#thelist').append("<li id='searchHeadingList'><h1 id=searchString>"+value+"</h1></li>");
				$('ul#thelist').append("<li><b>"+data.alertType+"</b></li><hr/>");
				$('ul#thelist').append('<li><div class="listview-buttons" style="width:40%;margin: 0 20%;padding:0"><a href="#indexPage" data-role="button">Search again</a></div></li><br/>');
				
		  	}
			$("#loadingImageDiv").css("display", "none");
			$('.listview-buttons').children('a').buttonMarkup();
			$('#searchButtonOnList').buttonMarkup();
		  	$('#searchHeadingResult ul').attr("class","listview");
			$('#searchHeadingResult ul a li').attr('class','listItem');
			myScroll.scrollTo(0,0,100);
			myScroll.refresh();
			
		});
}
function setAutoCompleteValueToTextBox(searchValue){
			$('#emailTextBox').val(searchValue)
			$('ul#emailSuggestions').hide();
		
}

function ShowDialog()
        {
            
	$("#jobDetailsContent").fadeTo("slow", 0.33);
	$("#emailTextBox").val('');
	$("#emailTextBox").autocomplete({
			target: $('#emailSuggestions'),
			source: availableEmails,
			minLength: 1,
			matchFromStart: false,
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

function recentSearchClick(searchKey){
	searchKey=searchKey.split('">')[1];
	searchKey=searchKey.split('<')[0];
	$("#searchTextBox").val(searchKey);
	showListJobsPage();
}
