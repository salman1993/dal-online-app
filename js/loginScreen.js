/* UI FOR LOGIN SCREEN
------------------------------ */

function loginScreen(bodyDOM, connection, loginCallback) {

	// data
	this.connection = connection;
	this.bodyDOM = bodyDOM;
	this.loginCallback = loginCallback;

	// find stored username and password
	var username = localStorage.getItem('username');
	if(username == null) username = '';
	var password = localStorage.getItem('password');
	if(password == null) password = '';
	
	// create login
	var loginDOM = this.loginDOM = document.createElement('DIV');
	loginDOM.setAttribute('id', 'loginScreenOverlay');
	loginDOM.innerHTML = '<div id="centered"> \
							  <div id="loginStateOne"> \
								  <div id="loginTextboxes"> \
									 <div id="topshadow"> \
									  	<input id="username" placeholder="Net ID" value="' + username + '"> \
									  	<div id="inputSpacer"></div> \
									  	<input id="password" placeholder="Password" type="password" value="' + password + '"> \
								  	 </div> \
								  </div> \
								  <div id="loginButton">Login</div> \
							  </div> \
							  <div id="loginStateTwo"></div> \
		 				  </div>';
	bodyDOM.appendChild(loginDOM);
	
	// click login button
	var self = this;
	loginDOM.querySelector('#loginButton').addEventListener(window.clickBindEvent, function(e) {
		self.onStartLogin(e);
	});
	
	// hit enter triggers login
	loginDOM.addEventListener('keyup', function(e) {

		// was enter pressed
		if(e.keyCode == 13 && e.target.tagName == 'INPUT')
			self.onStartLogin(e);
		
	});

	// login if we have a saved username and password
	if(username != '' & password != '')
		this.onStartLogin();

}

/* start logging in
------------------------------ */

loginScreen.prototype.onStartLogin = function(e) {
	
	// pointer
	var loginDOM = this.loginDOM;
	var bodyDOM = this.bodyDOM;
	var loginCallback = this.loginCallback;
	var self = this;
	
	// get username and password from dom
	var username = loginDOM.querySelector('#username').value;
	var password = loginDOM.querySelector('#password').value;

	// add loading class to loginDOM overlay
	loginDOM.className = 'loading';
	
	// do login
	this.connection.login(username, password, function(worked) {
		
		// login worked
		if(worked) {

			// store username and password
			localStorage.setItem('username', username);
			localStorage.setItem('password', password);

			// swipe over the login screen
			loginDOM.className = 'loading swipedLeft';
			setTimeout(function(){
				bodyDOM.removeChild(loginDOM);
			}, 1000);

			// run login callback
			if(typeof loginCallback == 'function') loginCallback();
			
		// login failed
		}else{
			
			// try again
			if(e != 'lastTime') {
				self.onStartLogin('lastTime');
				return;
			}

			// remove loading class
			loginDOM.className = '';
			
			// inform user
			alert('You have entered an invalid account ID or PIN.');
			
		}
		
	});
	
}