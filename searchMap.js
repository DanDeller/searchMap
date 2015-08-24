var circle     = $('circle').slice(0,11), // grab first 11 circles
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
		$('.map svg').each(function(){$(this)[0].setAttribute('viewBox','-149 100 1200 100')});
	} else {
		flag = false;
	}
})(state); // end zoomState(state)

// attach our crosshair to the map container
$(crosshair).insertBefore('.map svg');

// check our flag and determine which positions to set
var adjustTop  = flag ? 103 : 115,
    adjustLeft = flag ? 65 : 55;

// sorry all these adjustments...
// adjust even more for tablet and mobile!
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

// trim tab text one mobile screens
if ($(document).width() < 700) {
	$('.county-text').text('county');
	$('.state-text').text('state');
	$('.federal-text').text('federal');
	$('.online-text').text('online');
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

			//fade in our search box and set up counter for search bar
			$('#searching-box').delay(3000).fadeIn(500, function() {
		
				// start mugshot scroller
				$('#scroller').ICM_MugshotScroller({
					count: frameCount,
					speed: 75
				});

				// start progress bar
				// $('#main-loader .progress-bar, .search-right .progress-bar').ICM_ProgressBar({
				// 	autoStart    : true,
				// 	timer        : loaderTimer,
				// 	onComplete   : navigateToResults
				// });

				// create counter for progress bar
				var count,
					  bar = $('.bar');
				var loaderInterval = setInterval(function() {
					var counter = $('.counter'),
							count   = Math.round((bar.width() / bar.parent().width()) * 100),
							tab     = $('.tab'),
							tabText = $('.tab p');
					$(counter).text(count + '%');
					if (count == 99) {
						clearInterval(loaderInterval);
						$(counter).remove();
					}

					// check counter and change tab styles
					if (count == 1) {
						mobileSize ? $('.counter-box').removeClass('open') : $('.counter-box').addClass('open');
						$('.tab-icon.county').addClass('county-active');
						$(tabText[0]).addClass('active');
					}
					if (count == 25) {
						$(tab[0]).addClass('active-background');
						$('.tab-icon.state').addClass('state-active');
						$(tabText[1]).addClass('active');
					}
					if (count == 50) {
						$(tab[1]).addClass('active-background');
						$('.tab-icon.federal').addClass('federal-active');
						$(tabText[2]).addClass('active');
					}
					if (count == 75) {
						$(tab[2]).addClass('active-background');
						$('.tab-icon.online').addClass('online-active');
						$(tabText[3]).addClass('active');
					}
					if (count == 95) {
						$(tab[3]).addClass('active-background');
						$('.tab-icon.online').addClass('online-active');
						$(tabText[3]).addClass('active');
					}

					// move our counter box along with the progress bar
					$('.counter-box').css({'left' : count - 2 + '%'});
				}, 10);

				//reshape our svg loaders
				$('.svg2 circle').animate({
				  r: 96,
				});	
				$('.svg3 circle').animate({
				  r: 66,
				});

				// start our testimony and count lsider
				startTestimonials();
				startSlideCount();

			}); // end fadeIn search box
				
		} // end if (increment === 11)
	}); // end crosshair animate
} // end for loop

// make some quick sliders for testimonials
function startTestimonials() {
	if ($('.slider li:first-child').next('li').length > 0) {
    setTimeout(function() {
      $('.slider li.active').removeClass('active').next('li').addClass('active');
      startTestimonials();
      $('.slider li:first-child').appendTo($('.slider'));
    }, 6000);
  }
}

// make some quick sliders for testimonials dots
function startSlideCount() {
	if ($('.slide-count li:first-child').next('li').length > 0) {
    setTimeout(function() {
      $('.slide-count li.active').removeClass('active2').next('li').addClass('active2');
      startSlideCount();
      $('.slide-count li:first-child').appendTo($('.slide-count'));
    }, 6000);
  }
}
