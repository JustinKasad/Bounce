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

function boom(ctx, actualX,actualY, color, width, height) {

  // Shim with setTimeout fallback


  var laX = actualX;
  var laY = actualY;
  var W = width;
  var H = height;
  // Let's set our gravity
  var gravity = 1;

  // Time to write a neat constructor for our
  // particles.
  // Lets initialize a random color to use for
  // our particles and also define the particle
  // count.
  var particle_count = 20;
  var particles = [];

  var random_color = color;

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