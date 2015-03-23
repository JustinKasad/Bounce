window.onload = function() {

  var CANVAS_WIDTH = window.outerWidth;
  var CANVAS_HEIGHT = window.outerHeight;
  var rectWidth = 120;
  var rectHeight = 50;
  var rectX = CANVAS_WIDTH / 2 - rectWidth / 2;
  var rectY = CANVAS_HEIGHT - 60;
  var cornerRadius = 20;
  var isDrag = false;
  var mx, my; // mouse coordinates
  var mySelColor = '#999';
  var mySelWidth = 2;
  var offsetx, offsety, selection, valid;
  var pad;
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  var FPS = 30;
  var fps;
  var gravity = 1; //ball gravity
  var bounceFactor = 1.1;  // ball bounce factor
  var html = document.body.parentNode;
  var htmlTop = html.offsetTop;
  var htmlLeft = html.offsetLeft;
  var play = false;
  var bounceDifficulty = 30;
  var score = 0;
  var highscore = 0;
  var randomColor = 'red';
  var padAcceleration = 0;
  var particles = [];
  var stars = [];
  var starInterval;
  var background = new Background(0,300);
  var background2 = new Background(0,0);
  var counter = 0;

  var canvasElement = document.createElement("canvas");
  canvasElement.width = CANVAS_WIDTH;
  canvasElement.height = CANVAS_HEIGHT;
  canvasElement.id = 'canvas';
  var canvas = canvasElement.getContext("2d");
  document.body.appendChild(canvasElement);

//  var canvasElement = $("<canvas id='canvas' width='" + CANVAS_WIDTH +
//    "' height='" + CANVAS_HEIGHT + "'></canvas>");
//  var canvas = canvasElement.get(0).getContext("2d");
//  canvasElement.appendTo('body');

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
  var $_canvas = document.getElementById('canvas');
  if (document.defaultView && document.defaultView.getComputedStyle) {
    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle($_canvas, null)['paddingLeft'], 10)      || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle($_canvas, null)['paddingTop'], 10)       || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle($_canvas, null)['borderLeftWidth'], 10)  || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle($_canvas, null)['borderTopWidth'], 10)   || 0;
  }

  if(typeof(Storage) !== "undefined") {
    if(localStorage.getItem('highscore')){
      highscore = localStorage.getItem('highscore');
    }
  } else {
    // Sorry! No Web Storage support..
  }

  var ball = {
    x: CANVAS_WIDTH/2,
    y: 75,

    radius: 15,
    color: "red",
    height: 30,
    width: 30,

    // Velocity components
    vx: 0,
    vy: 1,

    reset: function(){
      this.x = CANVAS_WIDTH/2;
      this.y = 75;
      this.vx = 0;
      this.vy = 1;

    },
    draw: function() {
      // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
      canvas.beginPath();
      canvas.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
      canvas.fillStyle = this.color;
      canvas.fill();
      canvas.closePath();
    }
  };

  function resizeCanvas() {
    canvas.width = CANVAS_WIDTH = window.outerWidth;
    canvas.height = CANVAS_HEIGHT = window.outerHeight;

    /**
     * Your drawings need to be inside this function otherwise they will be reset when
     * you resize the browser window and the canvas goes will be cleared.
     */
    if(fps) {
      clearInterval(fps);
    }

    pad = new Shape(rectX, rectY, rectWidth, rectHeight);
    canvas.fillStyle = getRndColor();
    var fps = setInterval(function() {
      update();
      canvas.clearRect(0, 0, canvas.width, canvas.height);
      draw();
    }, 1000/FPS);
  }
  resizeCanvas();
  setEvents();




  function update() {
    if(play){
      ball.y += ball.vy;
      ball.x += ball.vx;
      counter++;

      if(counter % 10 == 0){
        score++;
      }


      // Ohh! The ball is moving!
      // Lets add some acceleration
      ball.vy += gravity;
      //Perfect! Now, lets make it rebound when it touches the floor
      if(collides(pad, ball)) {
        // First, reposition the ball on top of the pad and then bounce it!

        randomColor = getRndColor();

        ball.vx = bounceDifficulty * ((ball.x-(pad.x+pad.width/2))/pad.width);
        bounceDifficulty = bounceDifficulty;
        if(bounceDifficulty > 150){
          bounceDifficulty = 100;
        }

        ball.vy = padAcceleration * 30;
        if(ball.vy < 15){
          ball.vy = 15;
        } else if(ball.vy > 25){
          ball.vy = 25;
        }
        ball.vy *= -bounceFactor;
      }

      var i = stars.length;
      while (i--) {
        if(collides(ball, stars[i])){
          boom(canvas, stars[i].x, stars[i].y);
          stars.splice(i, 1);;
          score += 25;
          addSubtext("+ 25");
        }
      }



      if (ball.x + ball.width > CANVAS_WIDTH || ball.x < 0){
        ball.vx = -ball.vx;
      }

      if(ball.y  > CANVAS_HEIGHT) {
          createExplosion(ball.x, ball.y - ball.radius, "#525252");
          createExplosion(ball.x, ball.y - ball.radius, "red");

          if(score > highscore){
            highscore = score;
            localStorage.setItem('highscore', highscore)
          }

          setTimeout(function(){
            play = false;
            score = 0;
            bounceDifficulty = 10;
            ball.reset();
            stars = [];
            if(starInterval){
              clearInterval(starInterval)
            }
          }, 1500)




      }

    }



  }


  function draw() {
    background.draw();
    background2.draw();

    pad.draw();
    ball.draw();
    canvas.textAlign = "end";
    canvas.font = "bold 24px Comic Sans MS";
    canvas.fillStyle = "red";

    if(play){
      canvas.fillText(score, CANVAS_WIDTH - 5, 30);

      for (var i=0; i<particles.length; i++) {
        var particle = particles[i];

        particle.update(1000 / 60);
        particle.draw(canvas);
      }
      for (var i=0; i<stars.length; i++) {
        var star = stars[i];

        star.draw(canvas);
      }
    } else {
      canvas.fillText("Highscore: " + highscore, CANVAS_WIDTH - 5, 30);
    }
//    canvas.font = "30px Comic Sans MS";
//    canvas.fillStyle = randomColor;
//    canvas.textAlign = 'center';
//    canvas.fillText("Hello William", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  function drawStar(){


    starInterval = setInterval(function(){
      stars.push(new star(canvas, randomFloat(0, 300), randomFloat(0, 300), 30, 5, 0.5));
      if(stars.length > 3){
        stars.shift();
      }
    }, 2000)
  }


  function Shape(x, y, w, h, fill) {
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    // But we aren't checking anything else! We could put "Lalala" for the value of x
    this.x = x || 0;
    this.y = y || 0;
    this.w = this.width = w || 1;
    this.h = this.height = h || 1;
    this.fill = fill || '#000';

    this.draw = function(){
      canvas.lineJoin = "round";
      canvas.lineWidth = cornerRadius;
      canvas.fillStyle = 'red';
      canvas.strokeRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), this.w-cornerRadius, this.h-cornerRadius);
      canvas.fillRect(this.x+(cornerRadius/2), this.y+(cornerRadius/2), this.w-cornerRadius, this.h-cornerRadius);

    }
    this.contains = function(){
      // All we have to do is make sure the Mouse X,Y fall in the area between
      // the shape's X and (X + Width) and its Y and (Y + Height)
      return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y <= my) && (this.y + this.h >= my);

    }
  }

  var log;



  function setEvents(){

    //fixes a problem where double clicking causes text to get selected on the canvas
    $_canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging
    $_canvas.addEventListener('touchstart', function(e) {
      var mouse = getMouse(e);
      var mx = mouse.x;
      var my = mouse.y;
      if (pad.contains(mx, my)) {
        var mySel = pad;
        // Keep track of where in the object we clicked
        // so we can move it smoothly (see mousemove)
        offsetx = mx - mySel.x;
        offsety = my - mySel.y;
        isDrag = true;
        selection = mySel;
        valid = false;
        if(play == false){
          drawStar();
        }
        play = true;
        log = makeVelocityCalculator(e, function(v) {
          padAcceleration = v;
        });

        return;
      }

    }, true);
    $_canvas.addEventListener('touchmove', function(e) {
      if (isDrag){
        var mouse = getMouse(e);
        // We don't want to drag the object by its top-left corner, we want to drag it
        // from where we clicked. Thats why we saved the offset and use it here
        selection.x = ((mouse.x - offsetx) + pad.width) > CANVAS_WIDTH ? CANVAS_WIDTH - pad.width : (mouse.x - offsetx) > 0 ? (mouse.x - offsetx) : 0;
        selection.y = (mouse.y - offsety) > 400 ? (mouse.y - offsety + pad.height > CANVAS_HEIGHT ? CANVAS_HEIGHT - pad.height : mouse.y - offsety) : 400;
        valid = false; // Something's dragging so we must redraw
        log(e);


      }
    }, true);
    $_canvas.addEventListener('touchend', function(e) {
      isDrag = false;
    }, true);

  }

  function addSubtext(text){
    if(interval){
      clearInterval(interval);
    }

    canvas.textAlign = "end";
    canvas.font = "bold 24px Comic Sans MS";
    canvas.fillStyle = "rgba(255, 215, 0, " + alpha + ")";
    canvas.fillText( text, CANVAS_WIDTH - 5, 60);

    var alpha = 1.0,   // full opacity
      interval = setInterval(function () {
        canvas.textAlign = "end";
        canvas.font = "bold 24px Comic Sans MS";
        canvas.fillStyle = "rgba(255, 215, 0, " + alpha + ")";
        canvas.fillText( text, CANVAS_WIDTH - 5, 60);
        alpha = alpha - 0.05; // decrease opacity (fade out)
        if (alpha < 0) {
          canvas.width = canvas.width;
          clearInterval(interval);
        }
      }, 1000/FPS);
  }

  function makeVelocityCalculator(e_init, callback) {
    var x = e_init.changedTouches[0].pageX,
      y = e_init.changedTouches[0].pageY,
      t = Date.now();

    return function(e) {
      var new_x = e.changedTouches[0].pageX,
        new_y = e.changedTouches[0].pageY,
        new_t = Date.now();
      var x_dist = new_x - x,
        y_dist = new_y - y,
        interval = new_t - t;
      // update values:
      x = new_x;
      y = new_y;
      t = new_t;
      var velocity = Math.sqrt(x_dist*x_dist+y_dist*y_dist)/interval;
      callback(velocity);
    };
  }



  function collides(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function getMouse(e) {
    var element = canvas, offsetX = 0, offsetY = 0;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += stylePaddingLeft + styleBorderLeft + htmlLeft;
    offsetY += stylePaddingTop + styleBorderTop + htmlTop;

    mx = e.changedTouches[0].pageX - offsetX;
    my = e.changedTouches[0].pageY - offsetY;

    // We return a simple javascript object (a hash) with x and y defined
    return {x: mx, y: my};
  }

  function getRndColor() {
    var r = 255*Math.random()|0,
      g = 255*Math.random()|0,
      b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function Particle () {
    this.scale = 1.0;
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.color = "#000";
    this.velocityX = 0;
    this.velocityY = 0;
    this.scaleSpeed = 0.5;

    this.update = function(ms)
    {
      // shrinking
      this.scale -= this.scaleSpeed * ms / 1000.0;

      if (this.scale <= 0)
      {
        this.scale = 0;
      }
      // moving away from explosion center
      this.x += this.velocityX * ms/1000.0;
      this.y += this.velocityY * ms/1000.0;
    };

    this.draw = function(context2D)
    {
      // translating the 2D context to the particle coordinates
      context2D.save();
      context2D.translate(this.x, this.y);
      context2D.scale(this.scale, this.scale);

      // drawing a filled circle in the particle's local space
      context2D.beginPath();
      context2D.arc(0, 0, this.radius, 0, Math.PI*2, true);
      context2D.closePath();

      context2D.fillStyle = this.color;
      context2D.fill();

      context2D.restore();
    };
  }
  function randomFloat (min, max)
  {
    return min + Math.random()*(max-min);
  }
  function createExplosion(x, y, color) {
    var minSize = 10;
    var maxSize = 30;
    var count = 10;
    var minSpeed = 60.0;
    var maxSpeed = 200.0;
    var minScaleSpeed = 1.0;
    var maxScaleSpeed = 4.0;

    for (var angle=0; angle<360; angle += Math.round(360/count))
    {
      var particle = new Particle();

      particle.x = x;
      particle.y = y;

      particle.radius = randomFloat(minSize, maxSize);

      particle.color = color;

      particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);

      var speed = randomFloat(minSpeed, maxSpeed);

      particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
      particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);

      particles.push(particle);
    }
  }


  function star(ctx, x, y, r, p, m)
  {
    this.x = x;
    this.y = y;
    this.r = r;
    this.width = this.height = this.r * 2;
    this.p = p;
    this.m = m;
    this.draw = function(ctx){
      ctx.fillStyle = 'GoldenRod';
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.moveTo(0,0-this.r);
      for (var i = 0; i < this.p; i++)
      {
        ctx.rotate(Math.PI / this.p);
        ctx.lineTo(0, 0 - (this.r*this.m));
        ctx.rotate(Math.PI / this.p);
        ctx.lineTo(0, 0 - this.r);
      }
      ctx.fillStyle = 'gold';
      ctx.fill();
      ctx.restore();
      ctx.closePath();
    }

  }

  var imageRepository = new function() {
    // Define images
    this.background = new Image();
    // Set images src
    this.background.src = "img/bg.png";
  }

  function Background(x, y) {
    this.x = x;
    this.y = y;


    this.speed = 1; // Redefine speed of the background for panning
    // Implement abstract function
    this.draw = function() {
      // Pan background
      this.y += this.speed;
      canvas.drawImage(imageRepository.background, this.x, this.y);
      // Draw another image at the top edge of the first image
      canvas.drawImage(imageRepository.background, this.x, this.y - CANVAS_WIDTH);
      // If the image scrolled off the screen, reset
      if (this.y >= CANVAS_HEIGHT)
        this.y = 0;
    };
  }


  function boom(ctx, actualX,actualY) {

    // Shim with setTimeout fallback


    var laX = actualX;
    var laY = actualY;
    var W = canvasElement.width;
    var H = canvasElement.height;
    // Let's set our gravity
    var gravity = 1;

    // Time to write a neat constructor for our
    // particles.
    // Lets initialize a random color to use for
    // our particles and also define the particle
    // count.
    var particle_count = 20;
    var particles = [];

    var random_color = 'gold';

    function Particle() {
      this.radius = parseInt(Math.random() * 8);
      this.x = actualX;
      this.y = actualY;

      this.color = random_color;

      // Random Initial Velocities
      this.vx = Math.random() * 4 - 2;
      // vy should be negative initially
      // then only will it move upwards first
      // and then later come downwards when our
      // gravity is added to it.
      this.vy = Math.random() * -14 - 1;

      // Finally, the function to draw
      // our particle
      this.draw = function() {
        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fill();

        ctx.closePath();
      };
    }

    // Now lets quickly create our particle
    // objects and store them in particles array
    for (var i = 0; i < particle_count; i++) {
      var particle = new Particle();
      particles.push(particle);
    }


    // Finally, writing down the code to animate!
    (function renderFrame() {
      requestAnimationFrame(renderFrame);

      // Clearing screen to prevent trails

      particles.forEach(function(particle) {

        // The particles simply go upwards
        // It MUST come down, so lets apply gravity
        particle.vy += gravity;

        // Adding velocity to x and y axis
        particle.x += particle.vx;
        particle.y += particle.vy;

        // We're almost done! All we need to do now
        // is to reposition the particles as soon
        // as they move off the canvas.
        // We'll also need to re-set the velocities



        particle.draw();

      });
    }());


}






};


