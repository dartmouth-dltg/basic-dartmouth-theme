(function($) {
  $(document).ready(function() {
    $('.item.resource.show .media-embeds').each(function(){
      if ($(this).children('.media-render').length == 1) {
        console.log('foo')
        return;
      }
      $(this).slick(
        {
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,
          autoplaySpeed: 8000,
          dots: true,
          adaptiveHeight: false,
          accessibility: true,
          arrowsPlacement: "split",
          accessibility: true,
          focusOnSelect: true,
          fade: true,
          cssEase: 'linear',
        }
      );
    });
  });
})(jQuery);
