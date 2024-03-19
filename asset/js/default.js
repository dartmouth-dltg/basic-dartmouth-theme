(($) => {
  function createUniqueId() {
    return uuidv4();
  }

  function imageRatio() {
    const promoImg = $(
      "#content.used-for-site-promo .site-promo-image figure img"
    );
    const promoImgWidth = promoImg.width();
    promoImg.css("height", promoImgWidth * 0.625);
  }

  $(document).ready(() => {
    const fontAwesome = new FontFaceObserver('FontAwesome');
    const nationalWeb = new FontFaceObserver('National2');
    const ruzicka = new FontFaceObserver('DartmouthRuzicka');
    const manukaBlack = new FontFaceObserver('ManukaBlack');

    const html = document.documentElement;

    const fontNames = {
      "headings-font-family-h1": manukaBlack,
      "headings-font-family-others": nationalWeb,
      "font-primary-icons": fontAwesome,
      "font-family-sans-serif": nationalWeb,
      "font-family-serif": ruzicka,
    };

    const domain = window.location.hostname.replace(/\./g, "_");

    $.each(fontNames, (index, font) => {
      const storageKey = `${index}-${domain}-omeka`;
      if (!localStorage[storageKey]) {
        font
          .load(null, 5000)
          .then(() => {
            if (typeof Storage !== 'undefined') {
              localStorage[storageKey] = true;
            }
            html.classList.add(`${index}-loaded`);
          })
          .catch(() => {
            if (typeof Storage !== 'undefined') {
              localStorage[storageKey] = false;
            }
            html.classList.add(`${index}-failed`);
          });
      }
    });

    imageRatio();

    $(window).on('resize', function() {
      imageRatio();
    });

    // set up accessible slick for multi-image media embeds
    $('.item.resource.show .media-embeds').each(function(){
      if ($(this).children('.media-render').length == 1) {
        return;
      }
      $(this).not('.slick-initalized').slick(
        {
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: false,
          autoplaySpeed: 8000,
          dots: true,
          adaptiveHeight: true,
          accessibility: true,
          arrowsPlacement: "split",
          accessibility: true,
          focusOnSelect: true,
          fade: true,
          cssEase: 'linear',
        }
      );
    });

    // enhance values that are plain text links by making them actionable links
    $('.value-content').each(function() {
      const newText = $(this).text().autoLink();
      $(this).html(newText);
    })

    // add unique ids to the images. we'll need this to sync the lightbox slider and slick slider
    $('.item.resource.show .media-embeds .media-render img').parent('a').each(function() {
      $(this).addClass('dcl-lightbox');
      const uuid = createUniqueId;
      $(this).attr('id', uuid);
    });

    if (typeof(Tobii) !== 'undefined') {
      const tobii = new Tobii({
        selector: '.dcl-lightbox'
      });

      $('.tobii-image img').each(function() {
        const src = $(this).data('src')
        const slickImgId = $('a[href="' + src + '"]').attr('id')
        $(this).data('slick-id', slickImgId)
      });

      $('.tobii-zoom__icon').attr('tabindex',0);

      // basic sync lightbox and carousel
      $('.tobii__btn--next, .tobii__btn--previous').click(function() {
        // find active slide
        const activeSlide = $('.tobii__slide--is-active');
        const activeId = activeSlide.find('img').data('slick-id');
        const linkedHref = $('a[id="' + activeId + '"]');
        const activeSlider = linkedHref.closest('.slick-slider');
        if ($(this).hasClass('tobii__btn--next')) {
          activeSlider.slick('slickNext');
        }
        else activeSlider.slick('slickPrev');
      });

      // expand/compress image in lightbox
      $('a.lightbox-control').click(function(e) {
        e.preventDefault();
        if ($(this).children('.fa').hasClass('fa-expand')) {
          $(this).children('.fa').removeClass('fa-expand').addClass('fa-compress');
          $(this).closest('.lightbox-details-img').removeClass('with-description');
        }
        else {
          $(this).children('.fa').removeClass('fa-compress').addClass('fa-expand');
          $(this).closest('.lightbox-details-img').addClass('with-description');
        }
      });
    }

    // language switcher
    $('header select.language-switcher').on('change', function() {
      window.location.pathname = $(this).find('option[value="' + this.value + '"]').data('href')
    })

    // back to top
    topButton = $("#back-to-top-btn");
    
    topButton.click(function(){
      $("html, body").animate({ scrollTop: 0 }, "slow");
      return false;
    });
    
    $(window).on('load scroll', function() {
      if ($(window).scrollTop() > 400) {
        topButton.show();
      }
      else topButton.hide();
    });

    // explore: page sub-menu nav
    $(".dcl-sub-menu-control").on("click", (evt) => {
      const target = $(evt.currentTarget);
      if (target.attr("aria-expanded") === "false") {
        target.attr("aria-expanded", "true");
        $("#dcl-sub-menu-content").show();
      } else {
        target.attr("aria-expanded", "false");
        $("#dcl-sub-menu-content").hide();
      }
    });
  });
})(jQuery);
