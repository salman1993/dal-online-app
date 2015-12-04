function dalonline() { 
	
	// make a date object
	var d=new Date();
	var month = d.getMonth();

	// calculate which term this is
	var term = 'winter';
	if(month > 7)
		term = 'fall';
	else if(month > 3)
		term = 'summer';
	this.season = term;

	// calculate which year this is
	this.year = d.getFullYear();

}

/* login 
-------------------------------- */

dalonline.prototype.login = function(username, password, callback) {

	// store username and password on object
	this.username = username;
	this.password = password;
	
	// login attempt
	post('https://dalonline.dal.ca/PROD/twbkwbis.P_ValLogin', { sid: username, PIN: password }, function(data) {
		
		// invoke callback
		if(typeof callback == 'function')
			callback( data.indexOf('Welcome+to+the+Dalhousie+Online') == -1 ? false : true );
		
	});
	
}

/* gets the season variable as a number 
--------------------------------- */

dalonline.prototype.getSeasonAsNumber = function() {
	var season = this.season;
	if(season == 'fall')
		season = 10;
	else if(season == 'winter')
		season = 20;
	else if(season == 'summer')
		season = 30;
	return season;
}

/* set the term
-------------------------------- */

dalonline.prototype.setTerm = function(year, season, callback) {

	// store data on object
	this.season = season;
	this.year = year;

	// convert summer winter or fall to 30 20 10
	var seasonNumber = this.getSeasonAsNumber();

	// do post and add 1 from year if fall term (dal 2012 fall term year = 2013 for some year)
	post('https://dalonline.dal.ca/PROD/bwcklibs.P_StoreTerm', { name_var: 'bmenu.P_RegMnu', term_in: (seasonNumber==10 ? year + 1 : year) + "" + seasonNumber }, function() {
		if(typeof callback == 'function') callback();
	});

}

/* decrease the term 
-------------------------------- */

dalonline.prototype.decreaseTerm = function(callback) {

	// pull the year and season
	var year = this.year;
	var season = this.season;

	// calculate season and year
	if(season == 'fall') {
		season = 'summer';
	}else if(season == 'summer') {
		season = 'winter';
	}else{
		season = 'fall';
		year--;
	}

	// set the new term
	//this.setTerm(year, season, callback);

	this.year = year;
	this.season = season;
	if(typeof callback == 'function') callback();

}

/* increase the term 
-------------------------------- */

dalonline.prototype.increaseTerm = function(callback) {

	// pull the year
	var year = this.year;
	var season = this.season;

	// calculate season and year
	if(season == 'fall') {
		year++;
		season = 'winter';
	}else if(season == 'winter') {
		season = 'summer';
	}else{
		season = 'fall';
	}

	// set the new term
	//this.setTerm(year, season, callback);

	this.year = year;
	this.season = season;
	if(typeof callback == 'function') callback();

}

/* logout 
-------------------------------- */

dalonline.prototype.logout = function(callback) {
	localStorage.removeItem('username');
	localStorage.removeItem('password');
	if(typeof callback == 'function') callback();
}

/* grab user grades
-------------------------------- */

dalonline.prototype.getFinalGrades = function(callback) {


	// pointer
	var self = this;

	// first login again
	this.login(this.username, this.password, function(status) {

		// grab course info page
		post('https://dalonline.dal.ca/PROD/bwskogrd.P_ViewGrde', { term_in: self.year + 1 + "" + self.getSeasonAsNumber() }, function(data) {

			// find relavent data from this page
			var courseInfo = data.match(/Course Title([\s\S]*?)\/TABLE/gim);

			// stop if nothing to report
			if(!courseInfo) {
				if(callback)
					callback(false);
				return;
			}

			// divide the current HTML into an array each entry representing the html of a row in the grades table
			courseInfo = courseInfo[0].split('</TR>');

			// build object of data
			var buffer = [];
			var length = courseInfo.length;
			for(var i = 0; i < length; i++) {

				// pull out data
				var td_data = courseInfo[i].match(/<TD CLASS="dddefault">(.*?)<\/TD>/ig);

				// skip this if not useful
				if(!td_data)
					continue;

				// build the course
				buffer.push({ crn: td_data[0].replace(/(<([^>]+)>)/ig,"").trim(),
							  subject: td_data[1].replace(/(<([^>]+)>)/ig,"").trim(),
							  course: td_data[2].replace(/(<([^>]+)>)/ig,"").trim(),
							  section: td_data[3].replace(/(<([^>]+)>)/ig,"").trim(),
							  campus: td_data[4].replace(/(<([^>]+)>)/ig,"").trim(),
							  course_title: td_data[5].replace(/(<([^>]+)>)/ig,"").trim(),
							  final_grade: td_data[6].replace(/(<([^>]+)>)/ig,"").trim(),
							  attempted: td_data[7].replace(/(<([^>]+)>)/ig,"").trim(),
							  earned: td_data[8].replace(/(<([^>]+)>)/ig,"").trim(),
							  gpa_hours: td_data[9].replace(/(<([^>]+)>)/ig,"").trim() });

			}

			// callback
			if(callback)
				callback(buffer);

		});

	});

}

