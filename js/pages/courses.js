pages.courses = function(parameters, callback) {

	// assign connection
	this.connection = parameters.connection;
	this.pageData = parameters.pageData;

	// pull out preferences from cache
	if(localStorage.courses_faculty)
		this.faculty = localStorage.courses_faculty;

	// pull out preferences from cache
	if(localStorage.courses_location)
		this.location = localStorage.courses_location;

	// pull out preferences from cache
	if(localStorage.courses_type)
		this.type = localStorage.courses_type;

	// pull out preferences from cache
	if(localStorage.courses_day)
		this.day = localStorage.courses_day;

	// pull out preferences from cache
	if(localStorage.courses_available)
		this.available = localStorage.courses_available;

	// draw the page
	this.draw(callback);

	// do bindings
	this.bindings(true);

}

pages.courses.prototype.page = 1;

// faculty filter
pages.courses.prototype.faculties = [{"name":"Anatomy","code":"ANAT"},{"name":"Applied Hlth Services Research","code":"ARTC"},{"name":"Architecture","code":"ARCH"},{"name":"Biochem &amp; Molecular Biology","code":"BIOC"},{"name":"Bioethics","code":"BIOT"},{"name":"Biological Engineering","code":"BIOE"},{"name":"Biology","code":"BIOL"},{"name":"Biomedical Engineering","code":"BMNG"},{"name":"Business Admin","code":"BUSI"},{"name":"Canadian Studies","code":"CANA"},{"name":"Chemical Engineering","code":"CHEE"},{"name":"Chemistry","code":"CHEM"},{"name":"Civil Engineering","code":"CIVL"},{"name":"Classics","code":"CLAS"},{"name":"Commerce","code":"COMM"},{"name":"Community Health&amp;Epidemiology","code":"CH_E"},{"name":"Complementary Studies","code":"CPST"},{"name":"Computer Science","code":"CSCI"},{"name":"Dentistry","code":"DENT"},{"name":"Dentistry Qualifying","code":"DENQ"},{"name":"Diag Med Ultrasound Tech","code":"DMUT"},{"name":"Diagnostic Cytology","code":"DCYT"},{"name":"Earth Sciences","code":"ERTH"},{"name":"Economics","code":"ECON"},{"name":"Electrical &amp; Computer Engineer","code":"ECED"},{"name":"Electronic Commerce","code":"ECMM"},{"name":"Engineering","code":"ENGI"},{"name":"Engineering Internetworking","code":"INWK"},{"name":"Engineering Mathematics","code":"ENGM"},{"name":"English","code":"ENGL"},{"name":"Environmental Engineering","code":"ENVE"},{"name":"Environmental Science","code":"ENVS"},{"name":"Environmental Studies","code":"ENVI"},{"name":"Food Science","code":"FOSC"},{"name":"French","code":"FREN"},{"name":"Gender &amp; Women's Studies","code":"GWST"},{"name":"Geography","code":"GEOG"},{"name":"German","code":"GERM"},{"name":"Health Administration","code":"HESA"},{"name":"Health Informatics","code":"HINF"},{"name":"Health Promotion","code":"HPRO"},{"name":"History","code":"HIST"},{"name":"Human Communication Disorders","code":"HUCD"},{"name":"Industrial Engineering","code":"IENG"},{"name":"Informatics","code":"INFX"},{"name":"Information Management","code":"INFO"},{"name":"Interdisc Studies (Graduate)","code":"INTE"},{"name":"International Develop Studies","code":"INTD"},{"name":"Journalism","code":"JOUR"},{"name":"Kinesiology","code":"KINE"},{"name":"Law","code":"LAWS"},{"name":"Leisure Studies","code":"LEIS"},{"name":"Management","code":"MGMT"},{"name":"Marine Affairs","code":"MARA"},{"name":"Marine Biology","code":"MARI"},{"name":"Materials Engineering","code":"MATL"},{"name":"Mathematics","code":"MATH"},{"name":"Mechanical Engineering","code":"MECH"},{"name":"Medical Sciences","code":"MEDS"},{"name":"Medicine","code":"MEDI"},{"name":"Microbiology &amp; Immunology","code":"MICI"},{"name":"Mineral Resource Engineering","code":"MINE"},{"name":"Music","code":"MUSC"},{"name":"Neuroscience","code":"NESC"},{"name":"Nuclear Medicine Technology","code":"NUMT"},{"name":"Nursing","code":"NURS"},{"name":"Occupational Therapy","code":"OCCU"},{"name":"Oceanography","code":"OCEA"},{"name":"Oral Surgery","code":"ORAL"},{"name":"PHD Program","code":"PHDP"},{"name":"Pathology","code":"PATH"},{"name":"Periodontics","code":"PERI"},{"name":"Petroleum Engineering","code":"PETR"},{"name":"Pharmacology","code":"PHAC"},{"name":"Pharmacy","code":"PHAR"},{"name":"Philosophy","code":"PHIL"},{"name":"Physics &amp; Atmospheric Science","code":"PHYC"},{"name":"Physiology","code":"PHYL"},{"name":"Physiotherapy","code":"PHYT"},{"name":"Planning","code":"PLAN"},{"name":"Political Science","code":"POLI"},{"name":"Post-Graduate Pharmacy","code":"PGPH"},{"name":"Process Engineering &amp; App Scie","code":"PEAS"},{"name":"Psychology","code":"PSYO"},{"name":"Public Administration","code":"PUAD"},{"name":"Radiological Technology","code":"RADT"},{"name":"Registration Course-Graduate","code":"REGN"},{"name":"Respiratory Therapy","code":"RSPT"},{"name":"Social Work","code":"SLWK"},{"name":"Sociol &amp; Social Anthropology","code":"SOSA"},{"name":"Spanish &amp; Latin American Stud","code":"SPAN"},{"name":"Statistics","code":"STAT"},{"name":"Sustainability","code":"SUST"},{"name":"Theatre","code":"THEA"},{"name":"Vision Science","code":"VISC"}];
pages.courses.prototype.faculty = 'CSCI';

