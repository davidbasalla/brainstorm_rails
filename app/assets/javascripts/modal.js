function Modal(){
    /* access to the bootstrap model */

    this.jqModal = $('#myModal');
    this.jqTextField = this.jqModal.find('#nodeText');
    this.jqOkButton = this.jqModal.find('#modalok');
    
    //colorButtons
    this.colors = ['#EEEEEE', 'white', 'grey', 'lightgreen', '#FF6666'];
    this.colorButtons = [
      this.jqModal.find('#colorBox1'),
      this.jqModal.find('#colorBox2'),
      this.jqModal.find('#colorBox3'),
      this.jqModal.find('#colorBox4'),
      this.jqModal.find('#colorBox5')
    ];
    //set default col to GREY
    this.currentColor = this.colors[0];
    
    this.setButtonClickEvents();
}


Modal.prototype.show = function(){
    this.jqModal.modal('show');
};


Modal.prototype.setButtonClickEvents = function(){
    
    var _this = this;
    this.colorButtons[0].on(
  'click',
  function(evt){
      _this.currentColor = _this.colors[0];
      _this.setColorBtnActive(_this.colorButtons[0]);
  }
    );
    this.colorButtons[1].on(
  'click',
  function(evt){
      _this.currentColor = _this.colors[1];
      _this.setColorBtnActive(_this.colorButtons[1]);
  }
    );
    this.colorButtons[2].on(
  'click',
  function(evt){
      _this.currentColor = _this.colors[2];
      _this.setColorBtnActive(_this.colorButtons[2]);
  }
    );
    this.colorButtons[3].on(
  'click',
  function(evt){
      _this.currentColor = _this.colors[3];
      _this.setColorBtnActive(_this.colorButtons[3]);
  }
    );
    this.colorButtons[4].on(
  'click',
  function(evt){
      _this.currentColor = _this.colors[4];
      _this.setColorBtnActive(_this.colorButtons[4]);
  }
    );
};

Modal.prototype.setNode = function(node){
    /* sets up the contents of a modal according to a node */
    
    this.setText(node.text);
    this.setColor(node.fill);
};

Modal.prototype.setText = function(text){
    this.jqTextField.val(text);
};


Modal.prototype.setColor = function(fill){
  for (var i in this.colors){
    if (this.colors[i] === fill){
      this.currentColor = this.colors[i];
      this.setColorBtnActive(this.colorButtons[i]);
    }
  }
};

Modal.prototype.setColorBtnActive = function(button){
  for (var i in this.colorButtons){
    this.colorButtons[i].removeClass('color-box-selected');
    button.addClass('color-box-selected');
  }
};


Modal.prototype.setCallback = function(state, node, ctx){
    
    var _this = this;
    this.jqOkButton.on(
  'click',
  function(evt)
  {
      node.setText(_this.jqTextField.val(), ctx);
      node.fill = _this.currentColor;
      _this.jqModal.modal('hide');

      state.valid = false; // Something's dragging so we must redraw

      _this.resetCallback();
  }
    );
};


Modal.prototype.resetCallback = function(){
    this.jqOkButton.off();
};


Modal.prototype.setPosition = function(x, y){

    var width = document.body.clientWidth;

    var val = width/2 - x;

    //this.jqModal.css( "margin-left", -val); 
    //this.jqModal.css( "margin-right", val); 


    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    this.jqModal.css( "top", top); 
    this.jqModal.css( "margin-bottom", -top); 
};
