function MainApp() {
    
    console.log("INIT");
    this.s = new CanvasState(document.getElementById('canvas1'));
    this.s.ctx.lineWidth = 4;
    
    //load stored data or default
    if (!this.loadStorage())
  this.loadDefault();
}

MainApp.prototype.clear = function(){

    //delete connections
    this.s.shapes =[];

    //delete shapes
    this.s.connections =[];


    //reset tmp storage
    this.selection = [];
    this.hoverSelection = [];
    this.connectionSelection = null;
    this.dragSelect = false;   

    //force redraw
    this.s.valid = false;

    //update storage
    this.s.setStorageData('shapes');
    this.s.setStorageData('connections');
};

MainApp.prototype.loadStorage = function(){

    var val = false;

    var shapes = JSON.parse(localStorage.shapes);
    var connections = JSON.parse(localStorage.connections);

    if(shapes){
  this.loadShapes(shapes);
  val = true;
    }
    if(connections){
  this.loadConnections(connections);
  val = true;
    }
    
    this.s.valid = false;

    return val;
};

MainApp.prototype.loadDefault = function(){

    var shape1 = new Shape(100, 150);
    var shape2 = new Shape(300, 150, "square", "sampleText");
    var shape3 = new Shape(200, 50);
    shape3.fill = 'lightgreen';

    var connec = new Connection(shape3, shape2);
    var connec2 = new Connection(shape3, shape1);

    this.s.addShape(shape1);
    this.s.addShape(shape2);
    this.s.connections.push(connec);
    this.s.connections.push(connec2);
    this.s.addShape(shape3);
};

MainApp.prototype.loadShapes = function(shapes){

    for(var i = 0; i < shapes.length; i++){
  
  var elem = shapes[i];

  var shape = new Shape(elem.x, elem.y, "square","");
  shape.setText(elem.text, this.s.ctx)
  shape.shapeId = elem.shapeId;
  shape.fill = elem.fill;
  
  //update the current shape id
  this.s.currentShapeId = Math.max(this.s.currentShapeId,
           shape.shapeId);
  
  this.s.shapes.push(shape);
    }
};

MainApp.prototype.loadConnections = function(connections){

    for(var i = 0; i < connections.length; i++){
  
  var connection = connections[i];
  
  //dont create again, just loop through already existing ones...
  
  var origShape = null;
  for (index in this.s.shapes){
      
      if (this.s.shapes[index].shapeId === connection.origShape.shapeId){
    origShape = this.s.shapes[index];
    this.s.updateConnection(connection);
    break;
      }
  }
  
  var destShape = null;
  for (index in this.s.shapes){
      if (this.s.shapes[index].shapeId === connection.destShape.shapeId){
    destShape = this.s.shapes[index];
    this.s.updateConnection(connection);
    break;
      }
  }
  
  
  if (destShape && origShape){
      var connec = new Connection(origShape, destShape);
      this.s.addConnection(connec);
      
  }
    }
};




MainApp.prototype.save = function(){

    //SAVE THE DATA AS JSON FORMAT HERE...
    
    var combinedText = {
  shapes: this.s.shapes,
  connections: this.s.connections
    };
    
    var jsonText = JSON.stringify(combinedText);
    
    var data = new Blob([jsonText], {type: 'text/plain'});
    var textFile = null;
    
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
  window.URL.revokeObjectURL(textFile);
    }
    
    textFile = window.URL.createObjectURL(data);
    
    var link = document.getElementById('downloadlink');
    link.href = textFile;
    
    link.click();
};


MainApp.prototype.load = function(file){

    var extension = file.name.split('.').pop();     
    
    //reset all
    this.s.shapes = [];
    this.s.connections = [];
    this.s.selection = [];
    this.s.hoverSelection = [];
    this.s.valid = false;
    

    var _this = this;
    //check for correct extension
    if(extension == 'json'){
  // FILE READING
  var reader = new FileReader();
  
  reader.onload = function(event){
      
      //parse JSON
      var jsonContents = JSON.parse(reader.result);
      
      var shapes = jsonContents.shapes;
      _this.loadShapes(shapes);

      var connections = jsonContents.connections;
      _this.loadConnections(connections);
      
      _this.s.valid = false;
  };
  
  reader.readAsText(file);    
    }
};