// locations filter
pages.courses.prototype.locations = [{name: "All Locations", code: 'All'},{name: "Halifax", code: '100'},{name: "Truro", code: '200'}];
pages.courses.prototype.location = 'All';

// course type filter
pages.courses.prototype.types = [{name: "All Types", code: 'skip'}, {name: "Lectures Only", code: '.class:not(.LEC)'},{name: "Tutorials", code: '.class:not(.TUT)'},{name: "Labs", code: '.class:not(.LAB)'}];
pages.courses.prototype.type = '.class:not(.LEC)';

// course days filter
pages.courses.prototype.days = [{name: "All Days", code: 'skip'}, {name: "Mon, Wed, Fri", code: '.class.Tue, .class.Thu'},{name: "Tue, Thu", code: '.class.Mon, .class.Wed, .class.Fri'},{name: "Monday", code: '.class.Tue, .class.Wed, .class.Thu, .class.Fri'},{name: "Tuesday", code: '.class.Mon, .class.Wed, .class.Thu, .class.Fri'},{name: "Wednesday", code: '.class.Mon, .class.Tue, .class.Thu, .class.Fri'},{name: "Thursday", code: '.class.Mon, .class.Tue, .class.Wed, .class.Fri'},{name: "Friday", code: '.class.Mon, .class.Tue, .class.Wed, .class.Thu'}];
pages.courses.prototype.day = 'skip';

// course available filter
pages.courses.prototype.availables = [{name: "Available", code: '.filled'}, {name: "Unavailable", code: '.open'},{name: "Both", code: 'skip'}];
pages.courses.prototype.available = '.filled';

