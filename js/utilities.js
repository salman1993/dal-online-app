function formatTime(time) {

	if(!time || time.length < 3)
		return 'C/D';

	// get first two digits
	var hours = parseInt(time.substr(0, 2));

	// get last two
	var minutes = time.substr(2);

	// determine if it is AM or PM
	var AM_or_PM = hours > 11 ? 'PM' : 'AM';

	// remove 12 from hours from time if we need to
	if(hours > 12)
		hours -= 12;
	if(hours == 0)
		hours = 9;

	// return newly formatted time
	return hours + ':' + minutes + ' ' + AM_or_PM;

}

/* takes a string and capitalizes first character then returns said string
------------------------------ */

function capitalize(string) {
	return string[0].toUpperCase() + string.substr(1);
}

/* examples

swipe({ bindTo: 'body', swipeLeft: function(){}, swipeRight: function(){} });
swipe({ swipeLeft: function(){}, function(){} });

--------------------------------------------- */

function swipe(params) {
    
    // bind to body if not specified
    var bindTo = document.getElementsByTagName( params.bindTo ? params.bindTo : 'body' )[0];
    var swipeRight = params.swipeRight ? params.swipeRight : false;
    
    // determine if we have touch event access
    var touchEvents = "ontouchstart" in document.documentElement ? true : false;
    
    // do binding to track where mouse was pressed on screen 
    var startX = null,
    	startY = null;
    	
    /* === WHEN USER INITIALLY CLICKS/TOUCHES SELECTOR === */
    	
    // touchscreen
    if(touchEvents) {
	    bindTo.addEventListener('touchstart', function(e) { 
		    startX = e.changedTouches[0].pageX;
		    startY = e.changedTouches[0].pageY;
	    });
	    
	// mouse
    }else{
	    bindTo.addEventListener('mousedown', function(e) {
		    startX = e.pageX;
		    startY = e.pageY;
	    });
	}
	
	/* === WHEN MOUSE IS LIFTED === */
    
    // touchscreen
    if(touchEvents) {
	    bindTo.addEventListener('touchend', function(e) {
	    
			// point to coordinates
		    deltaX = e.changedTouches[0].pageX - startX;
		    deltaY = e.changedTouches[0].pageY - startY;
		    
		    // if movement was within the proper verical threshold for a horizontal swipe
		    if(Math.abs(deltaY) < 30) {
			    
			    // check for a swipe rightward
			    if(deltaX > document.body.clientWidth * 0.2 && params.swipeRight)
			    	params.swipeRight();
			    else if(deltaX < document.body.clientWidth * -0.2 && params.swipeLeft)
			    	params.swipeLeft();
			    
		    }
			    
	    });
	    
	// click
    }else{
	    bindTo.addEventListener('mouseup', function(e) {
	    
			// point to coordinates
		    deltaX = e.pageX - startX;
		    deltaY = e.pageY - startY;
		    
		    // if movement was within the proper verical threshold for a horizontal swipe
		    if(Math.abs(deltaY) < 30) {
			    
			    // check for a swipe rightward
			    if(deltaX > document.body.clientWidth * 0.2 && params.swipeRight)
			    	params.swipeRight();
			    else if(deltaX < document.body.clientWidth * -0.2 && params.swipeLeft)
			    	params.swipeLeft();
			    
		    }
			    
	    });
	}
    
}