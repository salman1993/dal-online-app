function get(url, data, callback) {
	
	// set callback
	if(typeof data == 'function') callback = data;
	
	// make object
	var req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	
	// set callback
	if(typeof callback == 'function') {
		
		// when state of the request changes
		req.onreadystatechange = function() {
			
			// if this state is a page loading correct
			if(req.readyState == 4 && req.status == 200)
				callback(req.responseText);
			
		}
		
	}
	
	// if there is data
	if(data && typeof data == 'object') {
		
		// buffer to store files
		var buffer = '';
		
		// iterate over items and stick into buffer
		for(var key in data)
			buffer += '&' + key + '=' + encodeURIComponent(data[key]);

		// append data to url
		url += '?' + buffer.substr(1);

	}
	
	// open page
	req.open('GET', url, true);
	req.send();
	
}

function post(url, data, callback) {
	
	// set callback
	if(typeof data == 'function') callback = data;
	
	// make object
	var req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	
	// set callback
	if(typeof callback == 'function') {
		
		// when state of the request changes
		req.onreadystatechange = function() {
			
			// if this state is a page loading correct
			if(req.readyState == 4 && req.status == 200)
				callback(req.responseText);
			
		}
		
	}
	
	// open page
	req.open('POST', url, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.setRequestHeader("Connection", "close");
	
	// if there is data
	if(data && typeof data == 'object') {
		
		// buffer to store files
		var buffer = '';
		
		// iterate over items and stick into buffer
		for(var key in data)
			buffer += '&' + key + '=' + encodeURIComponent(data[key]);
		
		// set length of params
		req.setRequestHeader("Content-length", buffer.length - 1);

		// fire send request
		req.send(buffer.substr(1));
		
	// there is no data so submit request without
	}else{
		req.send();
	}
	
}