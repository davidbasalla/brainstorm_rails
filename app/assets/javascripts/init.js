window.onload = function init() {
    var app = new MainApp();

    $('#clearButton').on(
      'click',
      function(evt){
        app.clear();
      }
    );

    $('#saveAsButton').on(
      'click',
      function(evt){
        app.save();
      }
    );  
};
