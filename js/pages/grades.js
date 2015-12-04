pages.grades = function(parameters, callback) {

	// assign connection
	this.connection = parameters.connection;
	this.pageData = parameters.pageData;

	// draw the page
	this.draw(callback);

	// do bindings
	this.bindings(true);

}

pages.grades.prototype.draw = function(callback) {
	
	// point to where we want to store data
	var pageData = this.pageData;
	var self = this;

	// where we store data
	var buffer = ['<div class="schedule grades"> \
					   <table> \
					   	    <tr class="header dayTitle center"> \
					   	        <td>Course</td> \
					   	        <td>Grade</td> \
					   	    </tr>'];

	// pull grades from dal
	this.connection.getFinalGrades(function(data) {

		// do nothing if no courses
		if(!data) {
			pageData.innerHTML = '<div class="error">No grades for this term!</div>';
			return;
		}

		// go over the data we collected
		var length = data.length;
		self.grades = data;
		for(var i = 0; i < length; i++) {

			buffer.push('<tr class="class" data-gradeArrayID="' + i + '"> \
							<td>' + data[i].course_title + '</td> \
							<td>' + data[i].final_grade + '</td> \
						 </tr>');

		}

		// close the buffer
		buffer.push('</table> </div>');

		// run callback with the buffer
		pageData.innerHTML = buffer.join('');

		// run callback
		if(typeof callback == 'function') callback();

	});

}

pages.grades.prototype.bindings = function(onOff) {

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
			var gradeInfo = self.grades[e.target.parentNode.getAttribute('data-gradeArrayID')];

			// create popup
			self.moreGradeInfo(gradeInfo);

		}

	});

}

pages.grades.prototype.destroy = function(onOff) {

}

/* get info about the course in a nice popup
------------------------------ */

pages.grades.prototype.moreGradeInfo = function(details) {

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
								   <div class="title">Campus</div> \
								   <div class="info">' + details.campus + '</div> \
							   </div> \
							   <div class="code"> \
								   <div class="title">Subject</div> \
								   <div class="info">' + details.subject + '</div> \
							   </div> \
							   <div class="profName"> \
								   <div class="title">Course</div> \
								   <div class="info">' + details.course + '</div> \
							   </div> \
							   <div class="time"> \
								   <div class="title">Course Title</div> \
								   <div class="info">' + details.course_title + '</div> \
							   </div> \
							   <div class="date"> \
								   <div class="title">CRN</div> \
								   <div class="info">' + details.crn + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Final Grade</div> \
								   <div class="info">' + details.final_grade + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Section</div> \
								   <div class="info">' + details.section + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Attempted</div> \
								   <div class="info">' + details.attempted + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">Earned</div> \
								   <div class="info">' + details.earned + '</div> \
							   </div> \
							   <div class="days"> \
								   <div class="title">GPA Hours</div> \
								   <div class="info">' + details.gpa_hours + '</div> \
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

/*

pages.grades = function(parameters, callback) {

	// assign connection
	this.connection = parameters.connection;
	this.pageData = parameters.pageData;

	// draw the page
	this.draw(callback);

	// do bindings
	this.bindings(true);

}

pages.grades.prototype.draw = function(callback) {
	this.pageData.innerHTML = 'test';
}

pages.grades.prototype.bindings = function(onOff) {

}

pages.grades.prototype.destroy = function(onOff) {

}


*/