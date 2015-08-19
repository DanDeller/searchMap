var circle     = $('circle'),
    hideIt     = $(circle).slice(0,11),
    crosshair  = '<div class="crosshair"><span class="x-axis"></span><span class="y-axis"></span></div>',
    pulseIt    = '<span class="pulse"></span>',
    coords     = [],
    increment  = 0,
    state      = window.state,
    latLine    = window.lat,
    longLine   = window.long,
    singleRad  = 4,
    flag       = true;

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

// becasue firefox...
var adjustTop  = flag ? 103 : 112,
    adjustLeft = flag ? 65 : 55;

if ($.browser.mozilla) {
	var adjustTop  = flag ? -210 : -199,
	    adjustLeft = flag ? 144 : 134;
}

// get coords for first 11 locations
for (var i = 0; i < 11; i++) {

	// check flag. if true you're on a single state so resize the circles
	if (!flag) {
		$(circle[i]).animate({
		    r: singleRad
		});
	} // end if check if flag not set

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
	}, 550, function() {

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
				}, 1000);
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
				
		} // end if
	}); // end crosshair animate
} // end for loop

// grab our circle x and y positions
$('circle').on('click', function(ev) {
	var svgPos = $('svg').position(),
	x = svgPos.left + parseInt($(ev.target).attr('cx')),
	y = svgPos.top + parseInt($(ev.target).attr('cy')),
	svgcoords = [x, y];
});

// fire click event on circles
setTimeout(function() {
	$('circle').trigger('click');
}, 1000);
