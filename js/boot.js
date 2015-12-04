
/* RUNS ON STARTUP
------------------------------ */

var pages = {};

function boot() {

	window.UI = new UIElements();
	
}

/* oversees the outer ui elements of the app
------------------------------ */

function UIElements() {

	// pointer
	var self = this;

	// which input event do we bind to
	window.clickBindEvent = "ontouchend" in document.documentElement ? "touchend" : "click";
	
	// TODO: connection
	var connection = this.connection = window.connection = new dalonline();

	// pointer to body
	var bodyDOM = this.bodyDOM = document.body;

	// scroll detection
	window.scrolling = false;
	var s;
	document.onscroll = function() {
		window.scrolling = true;
		clearTimeout(s);
		s = setTimeout(function(){ 
			window.scrolling = false;
			if(document.body.scrollTop + document.body.clientHeight + 100 >= document.body.offsetHeight && self.currentPage && self.currentPage.action)
				self.currentPage.action('CLOSE_TO_BOTTOM_OF_PAGE');
			else if(document.body.scrollTop + document.body.clientHeight >= document.body.offsetHeight && self.currentPage && self.currentPage.action) 
				self.currentPage.action('BOTTOM_OF_PAGE');
			
		}, 250);
	}

	// show the login screen
	new loginScreen(bodyDOM, connection, function() {

		// pointer to main content container
		var contentContainer = self.contentContainer = document.createElement('div');
		contentContainer.id = 'contentContainer';
		bodyDOM.appendChild(contentContainer);

		// container for the page data
		var pageData = self.pageData = document.createElement('div');
		pageData.id = 'pageData';
		contentContainer.appendChild(pageData);

		// set the current page
		var currentPage = self.currentPage = new pages[ localStorage.UIElements_currentPage ? localStorage.UIElements_currentPage : 'schedule' ]({ connection: connection, pageData: pageData });

		// top bar and sidebar logic
		self.navigation();

		// make sidebar
		self.sidebar();

		// create semester selector
		self.drawSemesterSelector();

	});

}

/* creates the nav
------------------------------ */

UIElements.prototype.navigation = function() {

	// top bar
	var topBar = document.createElement('div');
	topBar.id = 'topBar';
	this.bodyDOM.appendChild(topBar);
	topBar.innerHTML = '<div id="subredditSelector" class="button"> \
							<div class="icon"></div> \
						</div> \
						<div id="content"></div>';

	// return topbar info
	this.topBar = topBar;//.querySelector('#content');//{ topBar: topBar, content: topBar.querySelector('#content') };

}

/* creates the sidebar
------------------------------ */

UIElements.prototype.sidebar = function() {

	// pointers
	var bodyDOM = this.bodyDOM;
	var topBar = this.topBar;
	var contentContainer = this.contentContainer;
	var connection = this.connection;
	var self = this;


	// create sidebar
	var sidebar = document.createElement('DIV');
		sidebar.id = 'leftPane';

	// populate with data
	sidebar.innerHTML = '<div class="node title">Actions</div> \
						 <div id="schedule" class="node page">Schedule</div> \
						 <div id="grades" class="node page">Grades</div> \
						 <div id="courses" class="node page">Academic Timetable</div> \
						 <div id="logout" class="node">Logout</div>';

	// insert into DOM
	bodyDOM.appendChild(sidebar);

	// bindings
	sidebar.addEventListener(window.clickBindEvent, function(e) {

		// id of whichever element we clicked
		var id = e.target.id;
		var givenClass = e.target.className;

		// handle logout
		if(id == 'logout') {

			// call logout on dalhousie object
			connection.logout(function() {

				// now reload the "app"
				window.location.reload();

			});

		// handle page switch
		}else if(givenClass == 'node page') {

			// turn off old page
			self.currentPage.destroy();

			// destroy old pageData and recreate new one
			contentContainer.removeChild(self.pageData);
			var pageData = self.pageData = document.createElement('div');
			pageData.innerHTML = '<div class="loading"></div>';
			pageData.id = 'pageData';
			contentContainer.appendChild(pageData);

			// create new page
			self.currentPage = new pages[id]({ connection: connection, pageData: pageData });

			// store which page in local storage
			localStorage.UIElements_currentPage = id;

		}

	});

	// handle logic for opening and closing the sidebar
	var sidebarOpen = false;
	window.sidebarAllowed = true;
	function closeSidebar() {
		bodyDOM.className = '';
		setTimeout(function() {
			contentContainer.style.width = topBar.style.width = 'auto';
			topBar.style.right = '0px';
			sidebarOpen = false;
		}, 250);
	}
	function openSidebar() {
		if(!window.sidebarAllowed)
			return;
		topBar.style.right = 'auto';
		contentContainer.style.width = topBar.style.width = contentContainer.clientWidth;
		bodyDOM.className = 'showSidebar';
		sidebarOpen = true;
	}
	swipe({ bindTo: 'body', swipeLeft: function(){ 
		closeSidebar();
		
	}, swipeRight: function(){ 
		openSidebar();
	} });
	topBar.querySelector('#subredditSelector').addEventListener(window.clickBindEvent, function() {
		sidebarOpen ? closeSidebar() : openSidebar();
	});

}

/* draw the semester selector at the top
------------------------------ */

UIElements.prototype.drawSemesterSelector = function() {

	// pointers
	var topBar = this.topBar;
	var connection = this.connection;
	var self = this;

	// pull season
	var season = connection.season;
	var year = connection.year;

	// set title
	var title = document.createElement('DIV');
	title.id = 'title';
	title.innerHTML = '<table> \
							<tr> \
								<td> \
									<div id="previous"></div> \
								</td> \
								<td> \
									<div class="text">' + capitalize(season) + " " + ( season == 'winter' ? (year - 1) + '-' + year.toString().substring(2) : year ) + '</div> \
								</td> \
								<td> \
									<div id="next"></div> \
								</td> \
							</tr> \
					   </table>';
	var oldTitle = topBar.querySelector('#title');
	if(oldTitle) oldTitle.parentNode.removeChild(oldTitle);
	topBar.appendChild(title);

	// bind to nav bar
	title.addEventListener(window.clickBindEvent, function(e) {

		// id of what was pressed
		var id = e.target.id;

		// if going back go back
		if(id == 'previous') {

			// decrease the term
			connection.decreaseTerm(function() {

				// loading icon
				self.pageData.innerHTML = '<div class="loading"></div>';

				// draw the page
				self.currentPage.draw();

				// calculate the top bar
				self.drawSemesterSelector();

			});

		// go forward
		}else if(id == 'next') {

			// start loading again
			self.pageData.innerHTML = '<div class="loading"></div>';

			// decrease the term
			self.connection.increaseTerm(function() {

				// loading icon
				self.pageData.innerHTML = '<div class="loading"></div>';

				// draw the page
				self.currentPage.draw();

				// calculate the top bar
				self.drawSemesterSelector();
		
			});

		}

	});

}