jQuery(document).ready(function(){

		var tl = new TimelineLite({delay: 1}),
    firstBg = document.querySelectorAll('.text__first-bg'),
    secBg = document.querySelectorAll('.text__second-bg'),
    word  = document.querySelectorAll('.text__word');
  
  tl
    .to(firstBg, 0.2, {scaleX:1})
    .to(secBg, 0.2, {scaleX:1})
    .to(word, 0.1, {opacity:1}, "-=0.1")  
    .to(firstBg, 0.2, {scaleX:0})
    .to(secBg, 0.2, {scaleX:0});
  
  //document.querySelector('.restart').onclick = function() {tl.restart()};


	/*
		convert a cubic bezier value to a custom mina easing
		http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
	*/
	var duration = 500,
		epsilon = (200 / 60 / duration) / 4,
		firstCustomMinaAnimation = bezier(.42,.03,.77,.63, epsilon),
		secondCustomMinaAnimation = bezier(.27,.5,.6,.99, epsilon),
		animating = false;

	//initialize the slider
	$('.slider-wrapper').each(function(){
		initSlider($(this));
	});

	function initSlider(sliderWrapper) {
		//cache jQuery objects
		var slider = sliderWrapper.find('.slider'),
			sliderNav = sliderWrapper.find('.slider-navigation'),
			sliderControls = sliderWrapper.find('.slider-controls').find('li');

		//store path 'd' attribute values	
		var pathArray = [];
		pathArray[0] = slider.data('step1');
		pathArray[1] = slider.data('step4');
		pathArray[2] = slider.data('step2');
		pathArray[3] = slider.data('step5');
		pathArray[4] = slider.data('step3');
		pathArray[5] = slider.data('step6');

		//update visible slide when user clicks next/prev arrows
		sliderNav.on('click', '.next-slide', function(event){
			event.preventDefault();
			setTimeout(function() {
			nextSlide(slider, sliderControls, pathArray);
			},200);
			$('.slider').removeClass('trans');
			$('.slider').addClass('animate');
			setTimeout(function() {
				$('.slider').removeClass('animate');
				$('.slider').addClass('trans');
			},1200);
		});
		sliderNav.on('click', '.prev-slide', function(event){
			event.preventDefault();
			setTimeout(function() {
				prevSlide(slider, sliderControls, pathArray);
			},200);
			$('.slider').removeClass('trans');
			$('.slider').addClass('animate');
			setTimeout(function() {
				$('.slider').removeClass('animate');
				$('.slider').addClass('trans');
			},1200)
		});

		//detect swipe event on mobile - update visible slide
		slider.on('swipeleft', function(event){
		setTimeout(function() {
			nextSlide(slider, sliderControls, pathArray);
			},200);
			$('.slider').removeClass('trans');
			$('.slider').addClass('animate');
			setTimeout(function() {
				$('.slider').removeClass('animate');
				$('.slider').addClass('trans');
			},1200);
			
		});
		slider.on('swiperight', function(event){			
		setTimeout(function() {
				prevSlide(slider, sliderControls, pathArray);
			},200);
			$('.slider').removeClass('trans');
			$('.slider').addClass('animate');
			setTimeout(function() {
				$('.slider').removeClass('animate');
				$('.slider').addClass('trans');
			},1200)
		});

		//update visible slide when user clicks .slider-controls buttons
		sliderControls.on('click', function(event){
			event.preventDefault();
			var selectedItem = $(this);
			if(!selectedItem.hasClass('selected')) {
				setTimeout(function() {
					// if it's not already selected
				var selectedSlidePosition = selectedItem.index(),
					selectedSlide = slider.children('li').eq(selectedSlidePosition),
					visibleSlide = retrieveVisibleSlide(slider),
					visibleSlidePosition = visibleSlide.index(),
					direction = '';
				direction = ( visibleSlidePosition < selectedSlidePosition) ? 'next': 'prev';
				updateSlide(visibleSlide, selectedSlide, direction, sliderControls, pathArray);
				},200);
				$('.slider').removeClass('trans');
				$('.slider').addClass('animate');
				setTimeout(function() {
					$('.slider').removeClass('animate');
					$('.slider').addClass('trans');
				},1200)
				
			}
		});

		//keyboard slider navigation
		$(document).keyup(function(event){
			if(event.which=='37' && elementInViewport(slider.get(0)) ) {				
				setTimeout(function() {
					prevSlide(slider, sliderControls, pathArray);
				},200);
				$('.slider').removeClass('trans');
				$('.slider').addClass('animate');
				setTimeout(function() {
					$('.slider').removeClass('animate');
					$('.slider').addClass('trans');
				},1200)
			} else if( event.which=='39' && elementInViewport(slider.get(0)) ) {

				setTimeout(function() {
					nextSlide(slider, sliderControls, pathArray);
				},200);
				$('.slider').removeClass('trans');
				$('.slider').addClass('animate');
				$('.text__word').animate({opacity: 0},100);
				setTimeout(function() {
					$('.slider').removeClass('animate');
					$('.slider').addClass('trans');
				},1200);
				setTimeout(function() {
					tl.restart()
				},1600);
			}
		});
	}

	function retrieveVisibleSlide(slider, sliderControls, pathArray) {
		return slider.find('.visible');
	}
	function nextSlide(slider, sliderControls, pathArray ) {
		var visibleSlide = retrieveVisibleSlide(slider),
			nextSlide = ( visibleSlide.next('li').length > 0 ) ? visibleSlide.next('li') : slider.find('li').eq(0);
		updateSlide(visibleSlide, nextSlide, 'next', sliderControls, pathArray);
	}
	function prevSlide(slider, sliderControls, pathArray ) {
		var visibleSlide = retrieveVisibleSlide(slider),
				prevSlide = ( visibleSlide.prev('li').length > 0 ) ? visibleSlide.prev('li') : slider.find('li').last();
			updateSlide(visibleSlide, prevSlide, 'prev', sliderControls, pathArray);
	}
	function updateSlide(oldSlide, newSlide, direction, controls, paths) {
		if(!animating) {
			//don't animate if already animating
			animating = true;
			var clipPathId = newSlide.find('path').attr('id'),
				clipPath = Snap('#'+clipPathId);

			if( direction == 'next' ) {
				var path1 = paths[0],
					path2 = paths[2],
					path3 = paths[4];
			} else {
				var path1 = paths[1],
					path2 = paths[3],
					path3 = paths[5];
			}

			updateNavSlide(newSlide, controls);
			newSlide.addClass('is-animating');
			clipPath.attr('d', path1).animate({'d': path2}, duration, firstCustomMinaAnimation, function(){
				clipPath.animate({'d': path3}, duration, secondCustomMinaAnimation, function(){
					oldSlide.removeClass('visible');
					newSlide.addClass('visible').removeClass('is-animating');
					animating = false;
				});
			});
		}
	}

	function updateNavSlide(actualSlide, controls) {
		var position = actualSlide.index();
		controls.removeClass('selected').eq(position).addClass('selected');
	}

	function bezier(x1, y1, x2, y2, epsilon){
		//https://github.com/arian/cubic-bezier
		var curveX = function(t){
			var v = 1 - t;
			return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
		};

		var curveY = function(t){
			var v = 1 - t;
			return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
		};

		var derivativeCurveX = function(t){
			var v = 1 - t;
			return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
		};

		return function(t){

			var x = t, t0, t1, t2, x2, d2, i;

			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++){
				x2 = curveX(t2) - x;
				if (Math.abs(x2) < epsilon) return curveY(t2);
				d2 = derivativeCurveX(t2);
				if (Math.abs(d2) < 1e-6) break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0, t1 = 1, t2 = x;

			if (t2 < t0) return curveY(t0);
			if (t2 > t1) return curveY(t1);

			// Fallback to the bisection method for reliability.
			while (t0 < t1){
				x2 = curveX(t2);
				if (Math.abs(x2 - x) < epsilon) return curveY(t2);
				if (x > x2) t0 = t2;
				else t1 = t2;
				t2 = (t1 - t0) * .5 + t0;
			}

			// Failure
			return curveY(t2);

		};
	};

	/*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
	function elementInViewport(el) {
		var top = el.offsetTop;
		var left = el.offsetLeft;
		var width = el.offsetWidth;
		var height = el.offsetHeight;

		while(el.offsetParent) {
		    el = el.offsetParent;
		    top += el.offsetTop;
		    left += el.offsetLeft;
		}

		return (
		    top < (window.pageYOffset + window.innerHeight) &&
		    left < (window.pageXOffset + window.innerWidth) &&
		    (top + height) > window.pageYOffset &&
		    (left + width) > window.pageXOffset
		);
	}
});