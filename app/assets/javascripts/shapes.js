// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, shape, text) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 


    this.shapeId = 0;

    this.x = x || 0;
    this.y = y || 0;


    this.shape = shape || "square";
    this.fill = '#EEEEEE';
    this.lineWidth = 1;

    this.lineHeight = 20;


    if(this.shape === 'square'){
  this.w = 100;
  this.h = 50;
    }

    this.connector = new Connector(this.x + this.w/2.0 - 10/2.0, 
           this.y + this.h, 
           10);

    this.deleteBox = new DeleteBox(this.x + this.w - 14, y);

    this.text = text || 'sampleText';
    //this.setText(text);

}

Shape.prototype.setWidth = function(value){
    this.w = value;
    this.connector.x = this.x + this.w/2.0 - 5;
    this.deleteBox.x = this.x + this.w - 14;
};


Shape.prototype.setHeight = function(value){
    this.h = value;
    this.connector.y = this.y + this.h;
};

Shape.prototype.move = function(x, y){

    //rejig to move everything as an offset
    //vector based...?

    this.x += x;
    this.y += y;

    
    /*
    var oldX = this.x;
    var oldY = this.y;
    this.x = x;
    this.y = y;
    offsetX = this.x - oldX;
    offsetY = this.y - oldY;
    */


    var connectorOldX = this.connector.x;
    var connectorOldY = this.connector.y;
    var connectorOldTargetX = this.connector.targetX;
    var connectorOldTargetY = this.connector.targetY;

    this.connector.x += x;
    this.connector.y += y;
    this.connector.targetX += x; 
    this.connector.targetY += y;

    this.deleteBox.x += x;
    this.deleteBox.y += y;
};


Shape.prototype.highlight = function(ctx, mode) {

    if (this.shape === "square"){

  var minX = this.x;
  var minY = this.y;
  var maxX = this.x + this.w;
  var maxY = this.y + this.h;
  var offset = 10;

  if (mode === "hover")
      ctx.strokeStyle = '#FF0000';
  else
      ctx.strokeStyle = '#00FF00';

  ctx.beginPath();
  ctx.moveTo(minX + offset, minY);
  ctx.lineTo(maxX - offset, minY);
  ctx.quadraticCurveTo(maxX, minY, maxX, minY + offset);
  ctx.lineTo(maxX, maxY - offset);
  ctx.quadraticCurveTo(maxX, maxY, maxX - offset, maxY);
  ctx.lineTo(minX + offset, maxY);
  ctx.quadraticCurveTo(minX, maxY, minX, maxY - offset);
  ctx.lineTo(minX, minY + offset);
  ctx.quadraticCurveTo(minX, minY, minX + offset, minY);

  ctx.stroke();
  ctx.closePath();
    }
};


Shape.prototype.centerPos = function(){

    var centerPos = [0, 0];

    centerPos[0] = this.x + this.w/2.0;
    centerPos[1] = this.y + this.h/2.0;

    return centerPos;

};


// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {

    if (this.shape === "square"){
  
  ctx.save();
  
  //ctx.rect(this.x, this.y, this.w, this.h);
  
  var minX = this.x;
  var minY = this.y;
  var maxX = this.x + this.w;
  var maxY = this.y + this.h;
  var offset = 10;

  ctx.beginPath();
  ctx.moveTo(minX + offset, minY);
  ctx.lineTo(maxX - offset, minY);
  ctx.quadraticCurveTo(maxX, minY, maxX, minY + offset);
  ctx.lineTo(maxX, maxY - offset);
  ctx.quadraticCurveTo(maxX, maxY, maxX - offset, maxY);
  ctx.lineTo(minX + offset, maxY);
  ctx.quadraticCurveTo(minX, maxY, minX, maxY - offset);
  ctx.lineTo(minX, minY + offset);
  ctx.quadraticCurveTo(minX, minY, minX + offset, minY);

  ctx.fillStyle = this.fill;

  ctx.shadowColor = "#999";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  ctx.fill();
  ctx.closePath();

  ctx.restore();
  

  //DRAW THE CONNECTOR

  ctx.fillStyle = 'black';

  ctx.fillRect(this.connector.x, 
         this.connector.y, 
         this.connector.w, 
         this.connector.w);

  this.deleteBox.draw(ctx);
    }
    

    // DRAW THE TEXT

    var text = this.text;

    var offsetX = 0;
    var offsetY = 0;

    if (this.shape === "square"){
  offsetX = 15;
  offsetY = 30;
    }
    else if (this.shape === "circle"){
  offsetX = -10;
    }

    //ctx.font="14px Avenir";
    //ctx.fillText(text, this.x + offsetX, this.y + offsetY);
    //var metrics = ctx.measureText(text);
    //var width = metrics.width;
    this.wrapText(ctx, text, this.x + offsetX, this.y + offsetY, 100, 20);
};

Shape.prototype.setText = function(text, ctx) {

    this.text = text;

    /* sets the size dependent on text content - 
       issue, need to get the CTX in order to determine
       the proper dimensions for it */

    ctx.font="14px Avenir";
    //ctx.fillText(text, this.x, this.y);

    var lines = text.split('\n');
    var lineHeight = 20;
    var maxHeight = 0;

    var maxWidth = 0;

    for (var i in lines){
      var line = lines[i];
      var metrics = ctx.measureText(line);
      var width = metrics.width;

      if (width > maxWidth)
          maxWidth = width;
      maxHeight += lineHeight;
    }
    
    this.setWidth(maxWidth + 30);
    this.setHeight(maxHeight + 30);
    //this.wrapText(ctx, text, this.x + offsetX, this.y + offsetY, 100, 20);

    //var metrics = ctx.measureText(text);
    //var width = metrics.width;

    //this.setWidth(width + 30);
};



// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {

    //need to extend for circle code

    if (this.shape === "square"){
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    }
};

Shape.prototype.containedInRect = function(points) {

    var x1 = Math.min(this.x, this.x + this.w);
    var y1 = Math.min(this.y, this.y + this.h);
    var x2 = Math.max(this.x, this.x + this.w);
    var y2 = Math.max(this.y, this.y + this.h);

    var rect_x1 = Math.min(points[0], points[2]);
    var rect_y1 = Math.min(points[1], points[3]);
    var rect_x2 = Math.max(points[0], points[2]);
    var rect_y2 = Math.max(points[1], points[3]);

    if (x1 < rect_x2 && x2 > rect_x1 &&
  y1 < rect_y2 && y2 > rect_y1) 
  return true;

    return false;
};



Shape.prototype.wrapText = function(context, text, x, y, maxWidth, lineHeight) {

    /* need to rework this... 
       new line needs to happen when enter is pressed in the textarea
       allow long run ons
       only add new line when new line is pressed in box
       also need to get the longest element so as to resize the whole box
       */
       
    context.font="14px Avenir";

    var lines = text.split('\n');
    var height = y;

    var maxWidth = 0;

    for (var i in lines){
  context.fillText(lines[i], x, height);
  height += this.lineHeight;
    }
    //this.setWidth(maxWidth);
    //reset width AND height (!!) here after max line length
};
