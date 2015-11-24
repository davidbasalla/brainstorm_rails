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
function Shape(x, y, shape, text, ctx) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 

  this.x = x || 0;
  this.y = y || 0;
  this.shape = shape || "square";
  this.text = text || 'sampleText';
  this.ctx = ctx;

  console.log("SHAPE INIT");
  console.log(ctx);

  this.shapeId = 0;

  this.fill = '#EEEEEE';
  this.lineWidth = 1;

  this.lineHeight = 20;

  this.w = 100;
  this.h = 50;

  this.connector = new Connector(this.x + this.w/2.0 - 10/2.0, 
                       this.y + this.h, 
                       10);

  this.deleteBox = new DeleteBox(this.x + this.w - 14, y, this.ctx);
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

Shape.prototype.centerPos = function(){
  var centerPos = [0, 0];

  centerPos[0] = this.x + this.w/2.0;
  centerPos[1] = this.y + this.h/2.0;

  return centerPos;
};

Shape.prototype.draw = function(ctx, highlight, hover) {
  //move this to initialise method
  this.ctx = ctx;

  this.ctx.save();
  
  this.drawShape();

  if(hover) this.highlight('hover');

  this.ctx.closePath();
  this.ctx.restore();

  this.drawConnector();

  this.deleteBox.draw(this.ctx);

  this.drawText();
};

Shape.prototype.drawShape = function(){
  var minX = this.x;
  var minY = this.y;
  var maxX = this.x + this.w;
  var maxY = this.y + this.h;
  var radius = 4;

  this.ctx.beginPath();
  this.ctx.moveTo(minX + radius, minY);
  this.ctx.lineTo(maxX - radius, minY);
  this.ctx.quadraticCurveTo(maxX, minY, maxX, minY + radius);
  this.ctx.lineTo(maxX, maxY - radius);
  this.ctx.quadraticCurveTo(maxX, maxY, maxX - radius, maxY);
  this.ctx.lineTo(minX + radius, maxY);
  this.ctx.quadraticCurveTo(minX, maxY, minX, maxY - radius);
  this.ctx.lineTo(minX, minY + radius);
  this.ctx.quadraticCurveTo(minX, minY, minX + radius, minY);

  this.ctx.fillStyle = this.fill;

  this.ctx.shadowColor = "#999";
  this.ctx.shadowBlur = 5;
  this.ctx.shadowOffsetX = 2;
  this.ctx.shadowOffsetY = 2;

  this.ctx.fill();
};

Shape.prototype.highlight = function(mode) {
  //reset shadow
  this.ctx.shadowBlur = 0;
  this.ctx.shadowOffsetX = 0;
  this.ctx.shadowOffsetY = 0;

  if (mode === "hover")
    this.ctx.strokeStyle = '#FF0000';
  else
    this.ctx.strokeStyle = '#00FF00';
  this.ctx.stroke();
};

Shape.prototype.drawConnector = function() {
  this.ctx.fillStyle = 'black';
  this.ctx.fillRect(this.connector.x, 
               this.connector.y, 
               this.connector.w, 
               this.connector.w);
};

Shape.prototype.drawText = function() {
  var offsetX = 15;
  var offsetY = 30;
  this.wrapText(this.text, this.x + offsetX, this.y + offsetY, 100, 20);
};

Shape.prototype.setText = function(text, ctx) {
    this.text = text;

    /* sets the size dependent on text content - 
       issue, need to get the CTX in order to determine
       the proper dimensions for it */

    ctx.font="14px Avenir";

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
};


Shape.prototype.contains = function(mx, my) {
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

  if (x1 < rect_x2 && x2 > rect_x1 && y1 < rect_y2 && y2 > rect_y1) 
    return true;

  return false;
};

Shape.prototype.wrapText = function(text, x, y, maxWidth, lineHeight) {
  /* need to rework this... 
     new line needs to happen when enter is pressed in the textarea
     allow long run ons
     only add new line when new line is pressed in box
     also need to get the longest element so as to resize the whole box
     */
     
  this.ctx.font="14px Avenir";

  var lines = text.split('\n');
  var height = y;

  var maxWidth = 0;

  for (var i in lines){
    this.ctx.fillText(lines[i], x, height);
    height += this.lineHeight;
  }
  //this.setWidth(maxWidth);
  //reset width AND height (!!) here after max line length
};
