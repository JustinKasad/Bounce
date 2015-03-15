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
  var gravity = 0.7;
  var bounceFactor = 1;
  var html = document.body.parentNode;
  var htmlTop = html.offsetTop;
  var htmlLeft = html.offsetLeft;
  var play = false;
  var bounceDifficulty = 10;
  var bounceCount = 0;
  var randomColor = 'red';


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


      // Ohh! The ball is moving!
      // Lets add some acceleration
      ball.vy += gravity;
      //Perfect! Now, lets make it rebound when it touches the floor
      if(collides(pad, ball)) {
        // First, reposition the ball on top of the pad and then bounce it!

        randomColor = getRndColor();

        ball.vx = bounceDifficulty * ((ball.x-(pad.x+pad.width/2))/pad.width);
        bounceDifficulty = bounceDifficulty + 5;
        if(bounceDifficulty > 150){
          bounceDifficulty = 100;
        }
        console.log('ball.vx: ' + ball.vx + ' bounceDifficulty:' + bounceDifficulty);

        ball.vy = Math.floor(Math.random() * (25 - 15 + 1)) + 15;;

//        if(bounceDifficulty > 20){
//          ball.vy = Math.random() * 30
//        }
//        if(bounceDifficulty > 500){
//          ball.vy = Math.random() * 40
//        }
//        if(bounceDifficulty > 100){
//          ball.vy = Math.random() * 50
//        }

        ball.vy *= -bounceFactor;

        bounceCount++;

      }

      if (ball.x + ball.width > CANVAS_WIDTH || ball.x < 0){
        ball.vx = -ball.vx;
      }

      if(ball.y + ball.radius > CANVAS_HEIGHT) {
          ball.reset();
          bounceCount = 0;
          bounceDifficulty = 10;
          play = false;;

      }

    }

  }


  function draw() {
    pad.draw();
    ball.draw();

    canvas.font = "20px Comic Sans MS";
    canvas.fillStyle = "red";
    canvas.fillText(bounceCount, CANVAS_WIDTH - 20, 20);

    canvas.font = "30px Comic Sans MS";
    canvas.fillStyle = randomColor;
    canvas.textAlign = 'center';
    canvas.fillText("Hello William", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
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





  function setEvents(){

    //fixes a problem where double clicking causes text to get selected on the canvas
    $_canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging
    $_canvas.addEventListener('touchstart', function(e) {
      play = true;
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

        var log = makeVelocityCalculator(e, function(v) {
          console.log(v+" pixel/ms");
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
        selection.y = (mouse.y - offsety) > 450 ? (mouse.y - offsety + pad.height > CANVAS_HEIGHT ? CANVAS_HEIGHT - pad.height : mouse.y - offsety) : 450;
        valid = false; // Something's dragging so we must redraw



      }
    }, true);
    $_canvas.addEventListener('touchend', function(e) {
      isDrag = false;
    }, true);

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
      debugger;
      callback(velocity);
    };
  }

  function handleCollisions() {

    if (collides(pad, ball)) {

    }


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
  };
