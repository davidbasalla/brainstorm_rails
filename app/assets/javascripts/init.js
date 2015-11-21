window.onload = function init() {
    var app = new MainApp();

    $('#aboutButton').on(
      'click',
      function(evt)
      {
          var modal = $('#aboutModal');

          modal.modal('show');
      }
    );

    $('#clearButton').on(
  'click',
  function(evt)
  {
      app.clear();
  }
    );

    $('#saveAsButton').on(
  'click',
  function(evt)
  {
      app.save();
  }
    );  

    $('#loadButton').on(
  'click',
  function(evt)
  {
      //trigger the hidden fileLoader
      $('#filePicker', this.el).trigger('click');
      event.stopPropagation(); 
  }
    );
    
    $('#filePicker', this.el).on(
  'change',
  function(e)
  {
      var file = e.currentTarget.files[0];
      app.load(file);
  }
    );
};

