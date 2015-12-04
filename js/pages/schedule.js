pages.schedule = function(parameters, callback) {

	// assign connection
	this.connection = parameters.connection;
	this.pageData = parameters.pageData;

	// draw the page
	this.draw(callback);

	// do bindings
	this.bindings(true);

}

pages.schedule.prototype.destroy = function() {}

/* manage bindings
------------------------------ */

pages.schedule.prototype.bindings = function(onOff) {

	// unbind topbar
	//if(this.binding_topBar) this.topBar.removeEventListener(window.clickBindEvent, this.binding_topBar);

	// abort
	if(!onOff)
		return;

	// pointer
	var self = this;

	// bind clicking on courses
	var pageX = 0;
	var pageY = 0;
	this.pageData.addEventListener('touchstart', function(e) {
		pageX = e.changedTouches[0].pageX;
		pageY = e.changedTouches[0].pageY;
	});

	// bind clicking on courses
	this.pageData.addEventListener(window.clickBindEvent, function(e) {

		// is this a class row we clicked
		if(typeof e.changedTouches == 'undefined' || e.target.parentNode.className == 'class' && !window.scrolling && Math.abs(e.changedTouches[0].pageX - pageX) < 40 && Math.abs(e.changedTouches[0].pageY - pageY) < 40) {

			// point to course info
			var courseInfo = self.schedule[e.target.parentNode.getAttribute('data-courseArrayID')];

			// create popup
			self.moreCourseInfo(courseInfo);

		}

	});

}

/* get info about the course in a nice popup
------------------------------ */

pages.schedule.prototype.moreCourseInfo = function(details) {

	// abort
	if(!details)
		return;

	// destroy old popup
	if(this.popup && this.popup.parentNode)
		this.popup.parentNode.removeChild(popup);

	// disable sidebar
	window.sidebarAllowed = false;

	// generate days string
	var parts = details.days.split("");
	for(var i = 0; i < parts.length; i++)
		switch(parts[i]) {
			case 'M':
				parts[i] = 'Monday';
				break;
			case 'T':
				parts[i] = 'Tuesday';
				break;
			case 'W':
				parts[i] = 'Wednesday';
				break;
			case 'R':
				parts[i] = 'Thursday';
				break;
			case 'F':
				parts[i] = 'Friday';
				break;
			default:
				break;
		}
	var days = parts.join(', ');

	// build new popup
	var popup = document.createElement('div');
	popup.id = 'courseInfoPopupContainer';
	popup.innerHTML = '<div id="courseInfoPopup"> \
						   <div id="courseInfo"> \
							   <div class="courseName"> \
								   <div class="title">Course Name</div> \
								   <div class="info">' + details.name + '</div> \
							   </div> \
							   <div class="code"> \
								   <div class="title">Location</div> \
								   <div class="info">' + details.class + '</div> \
							   </div> \
							   <div class="profName"> \
								   <div class="title">Professor</div> \
								   <div class="info">' + details.prof + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Time</div> \
								   <div class="info">' + details.time + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">Dates</div> \
								   <div class="info">' + details.date + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Days</div> \
								   <div class="info">' + days + '</div> \
							   </div> \
						  </div> \
						  <a class="button">Close</a> \
					</div>';
	document.body.appendChild(popup);

	// course popup binding
	popup.addEventListener(window.clickBindEvent, function(e) {

		// if button was pressed
		if(e.target.className == 'button') {

			// TERMINATE
			popup.parentNode.removeChild(popup);
			delete self.popup;

			// re-enable sidebar
			window.sidebarAllowed = true;

		}

	});

	// store popup on object
	this.popup = popup;

}

/* draw the top bar
------------------------------ */

/*schedule.prototype.drawTopBar = function(topBar) {

	// pull season
	var season = this.connection.season;
	var year = this.connection.year;

	// set title
	this.topBar.innerHTML = '<div id="title"> \
								<table> \
									<tr> \
										<td> \
											<div id="previous"></div> \
										</td> \
										<td> \
											<div class="text">' + capitalize(season) + " " + ( season == 'winter' ? (year - 1) + '-' + year : year ) + '</div> \
										</td> \
										<td> \
											<div id="next"></div> \
										</td> \
									</tr> \
								</table> \
							</div>';

}*/

/* calculate and draw the page, giving it to the callback
------------------------------ */

pages.schedule.prototype.draw = function(callback) {

	// pointer
	var self = this;

	// different buffers for different days of the week
	var dayBuffers = { M: [], T: [], W: [], R: [], F: [] };

	// pull schedule
	this.connection.getSchedule(function(data) {

		// there are no classes so print that and get out
		if(!data) {
			self.pageData.innerHTML = '<div class="error">No classes for this term!</div>';
			return;
		}

		// store schedule
		self.schedule = data;

		// go through schedule
		var length = data.length;
		for(var i = 0; i < length; i++) {

			// point to current item
			var item = data[i];

			// abreviate name
			var parts = item.prof.split(" ");
			if(parts.length > 1)
				var prof = parts[0].charAt(0) + ". " + parts[parts.length - 1];
			else prof = item.prof;

			// trim course name
			item.name = item.name.split(' - ').shift() + " " + item.type;

			// add to the buffer
			//<td>' + item.date + '</td> \
			//<td>' + item.type + '</td> \
			//<td>' + item.days + '</td> \
			var buffer = '<tr class="class" data-courseArrayID="' + i + '"> \
					          <td>' + item.name + '</td> \
					          <td>' + item.class + '</td> \
					          <td class="time">' + item.time.replace(' - ', '<br>') + '</td> \
					          <td class="no480">' + prof + '</td> \
					      </tr>';

			// insert into correct buffers
			var days = item.days.split("");
			for(var z = 0; z < days.length; z++)
				if(days[z] && dayBuffers[days[z]])
					dayBuffers[days[z]].push(buffer);

		}

		// process the buffers
		var buffer = '';
		var days = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', R: 'Thursday', F: 'Friday' };
		var numbersToDays = ['M', 'T', 'W', 'R', 'F'];
		var currentDay = ( (new Date()).getDay() - 1 ) % 7;
		if(currentDay < 0) currentDay += 7;
		var firstDay = currentDay;
		if(currentDay > 4) currentDay = 0;
		for(var i = 0; i < 5; i++) {

			// match current day
			var day = numbersToDays[ currentDay++ % 5 ]; 

			// skip blank days
			if(dayBuffers[day].length == 0)
				continue;

			// start of buffer
			//<td> Date </td> \
			//<td> Type </td> \
			//<td> Days </td> \
			buffer += '<tr class="dayTitle"><td>' + (numbersToDays[firstDay]==day ? "Today" : days[day]) + '</td><td></td><td></td><td class="no480"></td></tr>'
					   + ( i==0 ? '<tr class="header"> \
					          <td> Course </td> \
					          <td> Room </td> \
					          <td> Time </td> \
					          <td class="no480"> Prof </td> \
					      </tr>' : '') + dayBuffers[day].join('');

		}

		// stick in data
		self.pageData.innerHTML = '<div class="schedule student"><table>' + buffer + "</table></div>";

		// run callback
		if(typeof callback == 'function') callback();

	});

}