pages.courses.prototype.draw = function(callback) {

	// reset current page to 1
	this.page = 1;

	// point to where we want to store data
	var pageData = this.pageData;
	var self = this;

	// build faculty buffer
	var faculty = ['<select id=\'faculty\'>'];
	var length = this.faculties.length;
	for(var i = 0; i < length; i++)
		faculty.push('<option ' + (this.faculties[i].code==this.faculty ? 'selected ' : '') + 'value="' + this.faculties[i].code + '">' + this.faculties[i].name + '</option>');
	faculty.push('</select>');

	// build location buffer
	var location = ['<select id=\'location\'>'];
	var length = this.locations.length;
	for(var i = 0; i < length; i++)
		location.push('<option ' + (this.locations[i].code==this.location ? 'selected ' : '') + 'value="' + this.locations[i].code + '">' + this.locations[i].name + '</option>');
	location.push('</select>');

	// build type buffer
	var type = ['<select id=\'type\'>'];
	var length = this.types.length;
	for(var i = 0; i < length; i++)
		type.push('<option ' + (this.types[i].code==this.type ? 'selected ' : '') + 'value="' + this.types[i].code + '">' + this.types[i].name + '</option>');
	type.push('</select>');

	// build day buffer
	var day = ['<select id=\'day\'>'];
	var length = this.days.length;
	for(var i = 0; i < length; i++)
		day.push('<option ' + (this.days[i].code==this.day ? 'selected ' : '') + 'value="' + this.days[i].code + '">' + this.days[i].name + '</option>');
	day.push('</select>');

	// build available buffer
	var available = ['<select id=\'available\'>'];
	var length = this.availables.length;
	for(var i = 0; i < length; i++)
		available.push('<option ' + (this.availables[i].code==this.available ? 'selected ' : '') + 'value="' + this.availables[i].code + '">' + this.availables[i].name + '</option>');
	available.push('</select>');

	// where we store data
	var buffer = ["<div class='submenu'> \
						" + faculty.join('') + " \
						" + location.join('') + " \
						" + type.join('') + " \
						" + day.join('') + " \
						" + available.join('') + " \
				   </div><div class=\"schedule courses\"> \
					   <table> \
					   	    <tr class=\"header dayTitle center\"> \
					   	        <td>Course</td> \
					   	        <td>Days</td> \
					   	        <td>Time</td> \
					   	    </tr>"];

	// pull grades from dal
	this.connection.getTimetable(this.faculty, this.location, function(data) {

		// do nothing if no courses
		if(!data) {
			var schedule = pageData.querySelector('.schedule');
			if(!schedule)
				schedule = pageData;
			schedule.innerHTML = '<div class="error">No course information for this term!</div>';
			return;
		}

		// store the data on this object
		self.courses = data.courses;
		self.pages = data.pages;
		data = data.courses;

		// go over the data we collected
		var length = data.length;
		for(var i = 0; i < length; i++) {

			// pointer
			thisItem = data[i];

		// what do we show for time

		buffer.push('<tr class="' + thisItem.type + ' ' + thisItem.days.join(' ') + ' class ' + (thisItem.available==0 ? 'filled' : 'open') + '" data-courseArrayID="' + i + '"> \
							<td>' + thisItem.type.toUpperCase() + ': ' + thisItem.title + '</td> \
							<td>' + thisItem.days.join('<br>') + '</td> \
							<td>' + (isNaN(thisItem.timeStart) ? "N/A" : (formatTime(thisItem.timeStart) + '<br>' + formatTime(thisItem.timeStop))) + '</td> \
						 </tr>');

		}

		// close the table
		buffer.push('</table>');

		// insert loading div
		if(self.pages.length > 1)
			buffer.push('<div class="loading static"></div>');

		// close the buffer
		buffer.push('</div>');

		// run callback with the buffer
		pageData.innerHTML = buffer.join('');

		/* FILTER BINDINGS */

		// initial filter apply
		self.applyFilters();

		// bind the dropdown for faculty
		pageData.querySelector('#faculty').addEventListener('change', function(e) {
			pageData.querySelector('.schedule').innerHTML = '<div class="loading"></div>';
			localStorage.courses_faculty = self.faculty = e.target.value;
			self.draw();
		});

		// bind the dropdown for location
		pageData.querySelector('#location').addEventListener('change', function(e) {
			pageData.querySelector('.schedule').innerHTML = '<div class="loading"></div>';
			localStorage.courses_location = self.location = e.target.value;
			self.draw();
		});

		// bind the dropdown for type
		pageData.querySelector('#type').addEventListener('change', function(e) {
			localStorage.courses_type = self.type = e.target.value;
			self.applyFilters();
		});

		// bind the dropdown for type
		pageData.querySelector('#day').addEventListener('change', function(e) {
			localStorage.courses_day = self.day = e.target.value;
			self.applyFilters();
		});

		// bind the dropdown for type
		pageData.querySelector('#available').addEventListener('change', function(e) {
			localStorage.courses_available = self.available = e.target.value;
			self.applyFilters();
		});

		// run callback
		if(typeof callback == 'function') callback();

	});

}

pages.courses.prototype.applyFilters = function() {

	// point to page data
	var pageData = this.pageData;

	// show all nodes
	var allNodes = pageData.querySelectorAll('.class');
	var length = allNodes.length;
	for(var i = 0; i < length; i++)
		allNodes[i].style.display = 'table-row';

	// now filter the types
	if(this.type != 'skip') {
		var applyingNodes = pageData.querySelectorAll(this.type);
		var length = applyingNodes.length;
		for(var i = 0; i < length; i++)
			applyingNodes[i].style.display = 'none';
	}

	// now filter the days
	if(this.day != 'skip') {
		var applyingNodes = pageData.querySelectorAll(this.day);
		var length = applyingNodes.length;
		for(var i = 0; i < length; i++)
			applyingNodes[i].style.display = 'none';
	}

	// now filter the availability
	if(this.available != 'skip') {
			var applyingNodes = pageData.querySelectorAll(this.available);
		var length = applyingNodes.length;
		for(var i = 0; i < length; i++)
			applyingNodes[i].style.display = 'none';
	}

	// compute odd and even for display purposes
	var length = allNodes.length;
	var visibleCount = 0;
	for(var i = 0; i < length; i++)
		if(allNodes[i].style.display!='none')
			allNodes[i].setAttribute('data-even', ++visibleCount % 2 == 0 ? 'true' : 'false' );

	// always show the header
	//pageData.querySelector('.header').style.display = 'table-row';
	// document.body.querySelectorAll('.class:not([style*="none"])').length
}

