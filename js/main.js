window.onload = function() {

  var CANVAS_WIDTH = window.outerWidth || window.innerWidth;
  var CANVAS_HEIGHT = window.outerHeight || window.innerHeight;
  var rectWidth = 120;
  var rectHeight = 50;
  var rectX = CANVAS_WIDTH / 2 - rectWidth / 2;
  var rectY = CANVAS_HEIGHT - 60;
  var cornerRadius = 20;
  var isDrag = false;
  var mx, my; // mouse coordinates
  var offsetx, offsety, selection, valid;
  var pad;
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  var FPS = 60;
  var fps;
  var gravity = .5; //ball gravity
  var bounceFactor = 1.1;  // ball bounce factor
  var html = document.body.parentNode;
  var htmlTop = html.offsetTop;
  var htmlLeft = html.offsetLeft;
  var play = false;
  var bounceDifficulty = 30; // ball touches left side of pad, so it shoots left at this difficulty
  var score = 0;
  var highscore = 0;
  var level = 1;
  var randomColor = 'red';
  var padAcceleration = 0;
  var particles = [];
  var stars = [];
  var starInterval;
  var background = new Background(0,300);
  var background2 = new Background(0,0);
  var counter = 0;
  var bonus = [];

  document.body.style["positon"] = "relative";

  var canvasElement = document.createElement("canvas");
  canvasElement.width = CANVAS_WIDTH;
  canvasElement.height = CANVAS_HEIGHT;
  canvasElement.id = 'canvas';
  canvasElement.style["z-index"] = "1";
  canvasElement.style["background"] = "transparent";
  canvasElement.style["position"] = "absolute";
  var canvas = canvasElement.getContext("2d");
  document.body.appendChild(canvasElement);

  var canvasElement2 = document.createElement("canvas");
  canvasElement2.width = CANVAS_WIDTH;
  canvasElement2.height = CANVAS_HEIGHT;
  canvasElement2.id = 'canvas_bg';
  canvasElement2.style["z-index"] = "0";
  canvasElement.style["position"] = "absolute";
  var canvas_bg = canvasElement2.getContext("2d");
  document.body.appendChild(canvasElement2);

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
    x: CANVAS_WIDTH/2 + (Math.random() < 0.5 ? -1 : 1),
    y: 75,

    radius: 15,
    color: "red",
    height: 30,
    width: 30,

    // Velocity components
    vx: 0,
    vy: 1,

    reset: function(){
      this.x = CANVAS_WIDTH/2 + (Math.random() < 0.5 ? -1 : 1);
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
    canvas.width = CANVAS_WIDTH = window.outerWidth || window.innerWidth;
    canvas.height = CANVAS_HEIGHT = window.outerHeight || window.innerHeight;

    /**
     * Your drawings need to be inside this function otherwise they will be reset when
     * you resize the browser window and the canvas goes will be cleared.
     */
    if(fps) {
      clearInterval(fps);
    }

    pad = new Shape(rectX, rectY, rectWidth, rectHeight);
    canvas.fillStyle = getRndColor();

//------------------FPS------------------------
    fps = setInterval(function() {
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

        ball.vy = padAcceleration * 4;
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
          boom(canvas, stars[i].x, stars[i].y, 'gold', canvasElement.width, canvasElement.height);
          stars.splice(i, 1);
          score += 25;
          addBonus("+ 25");
        }
      }


      //if ball hits left or right wall
      if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0){
        if(ball.x < 0){
        }
        ball.vx = -ball.vx;
      }


      //ball explodes on the ground
      if(ball.y  > CANVAS_HEIGHT) {
          boom(canvas, ball.x, ball.y - ball.radius, "red", canvasElement.width, canvasElement.height)
          if(score > highscore){
            highscore = score;
            localStorage.setItem('highscore', highscore)
          }

          play = false;
          score = 0;
          bounceDifficulty = 10;
          ball.reset();
          stars = [];
          if(starInterval){
            clearInterval(starInterval)
          }
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

    var html_highscore = highscore.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var html_score = score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if(play){
      canvas.fillText(html_score, CANVAS_WIDTH - 5, 30);

      for (var i=0; i<particles.length; i++) {
        var particle = particles[i];

        particle.update(1000 / 60);
        particle.draw(canvas);
      }
      for (var i=0; i<stars.length; i++) {
        var star = stars[i];

        star.draw(canvas);
      }

      if(bonus.length){
        drawBonus()
      }
    } else {
      canvas.fillText("Highscore: " + html_highscore, CANVAS_WIDTH - 5, 30);
      canvas.fillText("Level: " + level, (CANVAS_WIDTH / 2) + 50, 400);
    }
//    canvas.font = "30px Comic Sans MS";
//    canvas.fillStyle = randomColor;
//    canvas.textAlign = 'center';
//    canvas.fillText("Hello William", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  function drawStar(){


    starInterval = setInterval(function(){
      stars.push(new star(canvas, randomFloat(30, 300), randomFloat(30, 300), 30, 5, 0.5));
      if(stars.length > 3){
        stars.shift();
      }
    }, 2000)
  }


  function Shape(x, y, w, h, fill) {
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
      e.preventDefault();
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
      e.preventDefault();
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
      e.preventDefault();
      isDrag = false;
    }, true);

  }

  function drawBonus(){
    canvas.textAlign = "end";
    canvas.font = "bold 24px Comic Sans MS";
    canvas.fillStyle = "rgba(255, 215, 0, " + 1 + ")";

    var height = 60;
    for(var i=0; i < bonus.length; i++){
      canvas.fillText( bonus[i], CANVAS_WIDTH - 5, height);
      height += 30;
    }
  }

  function addBonus(text){

    bonus.push(text);

    setTimeout(function(){
      bonus.pop();
    }, 3000)

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


  function randomFloat (min, max){
    return min + Math.random()*(max-min);
  }





  var imageRepository = new function() {
    // Define images
    this.background = new Image();
    // Set images src
    this.background.src = "img/bg2.gif";
  }

  function Background(x, y) {
    this.x = x;
    this.y = y;


    this.speed = 1; // Redefine speed of the background for panning
    // Implement abstract function
    this.draw = function() {
      // Pan background
      if(play){
        this.y += this.speed;
      }

      canvas_bg.drawImage(imageRepository.background, this.x, this.y);
      // Draw another image at the top edge of the first image
      canvas_bg.drawImage(imageRepository.background, this.x, this.y - CANVAS_WIDTH);
      // If the image scrolled off the screen, reset
      if (this.y + 50 >= CANVAS_HEIGHT)
        this.y = 0;
    };
  }
};


