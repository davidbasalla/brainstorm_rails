function CanvasState(canvas) {
  // **** First some setup! ****

  this.canvas = canvas;
  this.canvas.width = document.body.clientWidth; //document.width is obsolete
  this.canvas.height = document.body.clientHeight * 2; //document.height is obsolete

  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');
  //this.ctx.scale(2,2);
  //this.ctxScale = 2;

  this.currentShapeId = 1;

  this.modal = new Modal();

  // This complicates things a little but but fixes mouse co-ordinate problems
  // when there's a border or padding. See getMouse for more detail
  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
  }
  // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;
  
  // **** Keep track of state! ****
  
  this.valid = false; // when set to false, the canvas will redraw everything
  this.shapes = [];  // the collection of things to be drawn
  this.connections = [];  // the collection of things to be drawn
  this.dragging = false; // Keep track of when we are dragging
  // the current selected object. In the future we could turn this into an array for multiple selection
  this.selection = [];
  this.hoverSelection = [];
  this.connectionSelection = null;
  this.dragSelect = false;

  this.dragoffx = 0; // See mousedown and mousemove events for explanation
  this.dragoffy = 0;
  this.mx = 0;
  this.my = 0;

  // **** Then events! ****
  
  // This is an example of a closure!
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  // This is our reference!
  var myState = this;
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { 
    e.preventDefault(); return false; 
  }, false);
  // Up, down, and move are for dragging

  canvas.addEventListener('mousedown', function(e) {
    // 1.) if no selection, start a drag selection
    // 2.) if hover selection, start a select/delete/move
    // 3.) if connector, start a connection drag

    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

    myState.mx = mouse.x;
    myState.my = mouse.y;

    // CHECK FOR CONNECTIONS ///////
    if (myState.hoverSelection.length){
      if (myState.hoverSelection[0] instanceof Connection){
        var mySel = myState.hoverSelection[0];

        mySel.removeClosestShape(mx, my);

        myState.connectionDragging = true;
        myState.connectionSelection = mySel;

        myState.hoverSelection = [];

        //remove current connection from connections
        var index = myState.connections.indexOf(mySel);
        if(index > -1)
            myState.connections.splice(index, 1);

        myState.valid = false;    

        return;
      }
    }

    // CHECK FOR CONNECTORS ///////
    var shapes = myState.shapes;
    var l = shapes.length;
    for (var i = l-1; i >= 0; i--) {
        if (shapes[i].connector.contains(mx, my)){
          var _mySel = new Connection(shapes[i]);
          myState.connectionDragging = true;
          myState.connectionSelection = _mySel;
          myState.valid = false;
          return;
      }
    }

    // 0.) if selection and no hover, clear the selection
    if (!myState.hoverSelection.length && myState.selection.length){
        myState.selection = [];
    }

    // 1.) if no hoverSelection, start a drag select
    if (!myState.hoverSelection.length){
        myState.dragSelect = true;
        myState.dragSelectCoords = [mx, my, mx, my];
        return;
    }

    // 2.) if hoverSelection, check for delete
    if (myState.hoverSelection.length){
      var mySel = myState.hoverSelection[0];

      if (mySel.deleteBox.contains(mx, my)){
        myState.deleteShape(mySel);
        myState.hoverSelection = [];
        myState.selection = [];
        myState.valid = false;
        return;
      }

      if (myState.selection.indexOf(mySel) == -1){
        myState.selection = [];
        if(!myState.selection.length)
            myState.selection.push(mySel);
      }
    }

    if (myState.hoverSelection.length && myState.selection.length){
        myState.dragging = true;
        myState.valid = false;
        return;
    }
  }, true);

  canvas.addEventListener('mousemove', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;

    if(!myState.mx)
        myState.mx  = mouse.x;
    if(!myState.my)
        myState.my  = mouse.y;

    var x_diff = mouse.x - myState.mx;
    var y_diff = mouse.y - myState.my;

    myState.mx = mouse.x;
    myState.my = mouse.y;


    //if drag in process...
    if (myState.dragging){
      for (var i in myState.selection){
        myState.selection[i].move(x_diff, y_diff);
      }
        
      myState.valid = false; // Something's dragging so we must redraw
      return;
    }

    //if dragSelect in process...
    if (myState.dragSelect){
      //set the coords
      myState.dragSelectCoords[2] = mx;
      myState.dragSelectCoords[3] = my;
      myState.valid = false;

      // put detection code in here...
      var shapes = myState.shapes;
      var selectedShapes = [];

      var l = shapes.length;
      for (var i = l-1; i >= 0; i--) {
        if (shapes[i].containedInRect(myState.dragSelectCoords)){
          if (!selectedShapes.indexOf(shapes[i]) > -1)
            selectedShapes.push(shapes[i]);
        }
      }

      myState.hoverSelection = selectedShapes;
      return;
    }

    if (!myState.hoverSelection.length){
      var shapes = myState.shapes;
      var l = shapes.length;
      for (var i = l-1; i >= 0; i--) {
        //check object
        if (shapes[i].contains(mx, my)) {
          // Keep track of where in the object we clicked
          // so we can move it smoothly (see mousemove)

          var mySel = shapes[i];        
          myState.hoverSelection[0] = mySel;
          myState.valid = false;
          
          return;
        }
      
        //check connector and block other selection
        var connector = shapes[i].connector;
        if (shapes[i].connector.contains(mx, my))
            return;
      }

      //check for connections...
      if(!myState.connectionDragging){
        var cons = myState.connections;
        for (var i = cons.length-1; i >= 0; i--) {
          var val = cons[i].contains(mx, my);
          if (val) {
            // Keep track of where in the object we clicked
            // so we can move it smoothly (see mousemove)
            
            var mySel = cons[i];        
            myState.hoverSelection[0] = mySel;
            myState.valid = false;
            
            return;
          }
        }
      }
    }

    //check that current object still in mouse range
    else if (myState.hoverSelection.length){
      if (!myState.hoverSelection[0].contains(mx, my)){
        myState.hoverSelection = [];
        myState.valid = false;
      }
    }

    if (myState.connectionDragging){
      var mouse = myState.getMouse(e);

      myState.connectionSelection.setTarget(mouse.x, mouse.y);

      //need to check here if another shape is detected underneath

      myState.valid = false; // Something's dragging so we must redraw
    }

    else if (myState.dragging){
      for (i in myState.selection){
        myState.selection[i].move(x_diff, y_diff);
      }
      
      //myState.selection.x = mouse.x - myState.dragoffx;
      //myState.selection.y = mouse.y - myState.dragoffy;   
      myState.valid = false; // Something's dragging so we must redraw
    }
  }, true);

  canvas.addEventListener('mouseup', function(e) {
    //if there is a shape underneath... create a connection!!
    //equally check if an ACTIVE shape is underneath!!
    //concept of active... when mouse is hovering over it!!

    myState.dragging = false;
    myState.dragSelect = false;
    myState.connectionDragging = false;

    if (myState.hoverSelection.length){
      myState.selection = myState.hoverSelection;
    }

    //reset the connector
    if (myState.connectionSelection){
      if (myState.hoverSelection.length){
        myState.connectionSelection.destShape = myState.hoverSelection[0];
        myState.addConnection(myState.connectionSelection);
      }
      myState.connectionSelection.resetTarget();
    }

    myState.connectionSelection = null;

    myState.valid = false; // Something's dragging so we must redraw

    //save current state
    myState.setStorageData('shapes');
    myState.setStorageData('connections');
  }, true);

  // double click for making new shapes
  var _ctx = this.ctx;
  canvas.addEventListener('dblclick', function(e) {
    var mouse = myState.getMouse(e);

    if (myState.selection.length){
      if(myState.selection[0] instanceof Shape){
        myState.modal.setPosition(mouse.x, mouse.y);
        myState.modal.setNode(myState.selection[0]);
        myState.modal.setCallback(myState, myState.selection[0], _ctx);
        myState.modal.show();
      }
    }
    else
      myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, null, null, this.ctx));
  }, true);
    
  // **** Options! ****
  this.selectionColor = '#CC0000';
  this.hoverColor = '#FF5555';
  this.hoverSelectedColor = '#EE4444';
  this.selectionWidth = 2;  
  this.interval = 15;
  setInterval(function() { myState.draw(); }, myState.interval);
}




