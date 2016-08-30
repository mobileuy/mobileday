
function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

function initializeClock(id, endtime) {
    var clock = $('#' + id);
    var daysSpan = clock.find('#days');
    var hoursSpan = clock.find('#hours');
    var minutesSpan = clock.find('#mins');
    var secondsSpan = clock.find('#secs');

    function updateClock() {
        var t = getTimeRemaining(endtime);

        daysSpan.html(t.days);
        hoursSpan.html(('0' + t.hours).slice(-2));
        minutesSpan.html(('0' + t.minutes).slice(-2));
        secondsSpan.html(('0' + t.seconds).slice(-2));

        if (t.total <= 0) {
            clearInterval(timeinterval);
        }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
}


var deadline = 'November 12 2016 09:00:00 GMT-0300';
initializeClock('counter', deadline);
function removeQuotes(string) {
    if (typeof string === 'string' || string instanceof String) {
        string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
    }
    return string;
}

function getBreakpoint(element) {
    var style = null;
    if ( window.getComputedStyle && window.getComputedStyle(element, '::before') && window.getComputedStyle(element, '::before').content != "" ) {
        style = window.getComputedStyle(element, '::before');
        style = style.content;
    } else {
        if (typeof window.getComputedStyle === "undefined") {
            window.getComputedStyle = function (el) {
                this.el = el;
                this.getPropertyValue = function (prop) {

                    var style = el.currentStyle || el.style

                    if (typeof prop === "undefined" || typeof style === "undefined") {
                        return null;
                    }

                    var re = /(\-([a-z]){1})/g;
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return style[prop] ? style[prop] : null;
                }
                return this;
            }
        }
        style = window.getComputedStyle(document.getElementsByTagName('head')[0]);
        style = style.getPropertyValue('font-family');
    }

    style = style || "{}";
    return JSON.parse(removeQuotes(style));
}
$(function(){
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9iaWxlZGF5dXkiLCJhIjoiY2lxNHNhN2QyMDAwYmZsbTZydG4yb2ZzeSJ9.lFAWW3TvMm5EzUOQoNPloQ';

    var isMobileViewport = getBreakpoint(document.querySelector('.variables-metadata')).mobile_viewport;
    var venuePos = [-56.19448037405206, -34.89219928156295];
    var centerPos = isMobileViewport ? venuePos : [-56.208100, -34.892280];

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mobiledayuy/cirmxjudm000lg3nkghetgp16',
        zoom: 14.36,
        center: centerPos,
        pitch: 0.00,
        interactive: false
    });

    map.on('style.load', function () {
        map.addSource("markers", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-56.19448037405206, -34.89219928156295]
                    }
                }]
            }
        });
        map.addLayer({
            "id": "markers",
            "type": "symbol",
            "source": "markers",
            "layout": {
                "icon-image": "blue-marker",
                "icon-offset": [0, -30]
            }
        });
    });
});

$(document.body).on('click', '.navbar-toggle.collapsed', function () {
  $(this).removeClass("collapsed");
  var targetNav = $(this).attr("data-target");
  $(targetNav).addClass("in");
  $('html').addClass('nav-bar-opened');

  $(targetNav).on('click', '.c-menu__item', function() {
    collapse(targetNav);
  });
});

$(document.body).on('click', '.navbar-toggle:not(.collapsed)', function () {
  collapse($(this).attr("data-target"));
});

function collapse(targetNav) {
  $(targetNav).removeClass("in");
  $('.navbar-toggle').addClass("collapsed");
  $('html').removeClass('nav-bar-opened');
  $(targetNav).off('click', '.c-menu__item');
}

/**
 * Generates random particles using canvas
 *
 * @class Particles
 * @constructor
 */
function Particles(canvasElement){
  //particle colors
  this.colors = [
    '255, 255, 255',
    '255, 190, 190',
    '200, 200, 255'
  ];
  //adds gradient to particles on true
  this.blurry = false;
  //adds white border
  this.border = false;
  //particle radius min/max
  this.minRadius = 5;
  this.maxRadius = 10;
  //particle opacity min/max
  this.minOpacity = .001;
  this.maxOpacity = .5;
  //particle speed min/max
  this.minSpeed = .001;
  this.maxSpeed = .5;
  //frames per second
  this.fps = 15;
  //number of particles
  this.numParticles = 250;
  //required canvas variables
  this.canvas = canvasElement;
  this.ctx = this.canvas.getContext('2d');
  this.particles = [];
  this.intervalId = null;
}

/**
 * Initializes everything
 * @method init
 */
Particles.prototype.init = function(){
  this.render();
};

/**
 * generates random number between min and max values
 * @param  {number} min value
 * @param  {number} max malue
 * @return {number} random number between min and max
 * @method _rand
 */
Particles.prototype._rand = function(min, max){
  return Math.random() * (max - min) + min;
};