/* grab user schedule 
-------------------------------- */

dalonline.prototype.getSchedule = function(callback) {

	// pointer
	var self = this;

	// first login again
	this.login(this.username, this.password, function(status) {

		// set the current term
		self.setTerm(self.year, self.season, function() {

			// throw error if login failed
			if(!status) {
				alert("Your NET ID or password are incorrect!");
				self.logout();
				return;
			}

			// do post
			post('https://dalonline.dal.ca/PROD/bwskfshd.P_CrseSchdDetl', function(data){

				// build titles
				var courseTitles = data.match(/<CAPTION(.*?)CAPTION>/gim);

			     // grab tables with course info
			     var matches = data.match(/<TABLE  CLASS="datadisplaytable" SUMMARY="This table lists the scheduled meeting times and assigned instructors for this class([\s\S]*?)\/table>/gim);

			     // abort if no classes
			     if(!matches) {
			     	callback(false);
			     	return;
			     }

			     // where we are storing things
			     var storage = [];

			     // for all tables
			     var length = matches.length;
			     for(var i = 0; i < length; i++) { 

			          // get trs
					  var tditerating = matches[i].match(/<TD CLASS="dddefault">([\s\S]*?)<\/TD>/gim);

					  // calculate minutes into the day that this class starts minutesIntoDay
					  var timebits = tditerating[1].replace(/(<([^>]+)>)/ig,"").split(' ');
					  var hourMinutes = timebits[0].split(':');
					  var minutesIntoDay = (parseInt(hourMinutes[0]) * 60) + parseInt(hourMinutes[1]) + (timebits[1]=="pm" && hourMinutes[0] != "12" ? 12*60 : 0);

					  // store info about this course
			          storage.push({ name: courseTitles[i * 2].replace(/(<([^>]+)>)/ig,""), 
			          				 days: tditerating[2].replace(/(<([^>]+)>)/ig,""), 
			          				 time: tditerating[1].replace(/(<([^>]+)>)/ig,""), 
			          				 minutesIntoDay: minutesIntoDay,
			          				 date: tditerating[4].replace(/(<([^>]+)>)/ig,""), 
			          				 class: tditerating[3].replace(/(<([^>]+)>)/ig,"").replace('COMPUTER SCIENCE', 'CS').replace('CHEMISTRY', 'CHEM').replace('SIR ', ''), 
			          				 type: tditerating[5].replace(/(<([^>]+)>)/ig,"").replace('Laboratory','Lab'), 
			          				 prof: tditerating[6].replace(/(<([^>]+)>)/ig,"").replace(' (P)','')
			          			   });

			     }

			     // sort the classes based on time
			     storage.sort(function(a, b) {
			     	if(a.minutesIntoDay < b.minutesIntoDay)
			     		return -1;
			     	else if(a.minutesIntoDay > b.minutesIntoDay)
			     		return 1;
			     	else
			     		return 0;
			     });

			     // return data
			     callback(storage);

			});

		});

	});

}

/* grab dal timetable
-------------------------------- */

dalonline.prototype.getTimetable = function(subject, district, callback, n) {

	// set n (start val) to 0 if not given to us
	if(!n)
		n = 1;

	// get season and year
	var seasonCode = this.getSeasonAsNumber();
	var year = seasonCode == 10 ? this.year + 1 : this.year;

	// grab the page
	get('https://dalonline.dal.ca/PROD/fysktime.P_DisplaySchedule', { s_term: year + "" + seasonCode, s_subj: subject, n: n, s_district: district }, function(data) {

		// find page info
		var page_n = [];
		var extracted;
		if(extracted = data.match(/&n=([0-9]*?)&/g)) {
			var length = extracted.length;
			for(var i = 0; i < length; i++) {

				// hack off some more of that dead stuff
				var realN = parseInt(extracted[i].substring(3, extracted[i].length -1));

				// since we extracted from the page we got duplicates so only enter once per page
				if(page_n.length == 0 || realN > page_n[page_n.length-1])
					page_n.push(realN);

			}

		}
		if(page_n.length == 0 || page_n[0] != '1')
			page_n.unshift(1);

		// pull out the data related to the timetable table
		var tableHTML = data.match(/%Full([\s\S]*?)START OF twbkwbis/gim);

		// abort if need be
		if(!tableHTML || tableHTML.length == 0) {
			callback(false);
			return;
		}

		// divide the timetable up into HTML rows which we will parse
		var rowsHTML = tableHTML.pop().split('detthdr');

		// array where we store the course info
		var dataArray = [];

		// go through every row
		length = rowsHTML.length;
		for(var i = 0; i < length; i++) {

			// track down this row
			var row = rowsHTML[i];

			// pull out the title
			var title = row.match(/<B>(.*?)<\/B>/g);

			// abort
			if(!title || title.length == 0)
					continue;

			// finalize the title
			title = ('<' + title[0]).replace(/(<([^>]+)>)/ig,"");

			// get the course code out of the title
			var titleBits = title.split(' ');
			var code = titleBits[0] + ' ' + titleBits[1];

			// chop title
			title = title.replace(code + ' ', '');

			// divide the lectures and labs and tutorials relating to this class into a new array
			var classParts = row.replace(/dettl/g,'newitem').replace(/dettb/g,'newitem').replace(/dettt/g,'newitem').replace(/NOWRAP/g, '').split('</TR');

			// for all those bits
			var PartsLength = classParts.length;
			for(var j = 0; j < PartsLength; j++) {

				// create object where we store data for this course
				var object = {};

				// pull out info about the course
				var matches = classParts[j].match(/newitem">([\s\S]*?)<\/TD>/gim);

				// WOT IS THIS GET OUT
				if(!matches || matches.length < 20)
					continue;

				// store the title
				object.title = title;

				// store class code
				object.code = code;

				// store the crn
				object.crn = ( '<' + matches[1] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store the section
				object.section = ( '<' + matches[2] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store the type
				object.type = ( '<' + matches[3] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store the type
				object.creditHours = ( '<' + matches[4] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store the type
				object.link = ( '<' + matches[5] ).replace(/(<([^>]+)>)/ig,"").trim();
				if(object.link == '&nbsp;')
					object.link = false;

				// store which days this is offered on
				var days = [];
				if(matches[6].indexOf('&nbsp;') == -1)
					days.push('Mon');
				if(matches[7].indexOf('&nbsp;') == -1)
					days.push('Tue');
				if(matches[8].indexOf('&nbsp;') == -1)
					days.push('Wed');
				if(matches[9].indexOf('&nbsp;') == -1)
					days.push('Thu');
				if(matches[10].indexOf('&nbsp;') == -1)
					days.push('Fri');
				object.days = days;

				// get the time bits and store the time
				var timebits = ( '<' + matches[11] ).replace(/(<([^>]+)>)/ig,"").trim().split('-');
				object.timeStart = timebits[0];
				object.timeStop = timebits[1];

				// store location
				object.location = ( '<' + matches[12] ).replace(/(<([^>]+)>)/ig,"").trim();
				if(object.location == 'C/D')
					object.location = 'N/A';

				// store max
				object.max = ( '<' + matches[13] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store current
				object.current = ( '<' + matches[14] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store avaliable
				object.available = ( '<' + matches[15] ).replace(/(<([^>]+)>)/ig,"").trim();

				// store wait list
				object.waitList = ( '<' + matches[16] ).replace(/(<([^>]+)>)/ig,"").trim();
				if(object.waitList == '&nbsp;')
					object.waitList = 0;

				// store wait list
				object.full = ( '<' + matches[17] ).replace(/(<([^>]+)>|\n|&nbsp;)/ig,"").trim();

				// store instructor
				object.instructor = ( '<' + matches[19] ).replace(/(<([^>]+)>|\n|&nbsp;)/ig,"").trim().replace(/ [A-Z]{1}[0-9]{3}$/, '');
				if(!isNaN(object.instructor) || object.instructor == '')
					object.instructor = ( '<' + matches[20] ).replace(/(<([^>]+)>|\n|&nbsp;)/ig,"").trim().replace(/ [A-Z]{1}[0-9]{3}$/, '');

				// now add this object to the array of object to return
				dataArray.push(object);

			}

		}

		// callback of the data
		callback({ courses: dataArray, pages: page_n });

	});

}