CanvasState.prototype.addShape = function(shape) {
    //conditional shapeId
    if(!shape.shapeId)
      shape.shapeId = this.currentShapeId += 1;

    this.shapes.push(shape);
    this.valid = false;

    this.setStorageData('shapes');
};


CanvasState.prototype.addConnection = function(connec) {

    this.connections.push(connec);
    this.setStorageData('connections');
};


CanvasState.prototype.updateConnection = function(connec) {
    this.setStorageData('connections');
};


CanvasState.prototype.setStorageData = function(attr) {

    var jsonText = null;
    if (attr == 'shapes')
  jsonText = JSON.stringify(this.shapes);
    else if (attr == 'connections')
  jsonText = JSON.stringify(this.connections);

    localStorage.setItem(attr, jsonText);
};




CanvasState.prototype.deleteShape = function(shape) {

    //FIRST REMOVE CONNECTIONS
    for(var i = this.connections.length - 1; i >= 0; i--) {
      if(this.connections[i].origShape === shape ||
         this.connections[i].destShape === shape){
          this.connections.splice(i, 1);
          this.valid = false;
      }
    }

    //SECONDLY REMOVE SHAPE
    for(var i = this.shapes.length - 1; i >= 0; i--) {
      if(this.shapes[i] === shape) {
          this.shapes.splice(i, 1);
          this.valid = false;
          this.setStorageData('shapes');
          return;
      }
    }
};


