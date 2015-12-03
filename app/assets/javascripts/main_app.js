function MainApp() {
  this.s = new CanvasState(document.getElementById('canvas1'));
  this.s.ctx.lineWidth = 4;

  this.current_sketch_id = $('#canvas1').data('sketch-id');

  this.loadSketch();
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

  this.forceRedraw();

  //update storage
  this.s.setStorageData('shapes');
  this.s.setStorageData('connections');
};

MainApp.prototype.forceRedraw = function(){
  this.s.valid = false;
};


MainApp.prototype.loadSketch = function(){
  this.clear();

  var callback = function(response) {
    this.loadShapes(response.node_data.shapes);
    this.loadConnections(response.node_data.connections);
    this.forceRedraw();
  }.bind(this);
  $.get('/sketches/' + this.current_sketch_id, undefined, callback, 'json');
};

MainApp.prototype.loadDefault = function(){

    var shape1 = new Shape(100, 150, null, null, this.s.ctx);
    var shape2 = new Shape(300, 150, "square", "sampleText", this.s.ctx);
    var shape3 = new Shape(200, 50, null, null, this.s.ctx);
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
  shape.setText(elem.text, this.s.ctx);
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
  for (var index in this.s.shapes){
      
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
  var combinedText = {
    shapes: this.s.shapes,
    connections: this.s.connections
  };
    
  var jsonData = JSON.stringify(combinedText);

  $.ajax({
      method: 'PUT',
      url: "/sketches/" + this.current_sketch_id,
      dataType: 'JSON',
      data: {sketch: {node_data: jsonData}}
      });
};
