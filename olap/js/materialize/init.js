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

  }); // end of document ready
})(jQuery); // end of jQuery name space