CanvasState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};


// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
  var ctx = this.ctx;
  var shapes = this.shapes;
  var connections = this.connections;
  this.clear();
  
  // ** Add stuff you want drawn in the background all the time here **
  
  // draw all Connections

  ctx.strokeStyle = 'lightgrey';
  var l = connections.length;
  for (var i = 0; i < l; i++) {
      var con = connections[i];
      // We can skip the drawing of elements that have moved off the screen:
      //if (con.x > this.width || shape.y > this.height ||
      //shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      connections[i].draw(ctx);
      
      if (this.hoverSelection.indexOf(connections[i]) > -1){
    connections[i].highlight(ctx);
      }
  }
  
  
  //draw connector lines
  if (this.connectionSelection != null) {
      ctx.strokeStyle = 'red';
      var mySel = this.connectionSelection;
      mySel.draw(ctx);

  }

  // draw all shapes
  for (i = 0; i < shapes.length; i++) {
    var shape = shapes[i];
    // We can skip the drawing of elements that have moved off the screen:
    if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0){
      continue;
    }

    var highlight = false;
    var hover = false;

    if (this.selection.indexOf(shapes[i]) > -1){
      highight = true;
    }

    if (this.hoverSelection.indexOf(shapes[i]) > -1){
      hover = true;
    }
    shapes[i].draw(ctx, highlight, hover);
  }
  
  
  //draw selection box
  if (this.dragSelect){

      var dragX = this.dragSelectCoords[0];
      var dragY = this.dragSelectCoords[1];
      var mx = this.dragSelectCoords[2];
      var my = this.dragSelectCoords[3];
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'lightgrey';
      ctx.beginPath();
      ctx.moveTo(dragX, dragY);
      ctx.lineTo(dragX, my);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx, dragY);
      ctx.lineTo(dragX, dragY);
      ctx.closePath();
      ctx.stroke();
  }
    }
    
    // ** Add stuff you want drawn on top all the time here **
    this.valid = true;
};



// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
};

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();

