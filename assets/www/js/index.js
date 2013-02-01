var pageNumber=1, totalNoOfPage,value='',time='',id='';
 $(document).bind("mobileinit", function() {
  	$.support.touchOverflow = true;
 	$.mobile.touchOverflowEnabled = true;
});
 
 
var myScroll,jobDetailScroll;
function loaded() {
	myScroll = new iScroll('searchHeadingResult',{ hScroll: false, hideScrollbar:false, desktopCompatibility:true});
	jobDetailScroll=new iScroll('jobDetails',{ hScroll: false, hideScrollbar:false, bounce : false, momentum:false, desktopCompatibility:true});
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', function () { setTimeout(loaded, 200); }, false);

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
					$('ul#thelist').append("<a class='listItemLink'><li><input type='hidden' class='hiddenId' value='"+data.results[i].jobId+"'/><b>"+data.results[i].position+"</b><br/> "+data.results[i].company+" <br/>"+data.results[i].location+"<br/><span id='datePosted'>"+time+"</span></li></a><hr/>");
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
			if(data.responseDescription !=undefined){
				totalNoOfPage= Math.ceil(data.responseDescription.totalResults / 25);
				$('ul#thelist').append("<li id='searchHeadingList'><h1 id=searchString>"+value+"</h1><span 					id='totalNoOfResult'>"+data.responseDescription.totalResults+" results found</span></li>");
	    			$("#loadingImageDiv").css("display", "none");
				for(i in data.results){
					var time= calculateDatePostedTime(data.results[i].datePosted);
					$('ul#thelist').append("<a class='listItemLink'><li><input type='hidden' class='hiddenId' value='"+data.results[i].jobId+"'/><b>"+data.results[i].position+"</b><br/> "+data.results[i].company+" <br/>"+data.results[i].location+"<br/><span id='datePosted'>"+time+"</span></li></a><hr/>");
				}
			}
			else{
				$('ul#thelist').append("<li id='searchHeadingList'><h1 id=searchString>"+value+"</h1></li>");
				$('ul#thelist').append("<li><b>"+data.alertType+"</b></li><hr/>");
		  	}
			
		  	$('#searchHeadingResult ul').attr("class","listview");
			$('#searchHeadingResult ul a li').attr('class','listItem');
			myScroll.scrollTo(0,0,100);
			myScroll.refresh();
			
		});
}
function linkClick(url){
		 window.plugins.childBrowser.showWebPage('http://www.google.com', { showLocationBar: true });
//		$.mobile.changePage("#indexPage");

}

$(document).ready(function() {

	$( document ).bind( 'mobileinit', function(){
		  $.mobile.loader.prototype.options.text = "loading";
		  $.mobile.loader.prototype.options.textVisible = false;
		  $.mobile.loader.prototype.options.theme = "a";
		  $.mobile.loader.prototype.options.html = "";
	});

   
   	document.addEventListener("deviceready", onDeviceReady, true);
   //	var ele=document.getElementById('searchHeadingResult');
   //	ele.addEventListener('touchend', positionHandlerEnd, false );
   
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
	
	
	$('#emailTextBox').click(function(){
		//$(this).val("");
	});
	
	$('#searchTextBox').click(function(){
		//$(this).val("");
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
                	HideDialog();
                	$.getJSON("http://www.scalajobz.com/sendJobDetailMail?emailId="+email+"&jobId="+id,function(data) {
                		alert(data.message);
                	});
                	e.preventDefault();
                }
                else{
                	alert('Enter correct email address');
                }
       });

$('#jobDetailsContainer').live("tap", function(event){
     $('#popupEmailButton').show("fast");
     setTimeout(function() {
         $('#popupEmailButton').hide();
    	}, 4000);
        e.preventDefault();
});

$("#searchHeadingResult ul a li").live('tap', function(){
		// $(this).css("color", "#336699");
});
	
$('#jobDetailsContainer').live('pagebeforeshow',function(){
	//$('#listView').hide();
  	//$("#loadingImageDiv").css("display", "block");
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
						applyContactString="Click to apply:<br/><a href='"+data.contactAddress+"' id='jobDetailLink'  class='ui-link' rel='external' target='_blank' data-ajax='false'><span class='jobValues'>"+data.tinyUrl+"</span></a><br/><hr/>";

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
					$('ul#jobDescription').append("<li><span><h3><u>"+data.position+" - "+data.location+"</u></h3><br/>"+
								"Company:<br/><span class='jobValues'>"+data.company+"</span><br/><br/>"+
								"JobType:<br/><span class='jobValues'>"+data.jobType+"</span><br/><br/>"+
								"Skills Required:<br/><span class='jobValues'>"+skills+"</span><br/><br/>"+
 							"Date Posted:<br/><span class='jobValues'>"+data.datePosted+"</span><br/><br/>"+
								applyContactString+
								data.description+"</span><br/><br/><br/></li>");
					
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
 
 function ShowDialog()
        {
            
	$("#jobDetailsContent").fadeTo("slow", 0.33);
	$("#dialog").fadeIn(100);
	    

        }

 function HideDialog()
        {
            $("#dialog").fadeOut(100);
	    $("#jobDetailsContent").fadeTo("slow", 1);
        } 
 