pages.courses.prototype.bindings = function(onOff) {

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
		if(typeof e.changedTouches == 'undefined' || e.target.parentNode.className.indexOf('class') > 0 && !window.scrolling && Math.abs(e.changedTouches[0].pageX - pageX) < 40 && Math.abs(e.changedTouches[0].pageY - pageY) < 40) {

			// point to course info
			var gradeInfo = self.courses[e.target.parentNode.getAttribute('data-courseArrayID')];

			// create popup
			self.moreCourseInfo(gradeInfo);

		}

	});

}

pages.courses.prototype.moreCourseInfo = function(details) {

	// abort
	if(!details)
		return;

	// destroy old popup
	if(this.popup && this.popup.parentNode)
		this.popup.parentNode.removeChild(popup);

	// disable sidebar
	window.sidebarAllowed = false;

	// build new popup
	var popup = document.createElement('div');
	popup.id = 'courseInfoPopupContainer';
	popup.innerHTML = '<div id="courseInfoPopup"> \
						   <div id="courseInfo"> \
							   <div class="courseName"> \
								   <div class="title">Course</div> \
								   <div class="info">' + details.title + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">Course Code</div> \
								   <div class="info">' + details.code + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">Type</div> \
								   <div class="info">' + details.type + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">Section</div> \
								   <div class="info">' + details.section + '</div> \
							   </div> \
							   <div class="code"> \
							   <div class="title">Location</div> \
								   <div class="info">' + details.location + '</div> \
							   </div> \
							   <div class="profName"> \
								   <div class="title">Instructor</div> \
								   <div class="info">' + details.instructor + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">CRN</div> \
								   <div class="info">' + details.crn + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Time</div> \
								   <div class="info">' + (isNaN(thisItem.timeStart) ? "N/A" : (formatTime(thisItem.timeStart) + ' to ' + formatTime(thisItem.timeStop))) + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Days</div> \
								   <div class="info">' + details.days.join(', ') + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Availability</div> \
								   <div class="info">' + details.available + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Currently Enrolled</div> \
								   <div class="info">' + details.current + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Maximum Students</div> \
								   <div class="info">' + details.max + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Wait List</div> \
								   <div class="info">' + details.waitList + '</div> \
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

pages.courses.prototype.action = function(type) {

	// if we hit the bottom of the page and still have pages we can load in
	if(type == 'CLOSE_TO_BOTTOM_OF_PAGE' && this.page < this.pages[this.pages.length - 1] && this.loadingNew != true) {

		// immediately get a lock on loading new items
		this.loadingNew = true;

		// self pointer
		var self = this;

		// incriment current page
		this.page = this.pages[ this.pages.indexOf(this.page) + 1 ];

		// grab new page
		this.connection.getTimetable(this.faculty, this.location, function(data) {

			// point to course data
			data = data.courses;

			// pointer to courses we have cached
			var courses = self.courses;

			// make a buffer
			var length = data.length;
			var buffer = [];
			var i_value_fake = courses.length; // since we need to store course info locally and match it with each row
			for(var i = 0; i < length; i++) {

				// pointer
				thisItem = data[i];

				// add this item to the courses array
				courses.push(thisItem);

				// add course info to the buffer
				buffer.push('<tr class="' + thisItem.type + ' ' + thisItem.days.join(' ') + ' class ' + (thisItem.available==0 ? 'filled' : 'open') + '" data-courseArrayID="' + (i_value_fake++) + '"> \
									<td>' + thisItem.type.toUpperCase() + ': ' + thisItem.title + '</td> \
									<td>' + thisItem.days.join('<br>') + '</td> \
									<td>' + (isNaN(thisItem.timeStart) ? "N/A" : (formatTime(thisItem.timeStart) + '<br>' + formatTime(thisItem.timeStop))) + '</td> \
								 </tr>');

			}

			// insert the buffer into the page
			self.pageData.querySelector('table').innerHTML += buffer.join('');

			// remove loading icon if we are on the last page
			if(self.page == self.pages[self.pages.length - 1]) {
				var loader = self.pageData.querySelector('.loading.static');
				if(loader)
					loader.parentNode.removeChild(loader);
			}

			// reapply the filters
			self.applyFilters();

			// end the exclusive new item addition lock
			self.loadingNew = false;

		}, this.page);

	}

}

pages.courses.prototype.destroy = function(onOff) {

}