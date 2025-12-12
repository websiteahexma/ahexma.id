
/// Modifikasi by arzu_354


(function(){
  // add .in-view when the card enters viewport
  const cards = document.querySelectorAll('.status-table-animate');
  if (!cards.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target); // animate once
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => io.observe(c));

  // optional: tiny 3D tilt (desktop only)
  function enableTilt(el){
    if (!el) return;
    let rect;
    el.addEventListener('pointermove', function(ev){
      if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
      rect = el.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width;
      const py = (ev.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 6; // rotateX
      const ry = (px - 0.5) * -6; // rotateY
      el.style.transform = `perspective(900px) translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    ['pointerleave','pointercancel'].forEach(ev => {
      el.addEventListener(ev, () => {
        el.style.transform = ''; // reset (CSS hover handles lift)
      });
    });
  }

  // attach to all cards (desktop will use)
  cards.forEach(c => enableTilt(c));
})();



// -- //


/// Modifikasi by arzu_354

(function() {
  const PROCESS_DELAY_MS = 900;     // delay sebelum membuka link (tetap di halaman selama ini)
  const RESTORE_DELAY_MS = 1200;    // restore tombol setelah ini
  const FALLBACK_HIDE_MS = 9000;    // auto-hide fallback jika popup diblokir

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function() {

    // ---- CREATE / GET FALLBACK ELEMENT (desktop toast + mobile bottom-sheet) ----
    let fallbackEl = document.getElementById('v2-open-fallback');
    if (!fallbackEl) {
      fallbackEl = document.createElement('div');
      fallbackEl.id = 'v2-open-fallback';
      fallbackEl.setAttribute('aria-hidden', 'true');
      fallbackEl.innerHTML = `
        <div class="v2-handle" aria-hidden="true"></div>
        <div class="v2-row">
          <span class="v2-msg">Popup diblokir — buka dokumen secara manual:</span>
        </div>
        <div class="v2-actions">
          <a class="v2-open-link" href="#" target="_blank" rel="noopener">Buka di Tab Baru</a>
          <button class="v2-open-same" type="button">Buka di Halaman Ini</button>
        </div>
      `;
      document.body.appendChild(fallbackEl);
    }

    const linkEl = fallbackEl.querySelector('.v2-open-link');
    const sameEl = fallbackEl.querySelector('.v2-open-same');

    // ---- show / hide fallback (use .v2-show class; aria-hidden toggled) ----
    function showFallback(url) {
      if (!fallbackEl) return;
      if (linkEl) linkEl.setAttribute('href', url);
      if (sameEl) sameEl.dataset.url = url;
      fallbackEl.classList.add('v2-show');
      fallbackEl.setAttribute('aria-hidden', 'false');
      clearTimeout(fallbackEl._hideTimer);
      fallbackEl._hideTimer = setTimeout(hideFallback, FALLBACK_HIDE_MS);
    }

    function hideFallback() {
      if (!fallbackEl) return;
      fallbackEl.classList.remove('v2-show');
      fallbackEl.setAttribute('aria-hidden', 'true');
      clearTimeout(fallbackEl._hideTimer);
    }

    // ---- fallback action handlers ----
    if (linkEl) {
      linkEl.addEventListener('click', function() { hideFallback(); });
    }
    if (sameEl) {
      sameEl.addEventListener('click', function() {
        const url = this.dataset.url;
        if (url) window.location.href = url;
        hideFallback();
      });
    }

    // ---- mobile: swipe-down to dismiss fallback ----
    (function addSwipeDismiss() {
      if (!fallbackEl) return;
      let startY = null, curY = null, dragging = false;
      fallbackEl.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length === 1) {
          dragging = true;
          startY = e.touches[0].clientY;
          fallbackEl.style.transition = 'none';
        }
      }, { passive: true });

      fallbackEl.addEventListener('touchmove', function(e) {
        if (!dragging) return;
        curY = e.touches[0].clientY;
        const delta = curY - startY;
        if (delta > 0) {
          fallbackEl.style.transform = `translateY(${delta}px)`;
          fallbackEl.style.opacity = String(Math.max(0, 1 - delta / 240));
        }
      }, { passive: true });

      fallbackEl.addEventListener('touchend', function() {
        if (!dragging) return;
        dragging = false;
        const delta = (curY || 0) - (startY || 0);
        fallbackEl.style.transition = '';
        if (delta > 80) {
          hideFallback();
        }
        fallbackEl.style.transform = '';
        fallbackEl.style.opacity = '';
        startY = curY = null;
      }, { passive: true });
    })();

    // ---- keyboard: Escape hides fallback ----
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hideFallback();
    });

    // ---- BUTTON HANDLER: .ticket_add_to_cart_2.button ----
    const buttons = Array.from(document.querySelectorAll('.ticket_add_to_cart_2.button'));
    if (!buttons.length) return;

    buttons.forEach(btn => {
      if (btn._v2Attached) return;
      btn._v2Attached = true;

      btn.addEventListener('click', function(ev) {
        try { ev.stopImmediatePropagation(); } catch(e) {}
        ev.preventDefault();

        if (btn.dataset.processingActiveV2 === '1') return;

        const url = btn.getAttribute('data-href-V2') ||
                    btn.getAttribute('data-href') ||
                    btn.getAttribute('href') || null;
        const target = (btn.getAttribute('data-target-V2') || '_blank').toLowerCase();
        const processingText = btn.getAttribute('data-processing-V2') || 'Tunggu sebentar ya...';
        const originalHTML = btn.innerHTML;

        // set processing UI
        btn.dataset.processingActiveV2 = '1';
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        // replace text (use textContent to avoid injecting HTML)
        btn.textContent = processingText;

        // remain on main page for PROCESS_DELAY_MS, then try to open
        setTimeout(function() {
          if (!url) {
            // restore if no url
            setTimeout(() => {
              try {
                btn.disabled = false;
                btn.removeAttribute('aria-busy');
                btn.innerHTML = originalHTML;
                delete btn.dataset.processingActiveV2;
              } catch(e){}
            }, RESTORE_DELAY_MS);
            return;
          }

          try {
            if (target === '_blank') {
              // attempt to open in new tab (may be blocked)
              const newWin = window.open(url, '_blank', 'noopener');
              if (!newWin) {
                // popup blocked -> show fallback UI (desktop toast or mobile bottom-sheet)
                showFallback(url);
              } else {
                try { newWin.opener = null; } catch(e){}
              }
            } else {
              // same-tab navigation
              window.location.href = url;
            }
          } catch (err) {
            showFallback(url);
          } finally {
            // restore button after a short delay to avoid locking UI
            setTimeout(() => {
              try {
                btn.disabled = false;
                btn.removeAttribute('aria-busy');
                btn.innerHTML = originalHTML;
                delete btn.dataset.processingActiveV2;
              } catch(e){}
            }, RESTORE_DELAY_MS);
          }
        }, PROCESS_DELAY_MS);
      }, { passive: false });
    });

  });
})();







/// End 


jQuery(document).ready(function () {
    "use strict";
    jQuery(document).setNav();
    var logoHeight = jQuery('#custom_logo img').height();
    var logoTransHeight = jQuery('#custom_logo_transparent img').height();
    var logoMargin = parseInt(jQuery('#custom_logo').css('marginTop'));
    var logoTransMargin = parseInt(jQuery('#custom_logo_transparent').css('marginTop'));
    var menuPaddingTop = parseInt(jQuery('#menu_wrapper div .nav li > a').css('paddingTop'));
    var menuPaddingBottom = parseInt(jQuery('#menu_wrapper div .nav li > a').css('paddingBottom'));
    var SearchPaddingTop = parseInt(jQuery('.top_bar #searchform button').css('paddingTop'));
    var menuLayout = jQuery('#pp_menu_layout').val();
    var headerContent = jQuery('#tg_header_content').val();
    jQuery(window).resize(function () {
        jQuery(document).setNav();
        if (jQuery(this).width() < 768) {
            jQuery('#menu_expand_wrapper a').trigger('click');
            if (menuLayout != 'leftmenu') {
                if (headerContent == 'menu') {
                    var resizedTopBarHeight = jQuery('.top_bar').height();
                    jQuery('#wrapper').css('paddingTop', resizedTopBarHeight + 'px');
                    jQuery('.logo_wrapper').css('marginTop', '');
                    jQuery('.top_bar #searchform button').css('paddingTop', '')
                } else {
                    jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px');
                    setTimeout(function () {
                        jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px')
                    }, 200);
                    setTimeout(function () {
                        jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px')
                    }, 1000)
                }
            } else {
                jQuery('#wrapper').css('paddingTop', 0)
            }
            jQuery("#page_content_wrapper .sidebar_wrapper").trigger("sticky_kit:detach")
        } else {
            jQuery('#wrapper').css('paddingTop', parseInt(jQuery('.header_style_wrapper').height()) + 'px');
            jQuery('#menu_wrapper div .nav > li > a').attr('style', '');
            jQuery('#menu_wrapper div .nav > li > a').attr('style', '')
        }
        if (jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper').length > 0) {
            var sliderHeight = jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper').height();
            var topBarHeight = jQuery('.top_bar').height();
            if (jQuery('.above_top_bar').length > 0) {
                topBarHeight += jQuery('.above_top_bar').height()
            }
            if (jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper.fullscreen-container').length > 0) {
                var topBarHeight = 55
            }
            jQuery('.ppb_wrapper').css('marginTop', sliderHeight - topBarHeight + 'px');
            jQuery('#page_content_wrapper').css('marginTop', sliderHeight - topBarHeight + 'px')
        }
    });
    jQuery(document).setiLightbox();
    jQuery('#menu_expand_wrapper a').on('click', function () {
        jQuery('#menu_wrapper').fadeIn();
        jQuery('#custom_logo').animate({
            'left': '15px',
            'opacity': 1
        }, 400);
        jQuery('#menu_close').animate({
            'left': '-10px',
            'opacity': 1
        }, 400);
        jQuery(this).animate({
            'left': '-60px',
            'opacity': 0
        }, 400);
        jQuery('#menu_border_wrapper select').animate({
            'left': '0',
            'opacity': 1
        }, 400).fadeIn()
    });
    jQuery('#menu_close').on('click', function () {
        jQuery('#custom_logo').animate({
            'left': '-200px',
            'opacity': 0
        }, 400);
        jQuery(this).stop().animate({
            'left': '-200px',
            'opacity': 0
        }, 400);
        jQuery('#menu_expand_wrapper a').animate({
            'left': '20px',
            'opacity': 1
        }, 400);
        jQuery('#menu_border_wrapper select').animate({
            'left': '-200px',
            'opacity': 0
        }, 400).fadeOut();
        jQuery('#menu_wrapper').fadeOut()
    });
    var isDisableRightClick = jQuery('#pp_enable_right_click').val();
    if (parseInt(isDisableRightClick != 0)) {
        jQuery(this).bind("contextmenu", function (e) {
            e.preventDefault()
        })
    }
    jQuery(window).scroll(function () {
        var calScreenWidth = jQuery(window).width();
        if (jQuery(this).scrollTop() > 200) {
            jQuery('#toTop').stop().css({
                opacity: 1,
                "visibility": "visible"
            }).animate({
                "visibility": "visible"
            }, {
                duration: 1000,
                easing: "easeOutExpo"
            })
        } else if (jQuery(this).scrollTop() == 0) {
            jQuery('#toTop').stop().css({
                opacity: 0,
                "visibility": "hidden"
            }).animate({
                "visibility": "hidden"
            }, {
                duration: 1500,
                easing: "easeOutExpo"
            })
        }
    });
    jQuery('#toTop, .hr_totop').on('click', function () {
        jQuery('body,html,#page_content_wrapper.split').animate({
            scrollTop: 0
        }, 800)
    });
    var isDisableDragging = jQuery('#pp_enable_dragging').val();
    if (isDisableDragging != '') {
        jQuery("img").mousedown(function () {
            return !1
        })
    }
    if (jQuery('#pp_topbar').val() == 0) {
        var topBarHeight = jQuery('.header_style_wrapper').height()
    } else {
        var topBarHeight = parseInt(jQuery('.header_style_wrapper').height() - jQuery('.header_style_wrapper .above_top_bar').height())
    }
    if (menuLayout != 'leftmenu' || jQuery(window).width() <= 768) {
        if (jQuery('#photography_header_content').val() == 'menu') {
            jQuery('#wrapper').css('paddingTop', parseInt(jQuery('.header_style_wrapper').height()) + 'px')
        } else {
            jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px');
            setTimeout(function () {
                jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px')
            }, 200);
            setTimeout(function () {
                jQuery('#wrapper').css('paddingTop', parseInt(jQuery('#elementor-header').height()) + 'px')
            }, 1000)
        }
    }
    if (menuLayout != 'leftmenu' || jQuery(window).width() <= 960) {
        jQuery('#page_content_wrapper.split, .page_content_wrapper.split').css('top', parseInt(topBarHeight + jQuery('.header_style_wrapper .above_top_bar').height()) + 'px');
        jQuery('#page_content_wrapper.split, .page_content_wrapper.split').css('paddingBottom', parseInt(topBarHeight + jQuery('.header_style_wrapper .above_top_bar').height()) + 'px');
        jQuery(window).scroll(function () {
            if (jQuery('#pp_fixed_menu').val() == 1 && jQuery('html').data('style') != 'fullscreen' && jQuery('html').data('style') != 'fullscreen_white') {
                if (jQuery(this).scrollTop() >= 200) {
                    jQuery('.extend_top_contact_info').hide();
                    jQuery('.header_style_wrapper').addClass('scroll');
                    jQuery('.top_bar').addClass('scroll');
                    if (jQuery('.top_bar').hasClass('hasbg')) {
                        jQuery('.top_bar').removeClass('hasbg');
                        jQuery('.top_bar').data('hasbg', 1);
                        jQuery('#custom_logo').removeClass('hidden');
                        jQuery('#custom_logo_transparent').addClass('hidden')
                    }
                } else if (jQuery(this).scrollTop() < 200) {
                    jQuery('.extend_top_contact_info').show();
                    jQuery('#custom_logo img').removeClass('zoom');
                    jQuery('#custom_logo img').css('maxHeight', '');
                    jQuery('#custom_logo_transparent img').removeClass('zoom');
                    jQuery('#custom_logo').css('marginTop', parseInt(logoMargin) + 'px');
                    jQuery('#custom_logo_transparent').css('marginTop', parseInt(logoTransMargin) + 'px');
                    jQuery('#menu_wrapper div .nav > li > a').css('paddingTop', menuPaddingTop + 'px');
                    jQuery('#menu_wrapper div .nav > li > a').css('paddingBottom', menuPaddingBottom + 'px');
                    if (jQuery('.top_bar').data('hasbg') == 1) {
                        jQuery('.top_bar').addClass('hasbg');
                        jQuery('#custom_logo').addClass('hidden');
                        jQuery('#custom_logo_transparent').removeClass('hidden')
                    }
                    jQuery('.header_style_wrapper').removeClass('scroll');
                    jQuery('.top_bar').removeClass('scroll')
                }
            } else {
                if (jQuery(this).scrollTop() >= 200) {
                    jQuery('.header_style_wrapper').addClass('nofixed')
                } else {
                    jQuery('.header_style_wrapper').removeClass('nofixed')
                }
            }
        });
        if (jQuery('#tg_smart_fixed_menu').val() == 1 && jQuery('html').data('style') != 'fullscreen' && jQuery('html').data('style') != 'fullscreen_white') {
            if (!is_touch_device()) {
                var lastScrollTop = 0;
                jQuery(window).scroll(function (event) {
                    var st = jQuery(this).scrollTop();
                    if (st > lastScrollTop && st > 0) {
                        jQuery('.top_bar').removeClass('scroll_up');
                        jQuery('.header_style_wrapper').removeClass('scroll_up');
                        jQuery('.header_style_wrapper').addClass('scroll_down')
                    } else {
                        jQuery('.top_bar').addClass('scroll_up');
                        jQuery('.header_style_wrapper').addClass('scroll_up');
                        jQuery('.header_style_wrapper').removeClass('scroll_down')
                    }
                    lastScrollTop = st;
                    jQuery('.header_style_wrapper').attr('data-st', st);
                    jQuery('.header_style_wrapper').attr('data-lastscrolltop', lastScrollTop)
                })
            } else {
                var lastY;
                jQuery(document).bind('touchmove', function (e) {
                    var currentY = e.originalEvent.touches[0].clientY;
                    if (currentY > 200) {
                        jQuery('.top_bar').addClass('scroll_up');
                        jQuery('.header_style_wrapper').addClass('scroll_up');
                        jQuery('.header_style_wrapper').removeClass('scroll_down')
                    } else {
                        jQuery('.top_bar').removeClass('scroll_up');
                        jQuery('.header_style_wrapper').removeClass('scroll_up');
                        jQuery('.header_style_wrapper').addClass('scroll_down')
                    }
                    jQuery('.header_style_wrapper').attr('data-pos', currentY)
                })
            }
        }
    }
    jQuery(window).scroll(function () {
        if (jQuery('#pp_fixed_menu').val() == 1) {
            if (jQuery(this).scrollTop() >= 100) {
                jQuery('#elementor-header').removeClass('visible');
                jQuery('#elementor-sticky-header').addClass('visible')
            } else if (jQuery(this).scrollTop() < 100) {
                jQuery('#elementor-header').addClass('visible');
                jQuery('#elementor-sticky-header').removeClass('visible')
            }
        }
    });
    jQuery(document).mouseenter(function () {
        jQuery('body').addClass('hover')
    });
    jQuery(document).mouseleave(function () {
        jQuery('body').removeClass('hover')
    });
    jQuery('#post_more_close').on('click', function () {
        jQuery('#post_more_wrapper').animate({
            right: '-380px'
        }, 300);
        return !1
    });
    var overlayEffect = jQuery('#tg_sidemenu_overlay_effect').val();
    jQuery('#mobile_nav_icon').on('click', function () {
        jQuery('body').toggleClass('js_nav');
        jQuery('body').toggleClass(overlayEffect);
        jQuery('#close_mobile_menu').addClass('open');
        if (is_touch_device()) {
            jQuery('body.js_nav').css('overflow', 'auto')
        }
    });
    jQuery('#close_mobile_menu').on('click', function () {
        jQuery('body').removeClass('js_nav');
        jQuery('body').removeClass(overlayEffect);
        jQuery(this).removeClass('open')
    });
    jQuery('.mobile_menu_close a, #mobile_menu_close').on('click', function () {
        jQuery('body').removeClass('js_nav');
        jQuery('body').removeClass(overlayEffect);
        jQuery('#close_mobile_menu').removeClass('open')
    });
    jQuery('.close_alert').on('click', function () {
        var target = jQuery(this).data('target');
        jQuery('#' + target).fadeOut()
    });
    jQuery('.progress_bar').waypoint(function (direction) {
        jQuery(this).addClass('fadeIn');
        var progressContent = jQuery(this).children('.progress_bar_holder').children('.progress_bar_content');
        var progressWidth = progressContent.data('score');
        progressContent.css({
            'width': progressWidth + '%'
        })
    }, {
        offset: '100%'
    });
    jQuery('.tooltip').tooltipster();
    jQuery('.demotip').tooltipster({
        position: 'left'
    });
    jQuery('.portfolio_prev_next_link').each(function () {
        jQuery(this).tooltipster({
            content: jQuery('<img src="' + jQuery(this).attr('data-img') + '" /><br/><div style="text-align:center;margin:7px 0 5px 0;"><strong>' + jQuery(this).attr('data-title') + '</strong></div>')
        })
    });
    jQuery('.post_prev_next_link').each(function () {
        jQuery(this).tooltipster({
            content: jQuery('<img src="' + jQuery(this).attr('data-img') + '" />')
        })
    });
    jQuery('.post_share').on('click', function () {
        var targetShareID = jQuery(this).attr('data-share');
        var targetParentID = jQuery(this).attr('data-parent');
        jQuery(this).toggleClass('visible');
        jQuery('#' + targetShareID).toggleClass('slideUp');
        jQuery('#' + targetParentID).toggleClass('sharing');
        return !1
    });
    if (jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper').length > 0) {
        var sliderHeight = jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper').height();
        var topBarHeight = jQuery('.top_bar').height();
        if (jQuery('.above_top_bar').length > 0) {
            topBarHeight += jQuery('.above_top_bar').height()
        }
        if (jQuery('.page_slider.menu_transparent').find('.rev_slider_wrapper.fullscreen-container').length > 0) {
            var topBarHeight = 55
        }
        jQuery('.ppb_wrapper').css('marginTop', sliderHeight - topBarHeight + 'px');
        jQuery('#page_content_wrapper').css('marginTop', sliderHeight - topBarHeight + 'px')
    }
    jQuery('.skin_box').on('click', function () {
        jQuery('.skin_box').removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery('#skin').val(jQuery(this).attr('data-color'))
    });
    jQuery('#demo_apply').on('click', function () {
        jQuery('#ajax_loading').addClass('visible');
        jQuery('body').addClass('loading');
        jQuery("form#form_option").submit()
    });
    jQuery('#option_wrapper').mouseenter(function () {
        jQuery('body').addClass('overflow_hidden')
    });
    jQuery('#option_wrapper').mouseleave(function () {
        jQuery('body').removeClass('overflow_hidden')
    });
    jQuery('.animated').each(function () {
        jQuery(this).imagesLoaded(function () {
            var windowWidth = jQuery(window).width();
            if (windowWidth >= 960) {
                jQuery(this).waypoint(function (direction) {
                    var animationClass = jQuery(this).data('animation');
                    jQuery(this).addClass(animationClass, direction === 'down')
                }, {
                    offset: '100%'
                })
            }
        })
    });
    var calScreenHeight = jQuery(window).height() - 108;
    var miniRightPos = 800;
    var cols = 3
    var masonry = jQuery('.gallery_mansory_wrapper');
    masonry.imagesLoaded(function () {
        masonry.masonry({
            itemSelector: '.mansory_thumbnail',
            isResizable: !0,
            isAnimated: !0,
            isFitWidth: !0,
            columnWidth: Math.floor((masonry.width() / cols))
        });
        masonry.children('.mansory_thumbnail').children('.gallery_type').each(function () {
            jQuery(this).addClass('fade-in')
        })
    });

    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen()
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen()
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
    jQuery(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
        var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        var event = state ? 'FullscreenOn' : 'FullscreenOff';
        if (event == 'FullscreenOff') {
            jQuery('#page_maximize').show();
            jQuery('.header_style_wrapper').show();
            jQuery('#option_btn').show()
        }
    });
    jQuery('#page_maximize').on('click', function () {
        launchFullscreen(document.documentElement);
        jQuery(this).hide();
        jQuery('.header_style_wrapper').hide();
        jQuery('#option_btn').hide()
    });
    jQuery('#page_minimize').on('click', function () {
        exitFullscreen();
        jQuery('#page_maximize').show();
        jQuery(this).hide();
        jQuery('.header_style_wrapper').show();
        jQuery('#option_btn').show()
    });
    jQuery('#page_share').on('click', function () {
        jQuery('#overlay_background').addClass('visible');
        jQuery('#overlay_background').addClass('share_open');
        jQuery('#fullscreen_share_wrapper').css('visibility', 'visible')
    });
    jQuery('#overlay_background').on('click', function () {
        if (!jQuery('body').hasClass('js_nav')) {
            jQuery('#overlay_background').removeClass('visible');
            jQuery('#overlay_background').removeClass('share_open');
            jQuery('#fullscreen_share_wrapper').css('visibility', 'hidden')
        }
    });
    var parallaxSpeed = 0.5;
    if (jQuery(window).width() > 1200) {
        parallaxSpeed = 0.7
    }
    jQuery('.parallax').each(function () {
        var parallaxObj = jQuery(this);
        jQuery(this).jarallax({
            zIndex: 0,
            speed: parallaxSpeed,
            onCoverImage: function () {
                parallaxObj.css('z-index', 0)
            }
        })
    });
    var menuLayout = jQuery('#pp_menu_layout').val();
    jQuery('.rev_slider_wrapper.fullscreen-container').each(function () {
        jQuery(this).append('<div class="icon-scroll"></div>')
    });
    if (jQuery('.one.fullwidth.slideronly').length > 0) {
        jQuery('body').addClass('overflow_hidden')
    }
    if (!is_touch_device()) {
        jQuery(window).stellar({
            positionProperty: 'transform',
            parallaxBackgrounds: !1,
            responsive: !0,
            horizontalScrolling: !1,
            hideDistantElements: !1
        })
    }
    jQuery('#post_share_text').click(function () {
        jQuery('body').addClass('overflow_hidden');
        jQuery('body').addClass('blur');
        jQuery('#side_menu_wrapper').addClass('visible');
        jQuery('#side_menu_wrapper').addClass('share_open');
        jQuery('#fullscreen_share_wrapper').css('visibility', 'visible')
    });
    jQuery('#close_share').on('click', function () {
        jQuery('body').removeClass('overflow_hidden');
        jQuery('body').removeClass('blur');
        jQuery('#side_menu_wrapper').removeClass('visible');
        jQuery('#side_menu_wrapper').removeClass('share_open');
        jQuery('#fullscreen_share_wrapper').css('visibility', 'hidden')
    });
    if (jQuery('#tg_sidebar_sticky').val() == 1) {
        if (jQuery('#pp_fixed_menu').val() == 1) {
            jQuery("#page_content_wrapper .sidebar_wrapper").stick_in_parent({
                offset_top: 100
            });
            jQuery(".page_content_wrapper .sidebar_wrapper").stick_in_parent({
                offset_top: 100
            })
        } else {
            jQuery("#page_content_wrapper .sidebar_wrapper").stick_in_parent();
            jQuery(".page_content_wrapper .sidebar_wrapper").stick_in_parent()
        }
        if (jQuery(window).width() < 768 || is_touch_device()) {
            jQuery("#page_content_wrapper .sidebar_wrapper").trigger("sticky_kit:detach");
            jQuery(".page_content_wrapper .sidebar_wrapper").trigger("sticky_kit:detach")
        }
        jQuery(window).resize(function () {
            if (jQuery(window).width() < 768 || is_touch_device()) {
                jQuery("#page_content_wrapper .sidebar_wrapper").trigger("sticky_kit:detach");
                jQuery(".page_content_wrapper .sidebar_wrapper").trigger("sticky_kit:detach")
            } else {
                if (jQuery('#pp_fixed_menu').val() == 1) {
                    jQuery("#page_content_wrapper .sidebar_wrapper").stick_in_parent({
                        offset_top: 100
                    });
                    jQuery(".page_content_wrapper .sidebar_wrapper").stick_in_parent({
                        offset_top: 100
                    })
                } else {
                    jQuery("#page_content_wrapper .sidebar_wrapper").stick_in_parent();
                    jQuery(".page_content_wrapper .sidebar_wrapper").stick_in_parent()
                }
            }
        })
    }
    jQuery('.mobile_main_nav li a, #sub_menu li a').on('click', function () {
        if (!jQuery(this).parent('li').hasClass('menu-item-has-children')) {
            jQuery('body').removeClass('js_nav');
            jQuery('body').removeClass('blur')
        }
    });
    jQuery('iframe[src*="youtube.com"]').each(function () {
        jQuery(this).wrap('<div class="video-container"></div>')
    });
    jQuery('iframe[src*="vimeo.com"]').each(function () {
        jQuery(this).wrap('<div class="video-container"></div>')
    });
    jQuery('.ticket_add_to_cart').on('click', function (e) {
        e.preventDefault();
        jQuery(this).attr("disabled", "disabled");
        var productID = jQuery(this).attr('data-product');
        var processing = jQuery(this).attr('data-processing');
        var ajaxURL = jQuery(this).attr('data-url');
        var cartURL = jQuery('#tg_cart_url').val();
        jQuery(this).html(processing);
        jQuery.ajax({
            url: ajaxURL,
            type: 'POST',
            success: function (results) {
                location.href = cartURL
            }
        })
        return !1
    });
    if (self.document.location.hash != '') {
        jQuery(window).on("load", function () {
            setTimeout(function () {
                var stickyHeaderHeight = jQuery('#elementor-sticky-header').height();
                var posToScroll = parseInt(jQuery(self.document.location.hash).offset().top - stickyHeaderHeight);
                jQuery('html, body').stop().animate({
                    scrollTop: posToScroll
                }, 'fast')
            }, 1000)
        })
    }
});
setTimeout(function () {
    jQuery('#elementor-header').addClass('visible')
}, 200);
jQuery(window).on('resize load', adjustIframes)





