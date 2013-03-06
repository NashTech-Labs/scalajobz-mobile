/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
describe('app', function() {
    describe('initialize', function() {
        it('should bind deviceready', function() {
            runs(function() {
                spyOn(app, 'deviceready');
                app.initialize();
                helper.trigger(window.document, 'deviceready');
            });

            waitsFor(function() {
                return (app.deviceready.calls.length > 0);
            }, 'deviceready should be called once', 500);

            runs(function() {
                expect(app.deviceready).toHaveBeenCalled();
            });
        });
    });


	describe('Low Battery', function() {
  		spyOn(app,'onBatteryLow').andCallFake(function(info) {
			      return true;
    			});
		var returnValue=app.onBatteryLow('20%');
		
    		it('should report when battery is low', function() {			
			expect(returnValue).toBe(true);
        	});

    	});
});


describe('Click on Search button to find jobs', function() {
	var html="<input type='text' id='searchTextBox'/>";
	
	beforeEach(function() {
       		setFixtures(html);
	});
	afterEach(function() {
       		$('#searchTextBox').remove();
	});

	it ("check validity of entered search string (if there are special character in string)", function () {
		$('#searchTextBox').val('@$^@%&scala');
		value=checkSearchStringValidity();
		expect(value).toEqual(' scala');
	});
	
	describe('Check connetion', function() {
	  	spyOn(app,'checkConnection').andCallFake(function(value) {
			return value;
	    	});
		var notFoundConn=app.checkConnection('false');
		var founndConn=app.checkConnection('true');
	    	it('should report when connection is none', function() {			
			expect(notFoundConn).toEqual('false');			
		});
	
		it('should report when connection found', function() {
	    		expect(founndConn).toEqual('true');
		});		
	});
	
	describe('Show job list, if connection is true', function() {
		var html='<a href="#" id="searchbtn">Find Jobs</a><div id="searchHeadingResult"><div class="scroller"><ul id="thelist"></ul></div></div>';
		beforeEach(function() {
			setFixtures(html);
       			showListJobsPage(' scala');
		});
		
		afterEach(function() {
	       		$('#searchbtn').remove();
			$('#searchHeadingResult').remove();
		});

		it('Push search string to recent search job list array', function() {			
			expect(recentSearchJobList).toContain(' scala');
		});

		it('Change href of searchBtn to change page', function() {			
			expect($('#searchbtn').attr('href')).toEqual('#listView');			
		});

		it('Check $.getJSON ajax call', function() {
			spyOn($, 'getJSON');
			showListJobsPage(' scala');
			expect($.getJSON).toHaveBeenCalledWith("http://www.scalajobz.com/getJobsForACriteria/"+value+"?page="+pageNumber+"&jobsPerPage=25",jasmine.any(Function));

		});
		
		it('should call calculatedDatePosted function', function () {
	            var json = '2013-01-08T05:06:23Z';
	            spyOn(app, 'calculateDatePostedTime');
	            spyOn($, 'getJSON').andCallFake(function (url, data, callback) { 
			app.calculateDatePostedTime(json);
		    });
	            showListJobsPage(' scala');
	            expect(app.calculateDatePostedTime).toHaveBeenCalledWith(json);
	        });
		
		
		describe('Calculate DatePosted time', function() {
			var returnValue=app.calculateDatePostedTime('2013-02-20T01:00:09Z');
	    		it('how much time before job was posted', function() {			
				expect(returnValue).toBeTruthy();
			});	
	   	});
		
	});
});


	
describe('Show/hide emailSuggestions autocomplete list', function() {
		
		var html="<div id='ShowAutocomplete'><input type='text' placeholder='Enter email' id='emailTextBox'/><ul id='emailSuggestions' ></ul><div>";
		beforeEach(function() {
        		setFixtures(html);
			$("ul#emailSuggestions").css("display", "none");
      		});
		afterEach(function() {
        		$('#ShowAutocomplete').remove();
      		});

		it ("when type email in the textbox", function () {
			showAutoCompleteBox();
			expect($('#emailSuggestions')).toHaveCss({display: "block"});
		 });
		
		it ("when click on suggested email, email would show in email textbox", function () {
			var searchValue="knoldus@knoldus.com";
			setAutoCompleteValueToTextBox(searchValue);
			expect($("#emailTextBox").val()).toEqual(searchValue);
		 });
		
		it ("when click on suggested email hide autocomplete list", function () {
			expect($('#emailSuggestions')).toHaveCss({display: "none"});
		 });
  	});  


