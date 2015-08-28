// --------------------------------------------------
// SEARCH MAP JS
// Read SVG positions on map and plot out points with a crosshair		

var circle    = $('circle').slice(0,10), // grab first 10 circles
    crosshair = '<div class="crosshair"><span class="x-axis"></span><span class="y-axis"></span></div>', // create crosshair element
    pulseIt   = '<span class="pulse"></span>', // create pulse element
    coords    = [], // create array to stash our circle positions
    increment = 0, // initialize an increment count
    state     = window.state, // grab state
    latLine   = window.lat, // grab latitude
    longLine  = window.long, // grab longitude
    flag      = true; // set flag to determine whether searching for all or a certain state

// -----------------------------------------------------------
// SET OUR VIEWBOX AND OTHER DEFAULT SIZES BASED OFF OF FLAG

(function zoomState() {
	if (state === 'ALL') {
		$('.map svg').each(function(){$(this)[0].setAttribute('viewBox','-149 100 1200 100')});
	} else {
		flag = false;
	}
})(state);

// attach our crosshair to the map container
$(crosshair).insertBefore('.map svg');

// check our flag and determine which positions to set
var adjustTop  = flag ? 65 : 52,
    adjustLeft = flag ? 65 : 53;

// sorry all these adjustments...
// adjust even more for tablet and mobile!
var tabletSize = $(document).width() <= 872,
    mobileSize = $(document).width() <= 517;

if (tabletSize) {
	adjustTop  = flag ? 66 : 63,
	adjustLeft = flag ? 67 : 64;
}

if (mobileSize) {
	adjustTop  = flag ? 70 : 69,
	adjustLeft = flag ? 70 : 69;
}

// adjust a bit more for ff and safari
if ($.browser.safari || $.browser.mozilla) {
	adjustTop  = flag ? 65 : 61,
	adjustLeft = flag ? 65 : 61;
}

// END SET OUR VIEWBOX AND OTHER DEFAULT SIZES BASED OFF OF FLAG
// -----------------------------------------------------------


// -----------------------------------------------------------
// CHANGE TEXT FOR MOBILE VIEWERS

if ($(document).width() < 700) {
	$('.county-text').text('county');
	$('.state-text').text('state');
	$('.federal-text').text('federal');
	$('.online-text').text('online');
}

// END CHANGE TEXT FOR MOBILE VIEWERS
// -----------------------------------------------------------


// -----------------------------------------------------------
// GET COORDS FOR FIRST 10 CIRCLES AND PLOT THEM

for (var i = 0; i < 10; i++) {

	// check flag. if true you're on a single state so resize the circles
	if (!flag) {
		$(circle[i]).attr('r','4');
	}

	// push circles to our coords array and reverse the order
	coords.push($(circle[i]).offset());

	// hide all circles, fade in our crosshair, and fade in the first 11 circles
	$('.crosshair').fadeIn();
	$(circle[i]).hide().delay(700 * i).fadeIn(500).css({'fill':'#fff'});

	// plot our crosshair coordinates and set callback to add additional functionality
	$('.crosshair').animate({
		'top': (coords[i].top - $('#map-container').offset().top) - adjustTop,
		'left': (coords[i].left - $('#map-container').offset().left) - adjustLeft
	}, 600, function() {

		increment++;

		if (increment === 10) {
			startSearchBox();		
		}

	}); // end crosshair animate
} // end for loop

// END GET COORDS FOR FIRST 11 CIRCLES AND PLOT THEM
// -----------------------------------------------------------


// -----------------------------------------------------------
// CALLBACK FUNCTION - called once increment count hits 10

function startSearchBox() {
	$('.crosshair').append(pulseIt);

	// position crosshair over top result position
	$('.crosshair').animate({
		'top': (coords[0].top - $('#map-container').offset().top) - adjustTop,
		'left': (coords[0].left - $('#map-container').offset().left) - adjustLeft
	}, 600, function() {
		// set a quick timeout to delay the start of our circle loaders
		setTimeout(function() {
			startRadialLoader($('.radial-loader').first());
		}, 3000);
	});

	//fade in our search box and set up counter for search bar
	$('#searching-box').delay(3000).fadeIn(500, function() {

		// start mugshot scroller
		$('#scroller').ICM_MugshotScroller({
			count: frameCount,
			speed: 75
		});

		// start progress bars
		$('#main-loader .progress-bar').ICM_ProgressBar({
			autoStart    : true,
			timer        : loaderTimer,
			onComplete   : navigateToResults
		});

		$('.search-right .progress-bar').ICM_ProgressBar({
			autoStart    : true,
			timer        : loaderTimer,
			onComplete   : function() {
				$(this).parent().find('span').css({'color' : 'green'});
			}
		});

		// create counter for progress bar
		var count,
		    bar = $('.bar'),
		    activeUrl = '/assets/themes/deboot/img/searching/states-active/' + state + '-active.svg';

		var loaderInterval = setInterval(function() {
			var counter = $('.counter'),
			    count   = Math.round((bar.width() / bar.parent().width()) * 100),
			    tab     = $('.tab'),
			    tabText = $('.tab p');

			$(counter).text(count + '%');

			if (count == 99) {
				clearInterval(loaderInterval);
				$(counter).remove();
				$('.counter-box').removeClass('open');
			}

			// check counter and change tab styles
			if (count == 1) {
				// if we're on a mobile sized screen hide the counter
				mobileSize ? $('.counter-box').removeClass('open') : $('.counter-box').addClass('open');
				$(tabText[0]).addClass('active');
				$('.tab-icon.county').addClass('county-active');
			}
			if (count == 25) {
				$(tab[0]).addClass('active-background');
				$(tabText[1]).addClass('active');
				$('.tab-icon.state').css({'background' : 'url(' + activeUrl + ')'});
			}
			if (count == 50) {
				$(tab[1]).addClass('active-background');
				$(tabText[2]).addClass('active');
				$('.tab-icon.federal').addClass('federal-active');
			}
			if (count == 75) {
				$(tab[2]).addClass('active-background');
				$(tabText[3]).addClass('active');
				$('.tab-icon.online').addClass('online-active');
			}
			if (count == 95) {
				$(tab[3]).addClass('active-background');
			}

			// move our counter box along with the progress bar
			$('.counter-box').css({'left' : (count - 2) + '%'});
		}, 10);

		//reshape our svg loaders
		$('.svg2 circle').attr('r', '96');
		$('.svg3 circle').attr('r', '66');

		// start our testimony and count slider and set state background
		startTestimonials();
		setStateIcon(state);

	}); // end fadeIn search box
};

// END CALLBACK FUNCTION
// -----------------------------------------------------------


// -----------------------------------------------------------
// START TESTIMONIAL SLIDER - called in callback function

function startTestimonials() {
	if ($('.slider li:first-child').next('li').length > 0 && $('.slide-count li:first-child').next('li').length > 0) {
    		setTimeout(function() {
	        	$('.slider li.active, .slide-count li.active')
	      		.removeClass('active active2')
		      	.next('li')
		      	.addClass('active active2');
	      		startTestimonials();
		        $('.slider li:first-child').appendTo($('.slider'));
		        $('.slide-count li:first-child').appendTo($('.slide-count'));
	    	}, 10000);
	}
}

// END START TESTIMONIAL SLIDER
// -----------------------------------------------------------


// -----------------------------------------------------------
// SET STATE ICON

function setStateIcon(state) {
	var stateUrl = '/assets/themes/deboot/img/searching/states/' + state + '.svg';
	$('.tab-icon.state').css({'background' : 'url(' + stateUrl + ')'});
}

// END SET STATE ICON
// -----------------------------------------------------------
