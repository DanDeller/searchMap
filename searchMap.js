var circle  = $('circle'), // get all svg circles
    hideIt     = $(circle).slice(0,11), // grab first 11 circles
    crosshair  = '<div class="crosshair"><span class="x-axis"></span><span class="y-axis"></span></div>', // create crosshair element
    pulseIt    = '<span class="pulse"></span>', // create pulse element
    coords     = [], // create array to stash our circle positions
    increment  = 0, // initialize an increment count
    state      = window.state, // grab state
    latLine    = window.lat, // grab latitude
    longLine   = window.long, // grab longitude
    flag       = true; // set flag to determine whether searching for all or a certain state

// set our viewBox if user selected all states
(function zoomState() {
	if (state === 'ALL') {
		$('svg').each(function(){$(this)[0].setAttribute('viewBox','-149 100 1200 100')});
	} else {
		flag = false;
	}
})(state); // end zoomState(state)

// attach our crosshair to the map container
$(crosshair).insertBefore('svg');

// check our flag and determine which positions to set
var adjustTop  = flag ? 103 : 115,
    adjustLeft = flag ? 65 : 55;

// sorry all these adjustments...
// but adjust even more for tablet and mobile!
var tabletSize = $(document).width() <= 872,
    mobileSize = $(document).width() <= 517;

if (tabletSize) {
	adjustTop  = flag ? 103 : 107,
	adjustLeft = flag ? 65 : 59;
}

if (mobileSize) {
	adjustTop  = flag ? 98 : 102,
	adjustLeft = flag ? 70 : 66;
}

// HUGE FIREFOX BUG WITH POSITIONING!!!!!!!!!
if ($.browser.mozilla) {
	var adjustTop  = flag ? -210 : -199,
	    adjustLeft = flag ? 200 : 134;
}

// get coords for first 11 locations
for (var i = 0; i < 11; i++) {

	// check flag. if true you're on a single state so resize the circles
	if (!flag) {
		$(circle[i]).animate({
		    r: 4
		});
	} // end if (!flag)

	// push circles to our coords array and reverse the order
	coords.push($(circle[i]).position());
	coords.reverse();

	// hide all circles, fade in our crosshair, and fade in the first 11 circles
	$('.crosshair').fadeIn();
	$(circle[i]).hide().delay(700 * i).fadeIn(500).css({'fill':'#fff'});

	// plot our crosshair coordinates and set callback to add additional functionality
	$('.crosshair').animate({
		'top': coords[i].top + adjustTop,
		'left': coords[i].left - adjustLeft
	}, 600, function() {

		increment++;

		if (increment === 11) {

			$(this).append(pulseIt);

			// position crosshair over top result position
			$('.crosshair').animate({
				'top': coords[9].top + adjustTop,
				'left': coords[9].left - adjustLeft
			}, 600, function() {
				// set a quick timeout to delay the start of our circle loaders
				setTimeout(function() {
					startRadialLoader($('.radial-loader').first());
				}, 3000);
			});

			//fade in our search box and use custom counter for search bar
			$('#searching-box').delay(3000).fadeIn(500, function() {
				var count,
					  bar = $('.bar'),
					  percent = $('<span class="counter" />').appendTo(bar);
					
				var loaderInterval = setInterval(function() {
					count = Math.round((bar.width() / bar.parent().width()) * 100);
					var counter = $('.counter');
					$(counter).text(count + '%');
					if (count == 99) {
						clearInterval(loaderInterval);
						$(counter).remove();
					}
				}, 100);
			});

			// start mugshot scroller
			$('#scroller').ICM_MugshotScroller({
				count: frameCount,
				speed: 75
			});

			// start progress bar
			$('#main-loader .progress-bar').ICM_ProgressBar({
				autoStart    : true,
				timer        : loaderTimer,
				onComplete   : navigateToResults
			});
				
		} // end if (increment === 11)
	}); // end crosshair animate
} // end for loop