describe('Email Job', function() {
	var html="<div id='dialog'><input type='hidden' id='hiddenId' value='50eba94fe4b071ca46b51ad0'/><input type='text' id='emailTextBox' value='ruchi.agarwal@knoldus.com'/></div>";

	var email;
	beforeEach(function() {
      		setFixtures(html);
		email=$("#emailTextBox").val();
		if( jQuery.inArray(email, availableEmails) < 0 ){
			availableEmails.push(email);
		}
      	});
	
	afterEach(function() {
        		$('#dialog').remove();
      	});
	describe('Check validity of email', function() {
		
		it ("when click submit button, check entered email if correct", function () {
			expect(email).toMatch(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
		 });

		it ("when click submit button, push value to autocomlete list (if email is valid)", function () {
			expect(availableEmails).toContain($("#emailTextBox").val());
		 });

	});
	it('send job by $.getJSON ajax call', function() {
		spyOn($, 'getJSON');
		var jobId='50eba94fe4b071ca46b51ad0';
		emailJob();
		expect($.getJSON).toHaveBeenCalledWith("http://www.scalajobz.com/sendJobDetailMail?emailId="+email+"&jobId="+jobId,jasmine.any(Function));
		
	});
});

describe('Hide/show Loading Image', function() {
	var html="<div id='loadingImageDiv' ><img src='images/waiting.gif'/></div>";
	
	beforeEach(function() {
        		setFixtures(html);
      		});
	afterEach(function() {
        		$('#loadingImageDiv').remove();
      		});
	it ("Show", function () {
			showLoadingImage();
			expect($('#loadingImageDiv')).toHaveCss({display: "block"});			
		 });
	it ("Hide", function () {
			hideLoadingImage();
			expect($('#loadingImageDiv')).toHaveCss({display: "none"});			
		 });
});

describe('Displays job details', function() {
	var html="<div id='jobDetails'><div class='scroller'><ul id='jobDescription'></ul></div></div>";
	
	beforeEach(function() {
        		setFixtures(html);
      		});
	
	afterEach(function() {
        		$('#jobDetails').remove();
      		});

	it ("get job details through ajax call", function () {
		spyOn($, 'getJSON');
		var jobId='50eba94fe4b071ca46b51ad0';
		addJobDetailsToPage(jobId);
		expect($.getJSON).toHaveBeenCalledWith('http://www.scalajobz.com/getJobDetail/'+jobId,jasmine.any(Function));
	});

});

describe('If platform is iOS', function() {
	var html="<div id='jobDetailsContainer'><div class='scalaJobHeader'></div></div>"
	
	beforeEach(function() {
        		setFixtures(html);
      		});
	
	afterEach(function() {
        		$('#jobDetailsContainer').remove();
      		})

	it ("Displays back button", function () {
		addBackButtonToiOSApp();
		expect($('#backBtnForiOS')).toExist();
	});

	it ("Go back", function () {
		var returnvalue=goBack();
		expect(returnvalue).toBeFalsy();
	});

});

describe('Window/ Document events', function() {
	var handler;

	beforeEach(function() {
      		handler = function(){ }; // noop
   	 });
	it("should handle orientation events on the window object", function(){
	      $(window).bind("orientationchange", handler);
	      expect($(window)).toHandle("orientationchange");
	    });

	it("should handle pageshow events on listView page on the document object", function(){
	     $(document).delegate('#listView','pageshow',handler);
	      expect($(document)).toHandle("pageshow");
	    });

	it("should handle pageshow events on indexPage page on the document object", function(){
	    $(document).delegate('#indexPage','pageshow',handler);
	      expect($(document)).toHandle("pageshow");
	    });
	
	it("should handle pageshow events on indexPage page on the document object", function(){
	    $(document).on("tap", "#searchHeadingResult ul a li",handler);
	      expect($(document)).toHandle("tap");
	    });
	
});


