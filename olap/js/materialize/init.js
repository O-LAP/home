(function($){
  $(function(){


  	var sliderOpts =  {
  		indicators: false,
  		height: 600,
  		duration: 1000,
  		interval: 4000
  	};
    $('.slider').slider(sliderOpts);


  	var $banner = $("#banner");
  	// $banner.css('background-color', 'blue');

    $(document).ready(function(){
      $('.sidenav').sidenav();
    });

    $(document).ready(function(){
      $('.tabs').tabs();
    });

    $(document).ready(function() {
      $(".dropdown-trigger").dropdown();
    });
    
    $(document).ready(function(){
      $('.fixed-action-btn').floatingActionButton();
    });

    $(document).ready(function(){
      $('.modal').modal();
    });

  }); // end of document ready
})(jQuery); // end of jQuery name space



