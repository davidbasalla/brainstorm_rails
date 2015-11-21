function Connection(origShape, destShape){

    /* class for keeping track of connections,
       kept independent to avoid recursive objects */

    //original shape has to be there
    this.origShape = origShape;

    //dest shape is optional
    this.destShape = destShape || null;

    //custom coords in case of no destShape
    this.targetX = 0;
    this.targetY = 0;
    this.resetTarget();
}



Connection.prototype.draw = function(ctx){
    
    /* draw a line either between two shapes or between the original shape
       and a target position */
    
    origX = this.origShape.centerPos()[0];
    origY = this.origShape.centerPos()[1];
    
    if (this.destShape){
  destX = this.destShape.centerPos()[0];
  destY = this.destShape.centerPos()[1];
    }
    else {
  destX = this.targetX;
  destY = this.targetY;
    } 

    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(destX, destY);
    ctx.stroke();
    ctx.closePath();
    
};

Connection.prototype.contains = function(mx, my){

    /* should probably clean this up a little bit */

    //figure out the points

    var eps = 4;

    var x1 = Math.min(this.origShape.centerPos()[0], this.destShape.centerPos()[0]);
    var y1 = Math.min(this.origShape.centerPos()[1], this.destShape.centerPos()[1]);

    var x2 = Math.max(this.origShape.centerPos()[0], this.destShape.centerPos()[0]);
    var y2 = Math.max(this.origShape.centerPos()[1], this.destShape.centerPos()[1]);

    //first, check if mouse is in the rectangle described by the 2 points...
    if ((x1 <= mx + eps) && (x2 >= mx - eps) && (y1 <= my + eps) && (y2 >= my - eps)){
  //define the definition of the line

  //need to find a way to deal with big numbers!!!

  var x1 = this.origShape.centerPos()[0];
  var y1 = this.origShape.centerPos()[1];

  var x2 = this.destShape.centerPos()[0];
  var y2 = this.destShape.centerPos()[1];

  var xDiff = x2 - x1;
  var yDiff = y2 - y1;



  var m = yDiff/xDiff;

  //equation of a line
  var d = y1 - m * x1;

  //figure out the compensator

  var val = m * mx + d - my;

  //invert values below 1
  if (m < 1 && m >= 0)
      m = Math.pow(m, -1);
  if (m > -1 && m < 0)
      m = Math.pow(m, -1);

  eps = Math.abs(eps * m);

  if (val < eps && 
      val > -(eps))
      return true;
  return false;
    }
};


Connection.prototype.highlight = function(ctx, mode){
    
    origX = this.origShape.centerPos()[0];
    origY = this.origShape.centerPos()[1];
    destX = this.destShape.centerPos()[0];
    destY = this.destShape.centerPos()[1];

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(destX, destY);
    ctx.stroke();
    ctx.closePath();

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'lightgrey';
};


Connection.prototype.setTarget = function(x, y) {
    
    this.targetX = x;
    this.targetY = y;
};


Connection.prototype.resetTarget = function() {
    
    this.targetX = this.origShape.connector.x;
    this.targetY = this.origShape.connector.y;
};


Connection.prototype.removeClosestShape = function(mx, my) {

    var x1 = this.origShape.centerPos()[0];
    var y1 = this.origShape.centerPos()[1];
    var x2 = this.destShape.centerPos()[0];
    var y2 = this.destShape.centerPos()[1];

    //a^2 + b^2 = c^2

    var a1 = Math.pow(mx - x1, 2);
    var b1 = Math.pow(my - y1, 2);
    var c1 = a1 + b1;

    var a2 = Math.pow(mx - x2, 2);
    var b2 = Math.pow(my - y2, 2);
    var c2 = a2 + b2;


    if (c2 > c1){
  //remove origShape
  this.origShape = this.destShape;
  this.destShape = null;
    }
    else{
  this.destShape = null;
    }
    
    //reset the target points...
    this.targetX = mx;
    this.targetY = my;
    
};