/**
 * Sets canvas size and updates values on resize
 * @method render
 */
Particles.prototype.render = function(){
  var self = this,
      wHeight = $(window).height(),
      wWidth = $(window).width();

  self.canvas.width = wWidth;
  self.canvas.height = wHeight;
  self.numParticles = self.extractMetadata().particleCount;

  clearInterval(self.intervalId);

  if (self.numParticles == 0) {
    return;
  }

  self.createCircle();
};

Particles.prototype.extractMetadata = function () {
  return getBreakpoint(document.querySelector('.variables-metadata'));
};

/**
 * Randomly creates particle attributes
 * @method createCircle
 */
Particles.prototype.createCircle = function(){
  var self = this;

  for (var i = 0; i < this.numParticles; i++) {
    self.particles[i] = self.createParticle(i);

    //once values are determined, draw particle on canvas
    self.draw(self.particles, i);
  }
  //...and once drawn, animate the particle
  self.animate(self.particles);
};

Particles.prototype.createParticle = function(index) {
  var self = this;

  var vy = self._rand(self.minSpeed, self.maxSpeed);
      vx = self._rand(self.minSpeed, self.maxSpeed);

  return {
    radius: 1 ,//Math.sqrt(Math.sqr(vx)+Math.sqr(vy))
    xPos: self._rand(0, self.canvas.width),
    yPos: self._rand(0, self.canvas.height),
    xVelocity: self._rand(self.minSpeed, self.maxSpeed),
    yVelocity: vy,
    color: 'rgba(' + self.colors[~~(self._rand(0, self.colors.length))] + ',' + self._rand(self.minOpacity, self.maxOpacity) + ')'
  };
}

/**
 * Draws particles on canvas
 * @param  {array} Particle array from createCircle method
 * @param  {number} i value from createCircle method
 * @method draw
 */
Particles.prototype.draw = function(particle, i){
  var self = this,
      ctx = self.ctx;

  if (self.blurry === true ) {
    //creates gradient if blurry === true
    var grd = ctx.createRadialGradient(particle[i].xPos, particle[i].yPos, particle[i].radius, particle[i].xPos, particle[i].yPos, particle[i].radius/1.25);

    grd.addColorStop(1.000, particle[i].color);
    grd.addColorStop(0.000, 'rgba(34, 34, 34, 0)');
    ctx.fillStyle = grd;
  } else {
    //otherwise sets to solid color w/ opacity value
    ctx.fillStyle = particle[i].color;
  }

  if (self.border === true) {
        ctx.strokeStyle = '#fff';
        ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(particle[i].xPos, particle[i].yPos, particle[i].radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

/**
 * Animates particles
 * @param  {array} particle value from createCircle & draw methods
 * @method animate
 */
Particles.prototype.animate = function(particles){
  var self = this,
          ctx = self.ctx;

  self.intervalId = setInterval(function(){
    //clears canvas
    self.clearCanvas();
    //then redraws particles in new positions based on velocity
    for (var i = 0; i < self.numParticles; i++) {
      particles[i].xPos += particles[i].xVelocity;
      particles[i].yPos -= particles[i].yVelocity;

      //if particle goes off screen call reset method to place it offscreen to the left/bottom
      if (particles[i].xPos > self.canvas.width + particles[i].radius || particles[i].yPos > self.canvas.height + particles[i].radius) {
        self.resetParticle(particles, i);
      } else {
        self.draw(particles, i);
      }
    }
  }, 1000/self.fps);
};

/**
 * Resets position of particle when it goes off screen
 * @param  {array} particle value from createCircle & draw methods
 * @param  {number} i value from createCircle method
 * @method resetParticle
 */
Particles.prototype.resetParticle = function(particles, i){
  var self = this;

  var random = self._rand(0, 1);

  if (random > .5) {
    // 50% chance particle comes from left side of window...
    particles[i].  xPos = -particles[i].radius;
        particles[i].yPos =   self._rand(0, self.canvas.height);
  } else {
    //... or bottom of window
    particles[i].  xPos = self._rand(0, self.canvas.width);
        particles[i].yPos =   self.canvas.height + particles[i].radius;
  }
  //redraw particle with new values
  self.draw(particles, i);
};

/**
 * Clears canvas between animation frames
 * @method clearCanvas
 */
Particles.prototype.clearCanvas = function(){
  var self = this;

  this.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
};


// go go go!
$(".c-particles").each(function(index, element) {
  var particle = new Particles(element);
  particle.init();
  $(window).on('resize', $.proxy(particle.render, particle));
});
/**
 *  All internal anchor links will have a 900ms smooth scrolling animation to
 *  their destination and the URL will be updated to reflect the new position
 *  on the page.
 */
$(document).ready(function() {
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target);

        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 900, 'swing', function () {
            window.location.hash = target;
        });
    });
});