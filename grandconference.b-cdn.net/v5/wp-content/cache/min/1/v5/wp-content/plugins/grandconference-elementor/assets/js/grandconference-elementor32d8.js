function isTouchDevice() {
    return 'ontouchstart' in window || 'onmsgesturechange' in window
}

function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)
};
jQuery.fn.isInViewport = function () {
    var elementTop = jQuery(this).offset().top;
    var elementBottom = elementTop + jQuery(this).outerHeight();
    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom
};
(function ($) {
    $(window).on('elementor/frontend/init', function () {
        jQuery('.grandconference-cart-mini-cart-link').on('click', function () {
            if (jQuery('#woocommerce-mini-cart-wrapper').length) {
                setTimeout(function () {
                    jQuery('#woocommerce-mini-cart-wrapper').addClass('visible')
                }, 10)
            }
            return !1
        });
        var isTouch = ('ontouchstart' in document.documentElement);
        if (isTouch) {
            jQuery('#footer-wrapper').css('overflow-x', 'hidden')
        }
        jQuery("img.lazy").each(function () {
            var currentImg = jQuery(this);
            jQuery(this).Lazy({
                onFinishedAll: function () {
                    currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                    currentImg.parent('.grandconference_gallery_lightbox').parent("div.gallery-grid-item").removeClass("lazy")
                }
            })
        });
        jQuery('#page-content-wrapper .elementor-widget-image.animation').each(function () {
            jQuery(this).smoove({
                offset: '30%'
            })
        });
        var bodyBGColor = jQuery('body').css('background-color');
        if (bodyBGColor != '') {
            jQuery('#wrapper').css('background-color', bodyBGColor)
        }
        if (parseInt(jQuery(window).width()) < 501) {
            jQuery("section.elementor-section-height-min-height .elementor-container").each(function () {
                jQuery(this).height('auto')
            })
        }
        jQuery(window).resize(function () {
            jQuery("section.elementor-section-height-min-height .elementor-container").each(function () {
                var currentSection = jQuery(this);
                if (parseInt(jQuery(window).width()) < 501) {
                    currentSection.height('auto')
                } else {
                    currentSection.height('')
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
            if (elementorFrontend.isEditMode()) {
                var elementSettings = {};
                var modelCID = $scope.data('model-cid');
                var settings = elementorFrontend.config.elements.data[modelCID];
                if (typeof settings != 'undefined') {
                    var type = settings.attributes.widgetType || settings.attributes.elType,
                        settingsKeys = elementorFrontend.config.elements.keys[type];
                    if (!settingsKeys) {
                        settingsKeys = elementorFrontend.config.elements.keys[type] = [];
                        jQuery.each(settings.controls, function (name, control) {
                            if (control.frontend_available) {
                                settingsKeys.push(name)
                            }
                        })
                    }
                    jQuery.each(settings.getActiveControls(), function (controlKey) {
                        if (-1 !== settingsKeys.indexOf(controlKey)) {
                            elementSettings[controlKey] = settings.attributes[controlKey]
                        }
                    });
                    var widgetExt = elementSettings
                }
            } else {
                var widgetExtObj = $scope.attr('data-settings');
                if (typeof widgetExtObj != 'undefined') {
                    var widgetExt = JSON.parse(widgetExtObj)
                }
            }
            if (typeof widgetExt != 'undefined') {
                if (typeof widgetExt.grandconference_ext_is_background_parallax != 'undefined' && widgetExt.grandconference_ext_is_background_parallax == 'true') {
                    if (typeof widgetExt.background_background != 'undefined' && widgetExt.background_background == 'classic') {
                        if (!elementorFrontend.isEditMode()) {
                            var widgetBg = $scope.css('background-image');
                            if (widgetBg == 'none') {
                                widgetBg = $scope.css('--e-bg-lazyload')
                            }
                            widgetBg = widgetBg.replace('url(', '').replace(')', '').replace(/\"/gi, "");
                            if (widgetBg != '') {
                                var jarallaxScrollSpeed = 0.5;
                                if (typeof widgetExt.grandconference_ext_is_background_parallax_speed.size != 'undefined') {
                                    jarallaxScrollSpeed = parseFloat(widgetExt.grandconference_ext_is_background_parallax_speed.size)
                                }
                                $scope.addClass('jarallax');
                                $scope.append('<img class="jarallax-img" src="' + widgetBg + '"/>');
                                $scope.jarallax({
                                    speed: jarallaxScrollSpeed
                                });
                                if (!isMobileDevice()) {
                                    $scope.css('background-image', 'none')
                                }
                                jQuery(window).resize(function () {
                                    if (!isMobileDevice()) {
                                        $scope.css('background-image', 'none')
                                    } else {
                                        $scope.css('background-image', 'url(' + widgetBg + ')')
                                    }
                                })
                            }
                        }
                    }
                }
                if (typeof widgetExt.grandconference_ext_is_background_backdrop != 'undefined' && widgetExt.grandconference_ext_is_background_backdrop == 'true') {
                    $scope.css('backdrop-filter', 'blur(' + parseInt(widgetExt.grandconference_ext_is_background_backdrop_blur.size) + 'px)')
                }
                if (typeof widgetExt.grandconference_ext_is_fadeout_animation != 'undefined' && widgetExt.grandconference_ext_is_fadeout_animation == 'true') {
                    var scrollVelocity = parseFloat(widgetExt.grandconference_ext_is_fadeout_animation_velocity.size);
                    var scrollDirection = widgetExt.grandconference_ext_is_fadeout_animation_direction;
                    jQuery(window).scroll(function (i) {
                        var scrollVar = jQuery(window).scrollTop();
                        var scrollPx = -(scrollVelocity * scrollVar);
                        if (scrollDirection == 'up') {
                            scrollPx = -(scrollVelocity * scrollVar)
                        } else if (scrollDirection == 'down') {
                            scrollPx = scrollVelocity * scrollVar
                        } else {
                            scrollPx = 0
                        }
                        $scope.find('.elementor-widget-container').css({
                            'transform': "translateY(" + scrollPx + "px)"
                        });
                        $scope.find('.elementor-widget-container').css({
                            'opacity': (100 - (scrollVar / 4)) / 100
                        })
                    })
                }
                if (typeof widgetExt.grandconference_ext_is_scrollme != 'undefined' && widgetExt.grandconference_ext_is_scrollme == 'true') {
                    var scrollArgs = {};
                    if (typeof widgetExt.grandconference_ext_scrollme_scalex.size != 'undefined' && widgetExt.grandconference_ext_scrollme_scalex.size != 1) {
                        scrollArgs.scaleX = widgetExt.grandconference_ext_scrollme_scalex.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_scaley.size != 'undefined' && widgetExt.grandconference_ext_scrollme_scaley.size != 1) {
                        scrollArgs.scaleY = widgetExt.grandconference_ext_scrollme_scaley.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_scalez.size != 'undefined' && widgetExt.grandconference_ext_scrollme_scalez.size != 1) {
                        scrollArgs.scaleZ = widgetExt.grandconference_ext_scrollme_scalez.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_rotatex.size != 'undefined' && widgetExt.grandconference_ext_scrollme_rotatex.size != 0) {
                        scrollArgs.rotateX = widgetExt.grandconference_ext_scrollme_rotatex.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_rotatey.size != 'undefined' && widgetExt.grandconference_ext_scrollme_rotatey.size != 0) {
                        scrollArgs.rotateY = widgetExt.grandconference_ext_scrollme_rotatey.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_rotatez.size != 'undefined' && widgetExt.grandconference_ext_scrollme_rotatez.size != 0) {
                        scrollArgs.rotateY = widgetExt.grandconference_ext_scrollme_rotatez.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_translatex.size != 'undefined' && widgetExt.grandconference_ext_scrollme_translatex.size != 0) {
                        scrollArgs.x = widgetExt.grandconference_ext_scrollme_translatex.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_translatey.size != 'undefined' && widgetExt.grandconference_ext_scrollme_translatey.size != 0) {
                        scrollArgs.y = widgetExt.grandconference_ext_scrollme_translatey.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_translatez.size != 'undefined' && widgetExt.grandconference_ext_scrollme_translatez.size != 0) {
                        scrollArgs.z = widgetExt.grandconference_ext_scrollme_translatez.size
                    }
                    if (typeof widgetExt.grandconference_ext_scrollme_smoothness.size != 'undefined') {
                        scrollArgs.smoothness = widgetExt.grandconference_ext_scrollme_smoothness.size
                    }
                    $scope.attr('data-parallax', JSON.stringify(scrollArgs));
                    if (typeof widgetExt.grandconference_ext_scrollme_disable != 'undefined') {
                        if (widgetExt.grandconference_ext_scrollme_disable == 'mobile') {
                            if (parseInt(jQuery(window).width()) < 501) {
                                $scope.addClass('noanimation')
                            }
                        }
                        if (widgetExt.grandconference_ext_scrollme_disable == 'tablet') {
                            if (parseInt(jQuery(window).width()) < 769) {
                                $scope.addClass('noanimation')
                            }
                        }
                        jQuery(window).resize(function () {
                            if (widgetExt.grandconference_ext_scrollme_disable == 'mobile') {
                                if (isMobileDevice() || parseInt(jQuery(window).width()) < 501) {
                                    $scope.addClass('noanimation')
                                } else {
                                    $scope.removeClass('noanimation')
                                }
                            }
                            if (widgetExt.grandconference_ext_scrollme_disable == 'tablet') {
                                if (parseInt(jQuery(window).width()) < 769) {
                                    $scope.addClass('noanimation')
                                } else {
                                    $scope.removeClass('noanimation')
                                }
                            }
                        })
                    }
                }
                if (typeof widgetExt.grandconference_ext_is_smoove != 'undefined' && widgetExt.grandconference_ext_is_smoove == 'true') {
                    $scope.addClass('init-smoove');
                    $scope.smoove({
                        min_width: parseInt(widgetExt.grandconference_ext_smoove_disable),
                        scaleX: widgetExt.grandconference_ext_smoove_scalex.size,
                        scaleY: widgetExt.grandconference_ext_smoove_scaley.size,
                        rotateX: parseInt(widgetExt.grandconference_ext_smoove_rotatex.size) + 'deg',
                        rotateY: parseInt(widgetExt.grandconference_ext_smoove_rotatey.size) + 'deg',
                        rotateZ: parseInt(widgetExt.grandconference_ext_smoove_rotatez.size) + 'deg',
                        moveX: parseInt(widgetExt.grandconference_ext_smoove_translatex.size) + 'px',
                        moveY: parseInt(widgetExt.grandconference_ext_smoove_translatey.size) + 'px',
                        moveZ: parseInt(widgetExt.grandconference_ext_smoove_translatez.size) + 'px',
                        skewX: parseInt(widgetExt.grandconference_ext_smoove_skewx.size) + 'deg',
                        skewY: parseInt(widgetExt.grandconference_ext_smoove_skewy.size) + 'deg',
                        perspective: parseInt(widgetExt.grandconference_ext_smoove_perspective.size),
                        transformOrigin: parseInt(widgetExt.grandconference_ext_smoove_transform_originy.size) + '% ' + parseInt(widgetExt.grandconference_ext_smoove_transform_originx.size) + '%',
                        offset: '-5%',
                    });
                    if (typeof widgetExt.grandconference_ext_smoove_duration != 'undefined') {
                        $scope.css('transition-duration', parseInt(widgetExt.grandconference_ext_smoove_duration) + 'ms')
                    }
                    var width = jQuery(window).width();
                    if (widgetExt.grandconference_ext_smoove_disable >= width) {
                        if (!$scope.hasClass('smooved')) {
                            $scope.addClass('no-smooved')
                        }
                        return !1
                    }
                    setTimeout(function () {
                        window.scrollTo(window.scrollX, window.scrollY + 1);
                        if (!jQuery('body').hasClass('elementor-editor-active')) {
                            window.scrollTo(window.scrollX, 0)
                        }
                    }, 1000)
                }
                if (typeof widgetExt.grandconference_ext_is_parallax_mouse != 'undefined' && widgetExt.grandconference_ext_is_parallax_mouse == 'true') {
                    var elementID = $scope.attr('data-id');
                    $scope.find('.elementor-widget-container').attr('data-depth', parseFloat(widgetExt.grandconference_ext_is_parallax_mouse_depth.size));
                    $scope.attr('ID', 'parallax-' + elementID);
                    var parentElement = document.getElementById('parallax-' + elementID);
                    var parallax = new Parallax(parentElement, {
                        relativeInput: !0
                    });
                    if (elementorFrontend.isEditMode()) {
                        if ($scope.width() == 0) {
                            $scope.css('width', '100%')
                        }
                        if ($scope.height() == 0) {
                            $scope.css('height', '100%')
                        }
                    }
                }
                if (typeof widgetExt.grandconference_ext_is_infinite != 'undefined' && widgetExt.grandconference_ext_is_infinite == 'true') {
                    var animationClass = '';
                    var keyframeName = '';
                    var animationCSS = '';
                    if (typeof widgetExt.grandconference_ext_infinite_animation != 'undefined') {
                        animationClass = widgetExt.grandconference_ext_infinite_animation;
                        switch (animationClass) {
                            case 'if_swing1':
                                keyframeName = 'swing';
                                break;
                            case 'if_swing2':
                                keyframeName = 'swing2';
                                break;
                            case 'if_wave':
                                keyframeName = 'wave';
                                break;
                            case 'if_tilt':
                                keyframeName = 'tilt';
                                break;
                            case 'if_bounce':
                                keyframeName = 'bounce';
                                break;
                            case 'if_scale':
                                keyframeName = 'scale';
                                break;
                            case 'if_spin':
                                keyframeName = 'spin';
                                break
                        }
                        animationCSS += keyframeName + ' '
                    }
                    if (typeof widgetExt.grandconference_ext_infinite_duration != 'undefined') {
                        animationCSS += widgetExt.grandconference_ext_infinite_duration + 's '
                    }
                    animationCSS += 'infinite alternate ';
                    if (typeof widgetExt.grandconference_ext_infinite_easing != 'undefined') {
                        animationCSS += 'cubic-bezier(' + widgetExt.grandconference_ext_infinite_easing + ')'
                    }
                    $scope.css({
                        'animation': animationCSS,
                    });
                    $scope.addClass(animationClass)
                }
                if (typeof widgetExt.grandconference_ext_link_sidemenu != 'undefined' && widgetExt.grandconference_ext_link_sidemenu == 'true') {
                    var overlayEffect = jQuery('#tg_sidemenu_overlay_effect').val();
                    $scope.on('click', function (e) {
                        e.preventDefault();
                        jQuery('body').toggleClass('js_nav');
                        jQuery('body').toggleClass(overlayEffect);
                        jQuery('#close_mobile_menu').addClass('open');
                        if (is_touch_device()) {
                            jQuery('body.js_nav').css('overflow', 'auto')
                        }
                    })
                }
                if (typeof widgetExt.grandconference_ext_mobile_static != 'undefined' && widgetExt.grandconference_ext_mobile_static == 'true') {
                    $scope.addClass('mobile-static')
                }
                if (typeof widgetExt.grandconference_ext_link_fullmenu != 'undefined' && widgetExt.grandconference_ext_link_fullmenu == 'true') {
                    var canvas = document.createElement("canvas");
                    canvas.width = 30;
                    canvas.height = 28;
                    setInterval(() => {
                        var ctx = canvas.getContext("2d");
                        ctx.fillStyle = "#ffffff";
                        ctx.font = '900 28px "Font Awesome 5 Free"';
                        ctx.fillText("\uf00d", 0, 20);
                        var dataURL = canvas.toDataURL("image/png");
                        jQuery(".fullmenu-wrapper").css("cursor", "url(" + dataURL + "), auto")
                    }, 1000);
                    $scope.addClass('fullmenu-button');
                    $scope.on('click', function (e) {
                        e.preventDefault();
                        jQuery('body').toggleClass('fullmenu-active').trigger('classChange');
                        jQuery('.fullmenu-wrapper').toggleClass('fullmenu-wrapper-active')
                    });
                    jQuery('.fullmenu-wrapper').on('click', function (e) {
                        jQuery('body').removeClass('fullmenu-active').trigger('classChange');
                        jQuery('.fullmenu-wrapper').removeClass('fullmenu-wrapper-active')
                    })
                }
                if (typeof widgetExt.grandconference_ext_link_closed_fullmenu != 'undefined' && widgetExt.grandconference_ext_link_closed_fullmenu == 'true') {
                    $scope.on('click', function (e) {
                        e.preventDefault();
                        jQuery('body').removeClass('fullmenu-active').trigger('classChange');
                        jQuery('.fullmenu-wrapper').removeClass('fullmenu-wrapper-active')
                    })
                }
                if (typeof widgetExt.grandconference_ext_is_sticky != 'undefined' && widgetExt.grandconference_ext_is_sticky == 'true') {
                    var stickyElement = $scope.children('.elementor-widget-wrap');
                    var topSpacing = 100;
                    if (typeof widgetExt.grandconference_ext_sticky_top_spacing != 'undefined') {
                        topSpacing = parseInt(widgetExt.grandconference_ext_sticky_top_spacing.size)
                    }
                    stickyElement.stickySidebar({
                        topSpacing: topSpacing
                    });
                    if (jQuery(window).width() < 768 || is_touch_device()) {
                        stickyElement.destroy()
                    }
                }
                if (typeof widgetExt.grandconference_ext_is_background_on_scroll != 'undefined' && widgetExt.grandconference_ext_is_background_on_scroll == 'true') {
                    var bodyBackground = jQuery('body').css('background-color');
                    var position = jQuery(window).scrollTop();
                    jQuery(window).on("scroll touchmove", function () {
                        clearTimeout($.data(this, 'scrollTimer'));
                        $.data(this, 'scrollTimer', setTimeout(function () {
                            jQuery('body').attr('data-scrollend', jQuery(window).scrollTop())
                        }, 250));
                        var scroll = jQuery(window).scrollTop();
                        var position = jQuery('body').attr('data-scrollend');
                        var windowHeight = jQuery(window).height();
                        var windowHeightOffset = parseInt(windowHeight / 2);
                        var elementTop = $scope.position().top - windowHeightOffset;
                        var elementBottom = elementTop + $scope.outerHeight(!0);
                        if (scroll > position) {
                            if (jQuery(document).scrollTop() >= elementTop && jQuery(document).scrollTop() <= elementBottom) {
                                jQuery('#wrapper').css('background-color', widgetExt.grandconference_ext_background_on_scroll_color)
                            }
                            if (jQuery(document).scrollTop() > elementBottom) {
                                jQuery('#wrapper').css('background-color', bodyBackground)
                            }
                        } else {
                            if (jQuery(document).scrollTop() <= elementBottom && jQuery(document).scrollTop() >= elementTop) {
                                clearTimeout($.data(this, 'scrollTimer2'));
                                $.data(this, 'scrollTimer2', setTimeout(function () {
                                    jQuery('#wrapper').css('background-color', widgetExt.grandconference_ext_background_on_scroll_color).stop()
                                }, 250))
                            }
                            if (jQuery(document).scrollTop() < $scope.position().top) {
                                jQuery('#wrapper').css('background-color', bodyBackground)
                            }
                        }
                    })
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-blog-posts.default', function ($scope) {
            jQuery(function ($) {
                jQuery("img.lazy").each(function () {
                    var currentImg = jQuery(this);
                    jQuery(this).Lazy({
                        onFinishedAll: function () {
                            currentImg.parent("div.post-featured-image-hover").removeClass("lazy")
                        },
                    })
                });
                jQuery(".layout-masonry").each(function () {
                    var grid = jQuery(this);
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".blog-posts-masonry",
                            columnWidth: ".blog-posts-masonry",
                            gutter: 45
                        });
                        jQuery(".layout-masonry .blog-posts-masonry").each(function (index) {
                            setTimeout(function () {
                                jQuery(".layout-masonry .blog-posts-masonry").eq(index).addClass("is-showing")
                            }, 250 * index)
                        })
                    });
                    jQuery(".layout-masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".blog-posts-masonry",
                                    columnWidth: ".blog-posts-masonry",
                                    gutter: 45
                                })
                            },
                        })
                    })
                });
                jQuery(".layout-metro_masonry").each(function () {
                    var grid = jQuery(this);
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".blog-posts-metro",
                            columnWidth: ".blog-posts-metro",
                            gutter: 40
                        });
                        jQuery(".layout-metro_masonry .blog-posts-metro").each(function (index) {
                            setTimeout(function () {
                                jQuery(".layout-metro_masonry .blog-posts-metro").eq(index).addClass("is-showing")
                            }, 100 * index)
                        })
                    });
                    jQuery(".post-metro-left-wrapper img.lazy_masonry, .layout-metro_masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".blog-posts-metro",
                                    columnWidth: ".blog-posts-metro",
                                    gutter: 40
                                })
                            },
                        })
                    })
                });
                var menuLayout = jQuery('#pp_menu_layout').val();
                if (menuLayout != 'leftmenu') {
                    var metroSticky = jQuery(".post-metro-left-wrapper").stickySidebar({
                        topSpacing: 120
                    })
                } else {
                    var metroSticky = jQuery(".post-metro-left-wrapper").stickySidebar({
                        topSpacing: 40
                    })
                }
                if (jQuery(window).width() <= 768 || isTouchDevice()) {}
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-grid.default', function ($scope) {
            jQuery("img.lazy").each(function () {
                var currentImg = jQuery(this);
                jQuery(this).Lazy({
                    onFinishedAll: function () {
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        currentImg.parent('.grandconference_gallery_lightbox').parent("div.gallery-grid-item").removeClass("lazy");
                        currentImg.parent("div.gallery-grid-item").removeClass("lazy")
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-masonry.default', function ($scope) {
            jQuery(function ($) {
                jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry:not(.proofing-gallery)").each(function () {
                    var grid = jQuery(this);
                    var cols = grid.attr('data-cols');
                    if (!grid.hasClass('has-no-space')) {
                        var gutter = 30;
                        if (cols > 4) {
                            gutter = 20
                        }
                    } else {
                        gutter = 0
                    }
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".gallery-grid-item",
                            columnWidth: ".gallery-grid-item",
                            gutter: gutter
                        });
                        jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry .gallery-grid-item").each(function (index) {
                            setTimeout(function () {
                                jQuery(".do-masonry .gallery-grid-item").eq(index).addClass("is-showing")
                            }, 100 * index)
                        })
                    });
                    jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        var cols = grid.attr('data-cols');
                        if (!grid.hasClass('has-no-space')) {
                            var gutter = 40;
                            if (cols > 4) {
                                gutter = 30
                            }
                        } else {
                            gutter = 0
                        }
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".gallery-grid-item",
                                    columnWidth: ".gallery-grid-item",
                                    gutter: gutter
                                })
                            },
                        })
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-proofing.default', function ($scope) {
            jQuery(function ($) {
                jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry.proofing-gallery").each(function () {
                    var grid = jQuery(this);
                    var cols = grid.attr('data-cols');
                    if (!grid.hasClass('has-no-space')) {
                        var gutter = 30;
                        if (cols > 4) {
                            gutter = 20
                        }
                    } else {
                        gutter = 0
                    }
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".gallery-grid-item",
                            columnWidth: ".gallery-grid-item",
                            gutter: gutter
                        });
                        jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry .gallery-grid-item").each(function (index) {
                            setTimeout(function () {
                                jQuery(".do-masonry .gallery-grid-item").eq(index).addClass("is-showing")
                            }, 100 * index)
                        })
                    });
                    jQuery(".grandconference-gallery-grid-content-wrapper.do-masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        var cols = grid.attr('data-cols');
                        if (!grid.hasClass('has-no-space')) {
                            var gutter = 40;
                            if (cols > 4) {
                                gutter = 30
                            }
                        } else {
                            gutter = 0
                        }
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".gallery-grid-item",
                                    columnWidth: ".gallery-grid-item",
                                    gutter: gutter
                                })
                            },
                        })
                    });
                    jQuery(document).ajaxStart(function () {
                        jQuery('#gallery_proofing_status').val(1)
                    });
                    jQuery(document).ajaxStop(function () {
                        jQuery('#gallery_proofing_status').val(0)
                    });
                    var galleryID = grid.attr('data-gallery-id');
                    var WPonce = jQuery('#themegoods_security_' + galleryID).val();
                    var containderDiv = jQuery('#gallery-proofing-container-' + galleryID);
                    var selectedClass = "";
                    containderDiv.find(".filter-tag-btn").on('click', function () {
                        containderDiv.find(".filter-tag-btn").removeClass("active");
                        jQuery(this).addClass("active");
                        selectedClass = jQuery(this).attr("data-rel");
                        grid.fadeTo(100, 0);
                        grid.find(".gallery-grid-item").css({
                            opacity: 0,
                            display: 'none',
                            transform: 'scale(0.0)'
                        });
                        grid.find(".gallery-grid-item").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                        setTimeout(function () {
                            jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                            jQuery("." + selectedClass).css({
                                opacity: 1,
                                display: 'block',
                                transform: 'scale(1,1)'
                            });
                            grid.masonry('destroy');
                            var $grid = grid.masonry({
                                itemSelector: ".gallery-grid-item.scale-anm",
                                columnWidth: ".gallery-grid-item.scale-anm",
                                gutter: gutter
                            });
                            $grid.masonry('reloadItems');
                            setTimeout(function () {
                                grid.fadeTo(300, 1)
                            }, 500)
                        }, 300)
                    });
                    grid.find('.gallery-grid-approve').on('click', function () {
                        var imgID = jQuery(this).attr('data-image-id');
                        var mark = jQuery(this);
                        var markParent = mark.parent('.gallery-grid-actions').parent('.gallery-grid-item');
                        mark.addClass('disabled');
                        if (jQuery('#gallery_proofing_status').val() == 0) {
                            jQuery.ajax({
                                url: tgAjax.ajaxurl,
                                type: 'POST',
                                data: 'action=grandconference_image_proofing&method=approve&gallery_id=' + galleryID + '&image_id=' + imgID + '&themegoods_security=' + WPonce,
                                error: function (xhr, ajaxOptions, thrownError) {
                                    console.log(thrownError)
                                },
                                success: function (results) {
                                    mark.addClass('hidden');
                                    mark.removeClass('disabled');
                                    markParent.addClass('approve');
                                    markParent.removeClass('unapprove');
                                    jQuery('#unapprove_' + imgID).removeClass('hidden')
                                }
                            })
                        }
                    });
                    grid.find('.gallery-grid-unapprove').on('click', function () {
                        var imgID = jQuery(this).attr('data-image-id');
                        var mark = jQuery(this);
                        var markParent = mark.parent('.gallery-grid-actions').parent('.gallery-grid-item');
                        mark.addClass('disabled');
                        if (jQuery('#gallery_proofing_status').val() == 0) {
                            jQuery.ajax({
                                url: tgAjax.ajaxurl,
                                type: 'POST',
                                data: 'action=grandconference_image_proofing&method=unapprove&gallery_id=' + galleryID + '&image_id=' + imgID + '&themegoods_security=' + WPonce,
                                error: function (xhr, ajaxOptions, thrownError) {
                                    console.log(thrownError)
                                },
                                success: function (results) {
                                    mark.addClass('hidden');
                                    mark.removeClass('disabled');
                                    markParent.addClass('unapprove');
                                    markParent.removeClass('approve');
                                    jQuery('#approve_' + imgID).removeClass('hidden')
                                }
                            })
                        }
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-justified.default', function ($scope) {
            jQuery(function ($) {
                jQuery("img.lazy").each(function () {
                    var currentImg = jQuery(this);
                    jQuery(this).Lazy({
                        onFinishedAll: function () {
                            currentImg.parent("div.post-featured-image-hover").removeClass("lazy")
                        }
                    })
                });
                jQuery(".grandconference-gallery-grid-content-wrapper.do-justified").each(function () {
                    var grid = jQuery(this);
                    var rowHeight = grid.attr('data-row_height');
                    var margin = grid.attr('data-margin');
                    var justifyLastRow = grid.attr('data-justify_last_row');
                    var justifyLastRowStr = 'nojustify';
                    if (justifyLastRow == 'yes') {
                        justifyLastRowStr = 'justify'
                    }
                    grid.imagesLoaded(function () {
                        grid.justifiedGallery({
                            rowHeight: rowHeight,
                            margins: margin,
                            lastRow: justifyLastRowStr
                        })
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-fullscreen.default', function ($scope) {
            jQuery(function ($) {
                var slideshow = jQuery('.fullscreen-gallery');
                var autoPlay = slideshow.attr('data-autoplay');
                var autoPlayArr = !1;
                if (typeof autoPlay != "undefined") {
                    autoPlayArr = {
                        delay: autoPlay
                    }
                }
                var effect = slideshow.attr('data-effect');
                if (typeof effect == "undefined") {
                    effect = 'slide'
                }
                var speed = slideshow.attr('data-speed');
                if (typeof speed == "undefined") {
                    speed = 400
                }
                var galleryTop = new Swiper('.fullscreen-gallery', {
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    spaceBetween: 0,
                    keyboardControl: !0,
                    speed: parseInt(speed),
                    loop: !0,
                    effect: effect,
                    grabCursor: !0,
                    preloadImages: !1,
                    lazy: {
                        loadPrevNext: !0,
                    },
                    autoplay: autoPlayArr
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-vertical-parallax.default', function ($scope) {
            jQuery(function ($) {
                jQuery('body').addClass('elementor-fullscreen');
                var ticking = !1;
                var isFirefox = /Firefox/i.test(navigator.userAgent);
                var isIe = /MSIE/i.test(navigator.userAgent) || /Trident.*rv\:11\./i.test(navigator.userAgent);
                var scrollSensitivitySetting = 30;
                var slideDurationSetting = 800;
                var currentSlideNumber = 0;
                var totalSlideNumber = jQuery('.parallax-slide-background').length;

                function parallaxScroll(evt) {
                    if (isFirefox) {
                        delta = evt.detail * -120
                    } else if (isIe) {
                        delta = -evt.deltaY
                    } else {
                        delta = evt.wheelDelta
                    }
                    if (ticking != !0) {
                        if (delta <= -scrollSensitivitySetting) {
                            ticking = !0;
                            if (currentSlideNumber !== totalSlideNumber - 1) {
                                currentSlideNumber++;
                                nextItem()
                            }
                            slideDurationTimeout(slideDurationSetting)
                        }
                        if (delta >= scrollSensitivitySetting) {
                            ticking = !0;
                            if (currentSlideNumber !== 0) {
                                currentSlideNumber--
                            }
                            previousItem();
                            slideDurationTimeout(slideDurationSetting)
                        }
                    }
                }

                function slideDurationTimeout(slideDuration) {
                    setTimeout(function () {
                        ticking = !1
                    }, slideDuration)
                }
                var mousewheelEvent = isFirefox ? 'DOMMouseScroll' : 'wheel';
                window.addEventListener(mousewheelEvent, parallaxScroll, !1);

                function nextItem() {
                    var $previousSlide = jQuery('.parallax-slide-background').eq(currentSlideNumber - 1);
                    $previousSlide.css('transform', 'translate3d(0,-130vh,0)').find('.parallax-slide-content-wrapper').css('transform', 'translateY(40vh)');
                    currentSlideTransition()
                }

                function previousItem() {
                    var $previousSlide = jQuery('.parallax-slide-background').eq(currentSlideNumber + 1);
                    $previousSlide.css('transform', 'translate3d(0,30vh,0)').find('.parallax-slide-content-wrapper').css('transform', 'translateY(30vh)');
                    currentSlideTransition()
                }

                function currentSlideTransition() {
                    var $currentSlide = jQuery('.parallax-slide-background').eq(currentSlideNumber);
                    $currentSlide.css('transform', 'translate3d(0,-15vh,0)').find('.parallax-slide-content-wrapper').css('transform', 'translateY(15vh)')
                }
                jQuery('body').on('touchmove', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return !1
                });
                var ts;
                jQuery(document).bind('touchstart', function (e) {
                    ts = e.originalEvent.touches[0].clientY
                });
                jQuery(document).bind('touchend', function (e) {
                    var te = e.originalEvent.changedTouches[0].clientY;
                    if (ts > te + 5) {
                        if (currentSlideNumber !== totalSlideNumber - 1) {
                            currentSlideNumber++;
                            nextItem()
                        }
                        slideDurationTimeout(slideDurationSetting)
                    } else if (ts < te - 5) {
                        if (currentSlideNumber !== 0) {
                            currentSlideNumber--
                        }
                        previousItem();
                        slideDurationTimeout(slideDurationSetting)
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-horizontal.default', function ($scope) {
            jQuery('body').addClass('gallery-horizontal');
            jQuery(".horizontal-gallery-wrapper").each(function () {
                var $carousel = jQuery(this);
                var timer = $carousel.attr('data-autoplay');
                if (timer == 0) {
                    timer = !1
                }
                var loop = $carousel.attr('data-loop');
                var navigation = $carousel.attr('data-navigation');
                if (navigation == 0) {
                    navigation = !1
                }
                var pagination = $carousel.attr('data-pagination');
                if (pagination == 0) {
                    pagination = !1
                }
                $carousel.flickity({
                    cellSelector: '.horizontal-gallery-cell',
                    percentPosition: !1,
                    imagesLoaded: !0,
                    selectedAttraction: 0.01,
                    friction: 0.2,
                    lazyLoad: 5,
                    pauseAutoPlayOnHover: !0,
                    autoPlay: parseInt(timer),
                    contain: !0,
                    prevNextButtons: navigation,
                    pageDots: pagination
                });
                var parallax = $carousel.attr('data-parallax');
                if (parallax == 1) {
                    var $imgs = $carousel.find('.horizontal-gallery-cell img');
                    var docStyle = document.documentElement.style;
                    var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
                    var flkty = $carousel.data('flickity');
                    $carousel.on('scroll.flickity', function () {
                        flkty.slides.forEach(function (slide, i) {
                            var img = $imgs[i];
                            var x = (slide.target + flkty.x) * -1 / 3;
                            img.style[transformProp] = 'translateX(' + x + 'px)'
                        })
                    })
                }
                var fullscreen = $carousel.attr('data-fullscreen');
                if (fullscreen != 0) {
                    jQuery('body').addClass('elementor-fullscreen');
                    var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                    var documentHeight = jQuery(window).innerHeight();
                    var sliderHeight = parseInt(documentHeight - menuHeight);
                    $carousel.find('.horizontal-gallery-cell').css('height', sliderHeight + 'px');
                    $carousel.find('.horizontal-gallery-cell-img').css('height', sliderHeight + 'px');
                    $carousel.flickity('resize');
                    jQuery(window).resize(function () {
                        var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                        var documentHeight = jQuery(window).innerHeight();
                        var sliderHeight = parseInt(documentHeight - menuHeight);
                        $carousel.find('.horizontal-gallery-cell').css('height', sliderHeight + 'px');
                        $carousel.find('.horizontal-gallery-cell-img').css('height', sliderHeight + 'px');
                        $carousel.flickity('resize')
                    })
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-horizontal.default', function ($scope) {
            jQuery(".horizontal-slider-wrapper").each(function () {
                var $carousel = jQuery(this);
                var timer = $carousel.attr('data-autoplay');
                if (timer == 0) {
                    timer = !1
                }
                var loop = $carousel.attr('data-loop');
                var navigation = $carousel.attr('data-navigation');
                if (navigation == 0) {
                    navigation = !1
                }
                var pagination = $carousel.attr('data-pagination');
                if (pagination == 0) {
                    pagination = !1
                }
                var horizonSlider = $carousel.flickity({
                    percentPosition: !1,
                    imagesLoaded: !0,
                    pauseAutoPlayOnHover: !0,
                    autoPlay: parseInt(timer),
                    contain: !0,
                    prevNextButtons: navigation,
                    pageDots: pagination
                });
                var fullscreen = $carousel.attr('data-fullscreen');
                if (fullscreen != 0) {
                    jQuery('body').addClass('elementor-fullscreen');
                    var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                    var documentHeight = jQuery(window).innerHeight();
                    var sliderHeight = parseInt(documentHeight - menuHeight);
                    $carousel.find('.horizontal-slider-cell').css('height', sliderHeight + 'px');
                    $carousel.flickity('resize');
                    jQuery(window).resize(function () {
                        var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                        var documentHeight = jQuery(window).innerHeight();
                        var sliderHeight = parseInt(documentHeight - menuHeight);
                        $carousel.find('.horizontal-slider-cell').css('height', sliderHeight + 'px');
                        $carousel.flickity('resize')
                    })
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-animated-frame.default', function ($scope) {
            function debounce(func, wait, immediate) {
                var timeout;
                return function () {
                    var context = this,
                        args = arguments;
                    var later = function () {
                        timeout = null;
                        if (!immediate) func.apply(context, args)
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args)
                }
            };
            class Slideshow {
                constructor(el) {
                    this.DOM = {};
                    this.DOM.el = el;
                    this.settings = {
                        animation: {
                            slides: {
                                duration: 600,
                                easing: 'easeOutQuint'
                            },
                            shape: {
                                duration: 300,
                                easing: {
                                    in: 'easeOutQuint',
                                    out: 'easeOutQuad'
                                }
                            }
                        },
                        frameFill: slideshowFrameColor
                    }
                    this.init()
                }
                init() {
                    if (this.DOM.el) {
                        this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide'));
                        this.slidesTotal = this.DOM.slides.length;
                        this.DOM.nav = this.DOM.el.querySelector('.slidenav');
                        this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav-item--next');
                        this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav-item--prev');
                        this.current = 0;
                        this.createFrame();
                        this.initEvents()
                    }
                }
                createFrame() {
                    this.rect = this.DOM.el.getBoundingClientRect();
                    this.frameSize = this.rect.width / 12;
                    this.paths = {
                        initial: this.calculatePath('initial'),
                        final: this.calculatePath('final')
                    };
                    this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    this.DOM.svg.setAttribute('class', 'shape');
                    this.DOM.svg.setAttribute('width', '100%');
                    this.DOM.svg.setAttribute('height', '100%');
                    this.DOM.svg.setAttribute('viewbox', `0 0 ${this.rect.width} ${this.rect.height}`);
                    this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
                    this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
                    this.DOM.shape = this.DOM.svg.querySelector('path')
                }
                updateFrame() {
                    this.paths.initial = this.calculatePath('initial');
                    this.paths.final = this.calculatePath('final');
                    this.DOM.svg.setAttribute('viewbox', `0 0 ${this.rect.width} ${this.rect.height}`);
                    this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial)
                }
                calculatePath(path = 'initial') {
                    return path === 'initial' ? `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` : `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`
                }
                initEvents() {
                    this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
                    this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
                    window.addEventListener('resize', debounce(() => {
                        this.rect = this.DOM.el.getBoundingClientRect();
                        this.updateFrame()
                    }, 20));
                    document.addEventListener('keydown', (ev) => {
                        const keyCode = ev.keyCode || ev.which;
                        if (keyCode === 37) {
                            this.navigate('prev')
                        } else if (keyCode === 39) {
                            this.navigate('next')
                        }
                    })
                }
                navigate(dir = 'next') {
                    if (this.isAnimating) return !1;
                    this.isAnimating = !0;
                    const animateShapeIn = anime({
                        targets: this.DOM.shape,
                        duration: this.settings.animation.shape.duration,
                        easing: this.settings.animation.shape.easing.in,
                        d: this.paths.final
                    });
                    const animateSlides = () => {
                        return new Promise((resolve, reject) => {
                            const currentSlide = this.DOM.slides[this.current];
                            anime({
                                targets: currentSlide,
                                duration: this.settings.animation.slides.duration,
                                easing: this.settings.animation.slides.easing,
                                translateX: dir === 'next' ? -1 * this.rect.width : this.rect.width,
                                complete: () => {
                                    currentSlide.classList.remove('slide-current');
                                    resolve()
                                }
                            });
                            this.current = dir === 'next' ? this.current < this.slidesTotal - 1 ? this.current + 1 : 0 : this.current > 0 ? this.current - 1 : this.slidesTotal - 1;
                            const newSlide = this.DOM.slides[this.current];
                            newSlide.classList.add('slide-current');
                            anime({
                                targets: newSlide,
                                duration: this.settings.animation.slides.duration,
                                easing: this.settings.animation.slides.easing,
                                translateX: [dir === 'next' ? this.rect.width : -1 * this.rect.width, 0]
                            });
                            const newSlideImg = newSlide.querySelector('.slide-img');
                            anime.remove(newSlideImg);
                            anime({
                                targets: newSlideImg,
                                duration: this.settings.animation.slides.duration * 4,
                                easing: this.settings.animation.slides.easing,
                                translateX: [dir === 'next' ? 200 : -200, 0]
                            });
                            anime({
                                targets: [newSlide.querySelector('.slide-title'), newSlide.querySelector('.slide-desc'), newSlide.querySelector('.slide-link')],
                                duration: this.settings.animation.slides.duration * 2,
                                easing: this.settings.animation.slides.easing,
                                delay: (t, i) => i * 100 + 100,
                                translateX: [dir === 'next' ? 300 : -300, 0],
                                opacity: [0, 1]
                            })
                        })
                    };
                    const animateShapeOut = () => {
                        anime({
                            targets: this.DOM.shape,
                            duration: this.settings.animation.shape.duration,
                            delay: 150,
                            easing: this.settings.animation.shape.easing.out,
                            d: this.paths.initial,
                            complete: () => this.isAnimating = !1
                        })
                    }
                    animateShapeIn.finished.then(animateSlides).then(animateShapeOut)
                }
            };
            var slideshow = document.querySelector('.slideshow');
            if (slideshow) {
                var slideshowFrameColor = slideshow.getAttribute('data-background');
                new Slideshow(slideshow);
                imagesLoaded('.slide-img', {
                    background: !0
                })
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-room.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');
            jQuery('body').addClass('room');

            function debounce(func, wait, immediate) {
                var timeout;
                return function () {
                    var context = this,
                        args = arguments;
                    var later = function () {
                        timeout = null;
                        if (!immediate) func.apply(context, args)
                    };
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) func.apply(context, args)
                }
            };

            function getMousePos(e) {
                var posx = 0;
                var posy = 0;
                if (!e) var e = window.event;
                if (e.pageX || e.pageY) {
                    posx = e.pageX;
                    posy = e.pageY
                } else if (e.clientX || e.clientY) {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
                }
                return {
                    x: posx,
                    y: posy
                }
            }
            var DOM = {};
            DOM.loader = document.querySelector('.room-slider-wrapper .overlay--loader');
            DOM.scroller = document.querySelector('.room-slider-wrapper .container > .scroller');
            if (DOM.scroller) {
                DOM.rooms = [].slice.call(DOM.scroller.querySelectorAll('.room'))
            } else {
                DOM.rooms = {}
            }
            DOM.content = document.querySelector('.room-slider-wrapper .content');
            if (DOM.content) {
                DOM.nav = {
                    leftCtrl: DOM.content.querySelector('.room-slider-wrapper nav > .btn--nav-left'),
                    rightCtrl: DOM.content.querySelector('.room-slider-wrapper nav > .btn--nav-right')
                };
                DOM.slides = [].slice.call(DOM.content.querySelectorAll('.slides > .slide'))
            }
            var currentRoom = 0,
                totalRooms = DOM.rooms.length,
                initTransform = {
                    translateX: 0,
                    translateY: 0,
                    translateZ: '500px',
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0
                },
                resetTransform = {
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0
                },
                menuTransform = {
                    translateX: 0,
                    translateY: '150%',
                    translateZ: 0,
                    rotateX: '15deg',
                    rotateY: 0,
                    rotateZ: 0
                },
                menuTransform = {
                    translateX: 0,
                    translateY: '50%',
                    translateZ: 0,
                    rotateX: '-10deg',
                    rotateY: 0,
                    rotateZ: 0
                },
                infoTransform = {
                    translateX: 0,
                    translateY: 0,
                    translateZ: '200px',
                    rotateX: '2deg',
                    rotateY: 0,
                    rotateZ: '4deg'
                },
                initTransition = {
                    speed: '0.9s',
                    easing: 'ease'
                },
                roomTransition = {
                    speed: '0.4s',
                    easing: 'ease'
                },
                menuTransition = {
                    speed: '1.5s',
                    easing: 'cubic-bezier(0.2,1,0.3,1)'
                },
                infoTransition = {
                    speed: '15s',
                    easing: 'cubic-bezier(0.3,1,0.3,1)'
                },
                tiltTransition = {
                    speed: '0.2s',
                    easing: 'ease-out'
                },
                tilt = !1,
                tiltRotation = {
                    rotateX: 1,
                    rotateY: -3
                },
                onEndTransition = function (el, callback) {
                    var onEndCallbackFn = function (ev) {
                        this.removeEventListener('transitionend', onEndCallbackFn);
                        if (callback && typeof callback === 'function') {
                            callback.call()
                        }
                    };
                    el.addEventListener('transitionend', onEndCallbackFn)
                },
                win = {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                isMoving, isNavigating;

            function init() {
                move({
                    transition: initTransition,
                    transform: initTransform
                }).then(function () {
                    initTilt()
                });
                showSlide(100);
                initEvents()
            }

            function initTilt() {
                applyRoomTransition(tiltTransition);
                tilt = !0
            }

            function removeTilt() {
                tilt = !1
            }

            function move(opts) {
                return new Promise(function (resolve, reject) {
                    if (isMoving && !opts.stopTransition) {
                        return !1
                    }
                    isMoving = !0;
                    if (opts.transition) {
                        applyRoomTransition(opts.transition)
                    }
                    if (opts.transform) {
                        applyRoomTransform(opts.transform);
                        var onEndFn = function () {
                            isMoving = !1;
                            resolve()
                        };
                        onEndTransition(DOM.scroller, onEndFn)
                    } else {
                        resolve()
                    }
                })
            }

            function initEvents() {
                var onMouseMoveFn = function (ev) {
                        requestAnimationFrame(function () {
                            if (!tilt) return !1;
                            var mousepos = getMousePos(ev),
                                rotX = tiltRotation.rotateX ? initTransform.rotateX - (2 * tiltRotation.rotateX / win.height * mousepos.y - tiltRotation.rotateX) : 0,
                                rotY = tiltRotation.rotateY ? initTransform.rotateY - (2 * tiltRotation.rotateY / win.width * mousepos.x - tiltRotation.rotateY) : 0;
                            applyRoomTransform({
                                'translateX': initTransform.translateX,
                                'translateY': initTransform.translateY,
                                'translateZ': initTransform.translateZ,
                                'rotateX': rotX + 'deg',
                                'rotateY': rotY + 'deg',
                                'rotateZ': initTransform.rotateZ
                            })
                        })
                    },
                    debounceResizeFn = debounce(function () {
                        win = {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    }, 10);
                document.addEventListener('mousemove', onMouseMoveFn);
                window.addEventListener('resize', debounceResizeFn);
                var onNavigatePrevFn = function () {
                        navigate('prev')
                    },
                    onNavigateNextFn = function () {
                        navigate('next')
                    };
                if (DOM.nav.leftCtrl && DOM.nav.rightCtrl) {
                    DOM.nav.leftCtrl.addEventListener('click', onNavigatePrevFn);
                    DOM.nav.rightCtrl.addEventListener('click', onNavigateNextFn)
                }
            }

            function applyRoomTransform(transform) {
                DOM.scroller.style.transform = 'translate3d(' + transform.translateX + ', ' + transform.translateY + ', ' + transform.translateZ + ') ' + 'rotate3d(1,0,0,' + transform.rotateX + ') rotate3d(0,1,0,' + transform.rotateY + ') rotate3d(0,0,1,' + transform.rotateZ + ')'
            }

            function applyRoomTransition(transition) {
                DOM.scroller.style.transition = transition === 'none' ? transition : 'transform ' + transition.speed + ' ' + transition.easing
            }

            function toggleSlide(dir, delay) {
                var slide = DOM.slides[currentRoom],
                    name = slide.querySelector('.slide-name'),
                    title = slide.querySelector('.slide-title'),
                    date = slide.querySelector('.slide-date');
                delay = delay !== undefined ? delay : 0;
                anime.remove([name, title, date]);
                var animeOpts = {
                    targets: [name, title, date],
                    duration: dir === 'in' ? 400 : 400,
                    delay: function (t, i, c) {
                        return delay + 75 + i * 75
                    },
                    easing: [0.25, 0.1, 0.25, 1],
                    opacity: {
                        value: dir === 'in' ? [0, 1] : [1, 0],
                        duration: dir === 'in' ? 550 : 250
                    },
                    translateY: function (t, i) {
                        return dir === 'in' ? [150, 0] : [0, -150]
                    }
                };
                if (dir === 'in') {
                    animeOpts.begin = function () {
                        slide.classList.add('slide-current')
                    }
                } else {
                    animeOpts.complete = function () {
                        slide.classList.remove('slide-current')
                    }
                }
                anime(animeOpts)
            }

            function showSlide(delay) {
                toggleSlide('in', delay)
            }

            function hideSlide(delay) {
                toggleSlide('out', delay)
            }

            function navigate(dir) {
                if (isMoving || isNavigating) {
                    return !1
                }
                isNavigating = !0;
                var room = DOM.rooms[currentRoom];
                removeTilt();
                hideSlide();
                if (dir === 'next') {
                    currentRoom = currentRoom < totalRooms - 1 ? currentRoom + 1 : 0
                } else {
                    currentRoom = currentRoom > 0 ? currentRoom - 1 : totalRooms - 1
                }
                var nextRoom = DOM.rooms[currentRoom];
                nextRoom.style.transform = 'translate3d(' + (dir === 'next' ? 100 : -100) + '%,0,0) translate3d(' + (dir === 'next' ? 1 : -1) + 'px,0,0)';
                nextRoom.style.opacity = 1;
                move({
                    transition: roomTransition,
                    transform: resetTransform
                }).then(function () {
                    return move({
                        transform: {
                            translateX: (dir === 'next' ? -100 : 100) + '%',
                            translateY: 0,
                            translateZ: 0,
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0
                        }
                    })
                }).then(function () {
                    nextRoom.classList.add('room--current');
                    room.classList.remove('room--current');
                    room.style.opacity = 0;
                    showSlide();
                    return move({
                        transform: {
                            translateX: (dir === 'next' ? -100 : 100) + '%',
                            translateY: 0,
                            translateZ: '500px',
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0
                        }
                    })
                }).then(function () {
                    applyRoomTransition('none');
                    nextRoom.style.transform = 'translate3d(0,0,0)';
                    applyRoomTransform(initTransform);
                    setTimeout(function () {
                        initTilt()
                    }, 60);
                    isNavigating = !1
                })
            }

            function addAdjacentRooms() {
                var room = DOM.rooms[currentRoom],
                    nextRoom = DOM.rooms[currentRoom < totalRooms - 1 ? currentRoom + 1 : 0],
                    prevRoom = DOM.rooms[currentRoom > 0 ? currentRoom - 1 : totalRooms - 1];
                nextRoom.style.transform = 'translate3d(100%,0,0) translate3d(3px,0,0)';
                nextRoom.style.opacity = 1;
                prevRoom.style.transform = 'translate3d(-100%,0,0) translate3d(-3px,0,0)';
                prevRoom.style.opacity = 1
            }

            function removeAdjacentRooms() {
                var room = DOM.rooms[currentRoom],
                    nextRoom = DOM.rooms[currentRoom < totalRooms - 1 ? currentRoom + 1 : 0],
                    prevRoom = DOM.rooms[currentRoom > 0 ? currentRoom - 1 : totalRooms - 1];
                nextRoom.style.transform = 'none';
                nextRoom.style.opacity = 0;
                prevRoom.style.transform = 'none';
                prevRoom.style.opacity = 0
            }
            if (DOM.scroller) {
                imagesLoaded(DOM.scroller, function () {
                    var extradelay = 1000;
                    anime({
                        targets: DOM.loader,
                        duration: 600,
                        easing: 'easeInOutCubic',
                        delay: extradelay,
                        translateY: '-100%',
                        begin: function () {
                            init()
                        },
                        complete: function () {
                            DOM.loader.classList.remove('overlay--active')
                        }
                    })
                })
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-multi-layouts.default', function ($scope) {
            document.documentElement.className = 'js';
            var slideshow = new MLSlideshow(document.querySelector('.slideshow'));
            if (document.querySelector('#next-slide')) {
                document.querySelector('#next-slide').addEventListener('click', function () {
                    slideshow.next()
                })
            }
            if (document.querySelector('#prev-slide')) {
                document.querySelector('#prev-slide').addEventListener('click', function () {
                    slideshow.prev()
                })
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-velo.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');
            var scaleDownAmnt = 0.7;
            var boxShadowAmnt = '40px';
            $.Velocity.RegisterEffect("translateUp", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '-100%'
                    }, 1]
                ]
            });
            $.Velocity.RegisterEffect("translateDown", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '100%'
                    }, 1]
                ]
            });
            $.Velocity.RegisterEffect("translateNone", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '0',
                        opacity: '1',
                        scale: '1',
                    }, 1]
                ]
            });
            $.Velocity.RegisterEffect("scaleDown", {
                defaultDuration: 1,
                calls: [
                    [{
                        opacity: '0',
                        scale: '0.7',
                    }, 1]
                ]
            });
            $.Velocity.RegisterEffect("scaleDown.moveUp", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '0%',
                        scale: scaleDownAmnt,
                    }, 0.20],
                    [{
                        translateY: '-100%'
                    }, 0.60],
                    [{
                        translateY: '-100%',
                        scale: '1',
                    }, 0.20]
                ]
            });
            $.Velocity.RegisterEffect("scaleDown.moveUp.scroll", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '-100%',
                        scale: scaleDownAmnt,
                    }, 0.60],
                    [{
                        translateY: '-100%',
                        scale: '1',
                    }, 0.40]
                ]
            });
            $.Velocity.RegisterEffect("scaleUp.moveUp", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '90%',
                        scale: scaleDownAmnt,
                    }, 0.20],
                    [{
                        translateY: '0%'
                    }, 0.60],
                    [{
                        translateY: '0%',
                        scale: '1',
                    }, 0.20]
                ]
            });
            $.Velocity.RegisterEffect("scaleUp.moveUp.scroll", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '0%',
                        scale: scaleDownAmnt,
                    }, 0.60],
                    [{
                        translateY: '0%',
                        scale: '1',
                    }, 0.40]
                ]
            });
            $.Velocity.RegisterEffect("scaleDown.moveDown", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '0%',
                        scale: scaleDownAmnt,
                    }, 0.20],
                    [{
                        translateY: '100%'
                    }, 0.60],
                    [{
                        translateY: '100%',
                        scale: '1',
                    }, 0.20]
                ]
            });
            $.Velocity.RegisterEffect("scaleDown.moveDown.scroll", {
                defaultDuration: 1,
                calls: [
                    [{}, 0.60],
                    [{
                        translateY: '100%',
                        scale: '1',
                    }, 0.40]
                ]
            });
            $.Velocity.RegisterEffect("scaleUp.moveDown", {
                defaultDuration: 1,
                calls: [
                    [{
                        translateY: '-90%',
                        scale: scaleDownAmnt,
                    }, 0.20],
                    [{
                        translateY: '0%'
                    }, 0.60],
                    [{
                        translateY: '0%',
                        scale: '1',
                    }, 0.20]
                ]
            });
            var VeloSlider = (function () {
                var settings = {
                    veloInit: $('.velo-slides').data('velo-slider'),
                    $veloSlide: $('.velo-slide'),
                    veloSlideBg: '.velo-slide-bg',
                    navPrev: $('.velo-slides-nav').find('a.js-velo-slides-prev'),
                    navNext: $('.velo-slides-nav').find('a.js-velo-slides-next'),
                    veloBtn: $('.velo-slide-btn'),
                    delta: 0,
                    scrollThreshold: 7,
                    currentSlide: 1,
                    animating: !1,
                    animationDuration: 2000
                };
                var delta = 0,
                    animating = !1;
                return {
                    init: function () {
                        this.bind()
                    },
                    bind: function () {
                        settings.$veloSlide.first().addClass('is-active');
                        if (settings.veloInit == 'on') {
                            VeloSlider.initScrollJack();
                            $(window).on('DOMMouseScroll mousewheel', VeloSlider.scrollJacking)
                        }
                        settings.navPrev.on('click', VeloSlider.prevSlide);
                        settings.navNext.on('click', VeloSlider.nextSlide);
                        $(document).on('keydown', function (e) {
                            var keyNext = (e.which == 39 || e.which == 40),
                                keyPrev = (e.which == 37 || e.which == 38);
                            if (keyNext && !settings.navNext.hasClass('inactive')) {
                                e.preventDefault();
                                VeloSlider.nextSlide()
                            } else if (keyPrev && (!settings.navPrev.hasClass('inactive'))) {
                                e.preventDefault();
                                VeloSlider.prevSlide()
                            }
                        });
                        jQuery('body').on('touchmove', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return !1
                        });
                        var ts;
                        jQuery(document).bind('touchstart', function (e) {
                            ts = e.originalEvent.touches[0].clientY
                        });
                        jQuery(document).bind('touchend', function (e) {
                            var te = e.originalEvent.changedTouches[0].clientY;
                            if (ts > te + 5) {
                                VeloSlider.nextSlide()
                            } else if (ts < te - 5) {
                                VeloSlider.prevSlide()
                            }
                        });
                        VeloSlider.checkNavigation();
                        VeloSlider.hoverAnimation()
                    },
                    hoverAnimation: function () {
                        settings.veloBtn.hover(function () {
                            $(this).closest(settings.$veloSlide).toggleClass('is-hovering')
                        })
                    },
                    setAnimation: function (midStep, direction) {
                        var animationVisible = 'translateNone',
                            animationTop = 'translateUp',
                            animationBottom = 'translateDown',
                            easing = 'ease',
                            animDuration = settings.animationDuration;
                        if (midStep) {
                            animationVisible = 'scaleUp.moveUp.scroll';
                            animationTop = 'scaleDown.moveUp.scroll';
                            animationBottom = 'scaleDown.moveDown.scroll'
                        } else {
                            animationVisible = (direction == 'next') ? 'scaleUp.moveUp' : 'scaleUp.moveDown';
                            animationTop = 'scaleDown.moveUp';
                            animationBottom = 'scaleDown.moveDown'
                        }
                        return [animationVisible, animationTop, animationBottom, animDuration, easing]
                    },
                    initScrollJack: function () {
                        var visibleSlide = settings.$veloSlide.filter('.is-active'),
                            topSection = visibleSlide.prevAll(settings.$veloSlide),
                            bottomSection = visibleSlide.nextAll(settings.$veloSlide),
                            animationParams = VeloSlider.setAnimation(!1),
                            animationVisible = animationParams[0],
                            animationTop = animationParams[1],
                            animationBottom = animationParams[2];
                        visibleSlide.children('div').velocity(animationVisible, 1, function () {
                            visibleSlide.css('opacity', 1);
                            topSection.css('opacity', 1);
                            bottomSection.css('opacity', 1)
                        });
                        topSection.children('div').velocity(animationTop, 0);
                        bottomSection.children('div').velocity(animationBottom, 0)
                    },
                    scrollJacking: function (e) {
                        if (!jQuery('body').hasClass('js_nav')) {
                            if (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0) {
                                delta--;
                                (Math.abs(delta) >= settings.scrollThreshold) && VeloSlider.prevSlide()
                            } else {
                                delta++;
                                (delta >= settings.scrollThreshold) && VeloSlider.nextSlide()
                            }
                            return !1
                        }
                    },
                    prevSlide: function (e) {
                        typeof e !== 'undefined' && e.preventDefault();
                        var visibleSlide = settings.$veloSlide.filter('.is-active'),
                            animationParams = VeloSlider.setAnimation(midStep, 'prev'),
                            midStep = !1;
                        visibleSlide = midStep ? visibleSlide.next(settings.$veloSlide) : visibleSlide;
                        if (!animating && !visibleSlide.is(":first-child")) {
                            animating = !0;
                            visibleSlide.removeClass('is-active').children(settings.veloSlideBg).velocity(animationParams[2], animationParams[3], animationParams[4]).end().prev(settings.$veloSlide).addClass('is-active').children(settings.veloSlideBg).velocity(animationParams[0], animationParams[3], animationParams[4], function () {
                                animating = !1
                            });
                            currentSlide = settings.currentSlide - 1
                        }
                        VeloSlider.resetScroll()
                    },
                    nextSlide: function (e) {
                        typeof e !== 'undefined' && e.preventDefault();
                        var visibleSlide = settings.$veloSlide.filter('.is-active'),
                            animationParams = VeloSlider.setAnimation(midStep, 'next'),
                            midStep = !1;
                        if (!animating && !visibleSlide.is(":last-of-type")) {
                            animating = !0;
                            visibleSlide.removeClass('is-active').children(settings.veloSlideBg).velocity(animationParams[1], animationParams[3]).end().next(settings.$veloSlide).addClass('is-active').children(settings.veloSlideBg).velocity(animationParams[0], animationParams[3], function () {
                                animating = !1
                            });
                            currentSlide = settings.currentSlide + 1
                        }
                        VeloSlider.resetScroll()
                    },
                    resetScroll: function () {
                        delta = 0;
                        VeloSlider.checkNavigation()
                    },
                    checkNavigation: function () {
                        (settings.$veloSlide.filter('.is-active').is(':first-of-type')) ? settings.navPrev.addClass('inactive'): settings.navPrev.removeClass('inactive');
                        (settings.$veloSlide.filter('.is-active').is(':last-of-type')) ? settings.navNext.addClass('inactive'): settings.navNext.removeClass('inactive')
                    },
                }
            })();
            VeloSlider.init()
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-popout.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');

            function goToSlide(number) {
                $('.slider-slide').removeClass('slider-slide--active');
                $('.slider-slide[data-slide=' + number + ']').addClass('slider-slide--active')
            }
            $('.slider__next, .go-to-next').on('click', function () {
                var currentSlide = Number($('.slider-slide--active').data('slide'));
                var totalSlides = $('.slider-slide').length;
                currentSlide++
                if (currentSlide > totalSlides) {
                    currentSlide = 1
                }
                goToSlide(currentSlide)
            });
            for (var i = 1; i <= $('.slider-slide').length; i++) {
                $('.slider__indicators').append('<div class="slider__indicator" data-slide="' + i + '"></div>')
            }
            setTimeout(function () {
                $('.slider-wrap').addClass('slider-wrap--hacked')
            }, 1000)
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-clip-path.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');
            (function () {
                var $slides = document.querySelectorAll('.clip-path-slide-container .slide');
                var $controls = document.querySelectorAll('.slider-control');
                var numOfSlides = $slides.length;
                var slidingAT = 1300;
                var slidingBlocked = !1;
                [].slice.call($slides).forEach(function ($el, index) {
                    var i = index + 1;
                    $el.classList.add('slide-' + i);
                    $el.dataset.slide = i
                });
                [].slice.call($controls).forEach(function ($el) {
                    $el.addEventListener('click', controlClickHandler)
                });

                function controlClickHandler() {
                    if (slidingBlocked) return;
                    slidingBlocked = !0;
                    var $control = this;
                    var isRight = $control.classList.contains('m--right');
                    var $curActive = document.querySelector('.slide.s--active');
                    var index = +$curActive.dataset.slide;
                    (isRight) ? index++ : index--;
                    if (index < 1) index = numOfSlides;
                    if (index > numOfSlides) index = 1;
                    var $newActive = document.querySelector('.slide-' + index);
                    $control.classList.add('a--rotation');
                    $curActive.classList.remove('s--active', 's--active-prev');
                    document.querySelector('.slide.s--prev').classList.remove('s--prev');
                    $newActive.classList.add('s--active');
                    if (!isRight) $newActive.classList.add('s--active-prev');
                    var prevIndex = index - 1;
                    if (prevIndex < 1) prevIndex = numOfSlides;
                    document.querySelector('.slide-' + prevIndex).classList.add('s--prev');
                    setTimeout(function () {
                        $control.classList.remove('a--rotation');
                        slidingBlocked = !1
                    }, slidingAT * 0.75)
                }
            }())
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-preview.default', function ($scope) {
            jQuery('body').addClass('grandconference-gallery-preview');
            var $slider = $('.slider');
            var $slickTrack = $('.slick-track');
            var $slickCurrent = $('.slick-current');
            var slideDuration = 900;
            $slider.on('init', function (slick) {
                TweenMax.to($('.slick-track'), 0.9, {
                    marginLeft: 0
                });
                TweenMax.to($('.slick-active'), 0.9, {
                    x: 0,
                    zIndex: 2
                })
            });
            $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                TweenMax.to($('.slick-track'), 0.9, {
                    marginLeft: 0
                });
                TweenMax.to($('.slick-active'), 0.9, {
                    x: 0
                })
            });
            $slider.on('afterChange', function (event, slick, currentSlide) {
                TweenMax.to($('.slick-track'), 0.9, {
                    marginLeft: 0
                });
                $('.slick-slide').css('z-index', '1');
                TweenMax.to($('.slick-active'), 0.9, {
                    x: 0,
                    zIndex: 2
                })
            });
            var $sliderPagination = $('.slider').attr('data-pagination');
            var dotsVar = !1;
            if ($sliderPagination == 'yes') {
                dotsVar = !0
            }
            var $sliderNavigation = $('.slider').attr('data-navigation');
            var arrowsVar = !1;
            if ($sliderNavigation == 'yes') {
                arrowsVar = !0
            }
            var $sliderAutoPlay = $('.slider').attr('data-autoplay');
            var autoPlayVar = !1;
            var autoPlayTimeVar = 0;
            if (typeof $sliderAutoPlay != "undefined") {
                autoPlayVar = !0;
                autoPlayTimeVar = $sliderAutoPlay
            }
            $slider.slick({
                speed: slideDuration,
                touchMove: !0,
                dots: dotsVar,
                arrows: arrowsVar,
                waitForAnimate: !0,
                useTransform: !0,
                autoplay: autoPlayVar,
                autoplaySpeed: autoPlayTimeVar,
                cssEase: 'cubic-bezier(0.455, 0.030, 0.130, 1.000)'
            })
            $('.slick-prev').on('mouseenter', function () {
                TweenMax.to($('.slick-track'), 0.6, {
                    marginLeft: "180px",
                    ease: Quad.easeOut
                });
                TweenMax.to($('.slick-current'), 0.6, {
                    x: -100,
                    ease: Quad.easeOut
                })
            });
            $('.slick-prev').on('mouseleave', function () {
                TweenMax.to($('.slick-track'), 0.4, {
                    marginLeft: 0,
                    ease: Sine.easeInOut
                });
                TweenMax.to($('.slick-current'), 0.4, {
                    x: 0,
                    ease: Sine.easeInOut
                })
            });
            $('.slick-next').on('mouseenter', function () {
                TweenMax.to($('.slick-track'), 0.6, {
                    marginLeft: "-180px",
                    ease: Quad.easeOut
                });
                TweenMax.to($('.slick-current'), 0.6, {
                    x: 100,
                    ease: Quad.easeOut
                })
            });
            $('.slick-next').on('mouseleave', function () {
                TweenMax.to($('.slick-track'), 0.4, {
                    marginLeft: 0,
                    ease: Quad.easeInOut
                });
                TweenMax.to($('.slick-current'), 0.4, {
                    x: 0,
                    ease: Quad.easeInOut
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-split-slick.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');
            var $slider = $('.slideshow .slider'),
                maxItems = $('.item', $slider).length,
                dragging = !1,
                tracking, rightTracking;
            $sliderRight = $('.slideshow').clone().addClass('slideshow-right').appendTo($('.split-slideshow'));
            rightItems = $('.item', $sliderRight).toArray();
            reverseItems = rightItems.reverse();
            $('.slider', $sliderRight).html('');
            for (i = 0; i < maxItems; i++) {
                $(reverseItems[i]).appendTo($('.slider', $sliderRight))
            }
            $slider.addClass('slideshow-left');
            $('.slideshow-left').slick({
                vertical: !0,
                verticalSwiping: !0,
                arrows: !1,
                infinite: !0,
                dots: !0,
                speed: 1000,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)'
            }).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                if (currentSlide > nextSlide && nextSlide == 0 && currentSlide == maxItems - 1) {
                    $('.slideshow-right .slider').slick('slickGoTo', -1);
                    $('.slideshow-text').slick('slickGoTo', maxItems)
                } else if (currentSlide < nextSlide && currentSlide == 0 && nextSlide == maxItems - 1) {
                    $('.slideshow-right .slider').slick('slickGoTo', maxItems);
                    $('.slideshow-text').slick('slickGoTo', -1)
                } else {
                    $('.slideshow-right .slider').slick('slickGoTo', maxItems - 1 - nextSlide);
                    $('.slideshow-text').slick('slickGoTo', nextSlide)
                }
            }).on("mousewheel", function (event) {
                event.preventDefault();
                if (event.deltaX > 0 || event.deltaY < 0) {
                    $(this).slick('slickNext')
                } else if (event.deltaX < 0 || event.deltaY > 0) {
                    $(this).slick('slickPrev')
                }
            }).on('mousedown touchstart', function () {
                dragging = !0;
                tracking = $('.slick-track', $slider).css('transform');
                tracking = parseInt(tracking.split(',')[5]);
                rightTracking = $('.slideshow-right .slick-track').css('transform');
                rightTracking = parseInt(rightTracking.split(',')[5])
            }).on('mousemove touchmove', function () {
                if (dragging) {
                    newTracking = $('.slideshow-left .slick-track').css('transform');
                    newTracking = parseInt(newTracking.split(',')[5]);
                    diffTracking = newTracking - tracking;
                    $('.slideshow-right .slick-track').css({
                        'transform': 'matrix(1, 0, 0, 1, 0, ' + (rightTracking - diffTracking) + ')'
                    })
                }
            }).on('mouseleave touchend mouseup', function () {
                dragging = !1
            });
            $('.slideshow-right .slider').slick({
                swipe: !1,
                vertical: !0,
                arrows: !1,
                infinite: !0,
                speed: 950,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                initialSlide: maxItems - 1
            });
            $('.slideshow-text').slick({
                swipe: !1,
                vertical: !0,
                arrows: !1,
                infinite: !0,
                speed: 900,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)'
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-transitions.default', function ($scope) {
            jQuery('body').addClass('elementor-fullscreen');
            var mySwiper = new Swiper(".swiper-container", {
                direction: "vertical",
                loop: !0,
                pagination: {
                    el: '.swiper-pagination',
                    type: 'bullets',
                    clickable: !0
                },
                keyboard: {
                    enabled: !0,
                    onlyInViewport: !1,
                },
                grabCursor: !0,
                speed: 1000,
                paginationClickable: !0,
                parallax: !0,
                autoplay: !1,
                effect: "slide",
                mousewheel: {
                    invert: !1,
                },
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-property-clip.default', function ($scope) {
            jQuery(".slider-property-clip-wrapper").each(function () {
                var slider = jQuery(this).find(".slider"),
                    slides = slider.find('li'),
                    nav = slider.find('nav');
                slides.eq(0).addClass('current');
                nav.children('a').eq(0).addClass('current-dot');
                nav.on('click', 'a', function (event) {
                    event.preventDefault();
                    $(this).addClass('current-dot').siblings().removeClass('current-dot');
                    slides.eq($(this).index()).addClass('current').removeClass('prev').siblings().removeClass('current');
                    slides.eq($(this).index()).prevAll().addClass('prev');
                    slides.eq($(this).index()).nextAll().removeClass('prev')
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-slice.default', function ($scope) {
            jQuery(".slice-slide-container").each(function () {
                var slide = jQuery(this).children('.slide');
                var navPrev = jQuery('.js-prev');
                var navNext = jQuery('.js-next');
                var SliceSlider = {
                    settings: {
                        delta: 0,
                        currentSlideIndex: 0,
                        scrollThreshold: 40,
                        slides: slide,
                        numSlides: slide.length,
                        navPrev: navPrev,
                        navNext: navNext,
                    },
                    init: function () {
                        s = this.settings;
                        this.bindEvents()
                    },
                    bindEvents: function () {
                        s.navPrev.on({
                            'click': SliceSlider.prevSlide
                        });
                        s.navNext.on({
                            'click': SliceSlider.nextSlide
                        });
                        $(document).keyup(function (e) {
                            if ((e.which === 37) || (e.which === 38)) {
                                SliceSlider.prevSlide()
                            }
                            if ((e.which === 39) || (e.which === 40)) {
                                SliceSlider.nextSlide()
                            }
                        })
                    },
                    handleScroll: function (e) {
                        if (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0) {
                            s.delta--;
                            if (Math.abs(s.delta) >= s.scrollThreshold) {
                                SliceSlider.prevSlide()
                            }
                        } else {
                            s.delta++;
                            if (s.delta >= s.scrollThreshold) {
                                SliceSlider.nextSlide()
                            }
                        }
                        return !1
                    },
                    showSlide: function () {
                        s.delta = 0;
                        if ($('body').hasClass('is-sliding')) {
                            return
                        }
                        s.slides.each(function (i, slide) {
                            $(slide).toggleClass('is-active', (i === s.currentSlideIndex));
                            $(slide).toggleClass('is-prev', (i === s.currentSlideIndex - 1));
                            $(slide).toggleClass('is-next', (i === s.currentSlideIndex + 1));
                            $('body').addClass('is-sliding');
                            setTimeout(function () {
                                $('body').removeClass('is-sliding')
                            }, 1000)
                        })
                    },
                    prevSlide: function () {
                        if (s.currentSlideIndex <= 0) {
                            s.currentSlideIndex = s.numSlides
                        }
                        s.currentSlideIndex--;
                        SliceSlider.showSlide()
                    },
                    nextSlide: function () {
                        s.currentSlideIndex++;
                        if (s.currentSlideIndex >= s.numSlides) {
                            s.currentSlideIndex = 0
                        }
                        SliceSlider.showSlide()
                    },
                };
                SliceSlider.init()
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-flip.default', function ($scope) {
            var Gallery = (function () {
                var scrollTimeId;
                var posLeft = 0;

                function Gallery(config) {
                    this.list = $(config.list);
                    this.items = this.list.find('li');
                    this.itemWidth = this.items.outerWidth()
                };
                Gallery.prototype = {
                    constructor: Gallery,
                    init: function () {
                        this.setGalleryWidth();
                        this.eventManager();
                        return this
                    },
                    eventManager: function () {
                        var _this = this;
                        $("html, body").on('mousewheel', function (event) {
                            clearTimeout(scrollTimeId);
                            scrollTimeId = setTimeout(onScrollEventHandler.bind(this, event, _this.itemWidth), 0)
                        })
                    },
                    setGalleryWidth: function () {
                        this.list.css('width', this.getGalleryWidth());
                        this.list.css('overflow', 'scroll')
                    },
                    getGalleryWidth: function () {
                        var width = 0;
                        this.items.each(function (index, item) {
                            width += $(this).outerWidth()
                        });
                        return width
                    }
                };

                function onScrollEventHandler(event, width) {
                    if (event.deltaY > 0) {
                        this.scrollLeft -= width / 20
                    } else {
                        this.scrollLeft += width / 20
                    }
                    event.preventDefault()
                };
                return Gallery
            })();
            $(document).ready(function () {
                var gallery = new Gallery({
                    list: '.flip-slide-container .container .gallery'
                }).init();
                jQuery('.flip-slide-container').css('overflow', 'scroll');
                jQuery('body').css('overflow-x', 'scroll')
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-split-carousel.default', function ($scope) {
            jQuery(".split-carousel-slider-wrapper").each(function () {
                var $carousel = jQuery(this);
                var fullscreen = $carousel.attr('data-fullscreen');
                if (fullscreen != 0) {
                    jQuery('body').addClass('elementor-fullscreen');
                    var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                    var documentHeight = jQuery(window).innerHeight();
                    var sliderHeight = parseInt(documentHeight - menuHeight);
                    $carousel.css('height', sliderHeight + 'px');
                    jQuery(window).resize(function () {
                        var menuHeight = parseInt(jQuery('#wrapper').css('paddingTop'));
                        var documentHeight = jQuery(window).innerHeight();
                        var sliderHeight = parseInt(documentHeight - menuHeight);
                        $carousel.css('height', sliderHeight + 'px')
                    })
                }
                var activeIndex = 0;
                var limit = 0;
                var disabled = !1;
                var $stage = void 0;
                var $controls = void 0;
                var canvas = !1;
                var SPIN_FORWARD_CLASS = 'js-spin-fwd';
                var SPIN_BACKWARD_CLASS = 'js-spin-bwd';
                var DISABLE_TRANSITIONS_CLASS = 'js-transitions-disabled';
                var SPIN_DUR = 1000;
                var appendControls = function appendControls() {
                    for (var i = 0; i < limit; i++) {
                        $('.carousel-control').append('<a href="#" data-index="' + i + '"></a>')
                    }
                    var height = $('.carousel-control').children().last().outerHeight();
                    $('.carousel-control').css('height', 30 + limit * height);
                    $controls = $('.carousel-control').children();
                    $controls.eq(activeIndex).addClass('active')
                };
                var setIndexes = function setIndexes() {
                    $('.spinner').children().each(function (i, el) {
                        $(el).attr('data-index', i);
                        limit++
                    })
                };
                var duplicateSpinner = function duplicateSpinner() {
                    var $el = $('.spinner').parent();
                    var html = $('.spinner').parent().html();
                    $el.append(html);
                    $('.spinner').last().addClass('spinner--right');
                    $('.spinner--right').removeClass('spinner--left')
                };
                var paintFaces = function paintFaces() {
                    $('.spinner-face').each(function (i, el) {
                        var $el = $(el);
                        var color = $(el).attr('data-bg');
                        $el.children().css('backgroundImage', 'url(' + getBase64PixelByColor(color) + ')')
                    })
                };
                var getBase64PixelByColor = function getBase64PixelByColor(hex) {
                    if (!canvas) {
                        canvas = document.createElement('canvas');
                        canvas.height = 1;
                        canvas.width = 1
                    }
                    if (canvas.getContext) {
                        var ctx = canvas.getContext('2d');
                        ctx.fillStyle = hex;
                        ctx.fillRect(0, 0, 1, 1);
                        return canvas.toDataURL()
                    }
                    return !1
                };
                var prepareDom = function prepareDom() {
                    setIndexes();
                    paintFaces();
                    duplicateSpinner();
                    appendControls()
                };
                var spin = function spin() {
                    var inc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
                    if (disabled) return;
                    if (!inc) return;
                    activeIndex += inc;
                    disabled = !0;
                    if (activeIndex >= limit) {
                        activeIndex = 0
                    }
                    if (activeIndex < 0) {
                        activeIndex = limit - 1
                    }
                    var $activeEls = $('.spinner-face.js-active');
                    var $nextEls = $('.spinner-face[data-index=' + activeIndex + ']');
                    $nextEls.addClass('js-next');
                    if (inc > 0) {
                        $stage.addClass(SPIN_FORWARD_CLASS)
                    } else {
                        $stage.addClass(SPIN_BACKWARD_CLASS)
                    }
                    $controls.removeClass('active');
                    $controls.eq(activeIndex).addClass('active');
                    setTimeout(function () {
                        spinCallback(inc)
                    }, SPIN_DUR, inc)
                };
                var spinCallback = function spinCallback(inc) {
                    $('.js-active').removeClass('js-active');
                    $('.js-next').removeClass('js-next').addClass('js-active');
                    $stage.addClass(DISABLE_TRANSITIONS_CLASS).removeClass(SPIN_FORWARD_CLASS).removeClass(SPIN_BACKWARD_CLASS);
                    $('.js-active').each(function (i, el) {
                        var $el = $(el);
                        $el.prependTo($el.parent())
                    });
                    setTimeout(function () {
                        $stage.removeClass(DISABLE_TRANSITIONS_CLASS);
                        disabled = !1
                    }, 100)
                };
                var attachListeners = function attachListeners() {
                    document.onkeyup = function (e) {
                        switch (e.keyCode) {
                            case 38:
                                spin(-1);
                                break;
                            case 40:
                                spin(1);
                                break
                        }
                    };
                    $carousel.bind('DOMMouseScroll', function (e) {
                        if (e.originalEvent.detail > 0) {
                            spin(1)
                        } else {
                            spin(-1)
                        }
                        return !1
                    });
                    $carousel.bind('mousewheel', function (e) {
                        if (e.originalEvent.wheelDelta < 0) {
                            spin(1)
                        } else {
                            spin(-1)
                        }
                        return !1
                    });
                    jQuery('body').on('touchmove', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return !1
                    });
                    var ts;
                    $carousel.bind('touchstart', function (e) {
                        ts = e.originalEvent.touches[0].clientY
                    });
                    $carousel.bind('touchend', function (e) {
                        var te = e.originalEvent.changedTouches[0].clientY;
                        if (ts > te + 5) {
                            spin(1)
                        } else if (ts < te - 5) {
                            spin(-1)
                        }
                    });
                    $controls.on('click', function (e) {
                        e.preventDefault();
                        if (disabled) return;
                        var $el = $(e.target);
                        var toIndex = parseInt($el.attr('data-index'), 10);
                        spin(toIndex - activeIndex)
                    })
                };
                var assignEls = function assignEls() {
                    $stage = $('.carousel-stage')
                };
                var init = function init() {
                    assignEls();
                    prepareDom();
                    attachListeners()
                };
                $(function () {
                    init()
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-horizontal-timeline.default', function ($scope) {
            var timelines = jQuery('.cd-horizontal-timeline');
            var eventsMinDistance = timelines.attr('data-spacing');
            if (eventsMinDistance == '') {
                eventsMinDistance = 60
            }(timelines.length > 0) && initTimeline(timelines);

            function initTimeline(timelines) {
                timelines.each(function () {
                    var timeline = jQuery(this),
                        timelineComponents = {};
                    timelineComponents.timelineWrapper = timeline.find('.events-wrapper');
                    timelineComponents.eventsWrapper = timelineComponents.timelineWrapper.children('.events');
                    timelineComponents.fillingLine = timelineComponents.eventsWrapper.children('.filling-line');
                    timelineComponents.timelineEvents = timelineComponents.eventsWrapper.find('a');
                    timelineComponents.timelineDates = parseDate(timelineComponents.timelineEvents);
                    timelineComponents.eventsMinLapse = minLapse(timelineComponents.timelineDates);
                    timelineComponents.timelineNavigation = timeline.find('.cd-timeline-navigation');
                    timelineComponents.eventsContent = timeline.children('.events-content');
                    setDatePosition(timelineComponents, eventsMinDistance);
                    var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
                    timeline.addClass('loaded');
                    timelineComponents.timelineNavigation.on('click', '.next', function (event) {
                        event.preventDefault();
                        updateSlide(timelineComponents, timelineTotWidth, 'next')
                    });
                    timelineComponents.timelineNavigation.on('click', '.prev', function (event) {
                        event.preventDefault();
                        updateSlide(timelineComponents, timelineTotWidth, 'prev')
                    });
                    timelineComponents.eventsWrapper.on('click', 'a', function (event) {
                        event.preventDefault();
                        timelineComponents.timelineEvents.removeClass('selected');
                        jQuery(this).addClass('selected');
                        updateOlderEvents(jQuery(this));
                        updateFilling(jQuery(this), timelineComponents.fillingLine, timelineTotWidth);
                        updateVisibleContent(jQuery(this), timelineComponents.eventsContent)
                    });
                    timelineComponents.eventsContent.on('swipeleft', function () {
                        var mq = checkMQ();
                        (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'next')
                    });
                    timelineComponents.eventsContent.on('swiperight', function () {
                        var mq = checkMQ();
                        (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'prev')
                    });
                    jQuery(document).keyup(function (event) {
                        if (event.which == '37' && elementInViewport(timeline.get(0))) {
                            showNewContent(timelineComponents, timelineTotWidth, 'prev')
                        } else if (event.which == '39' && elementInViewport(timeline.get(0))) {
                            showNewContent(timelineComponents, timelineTotWidth, 'next')
                        }
                    })
                })
            }

            function updateSlide(timelineComponents, timelineTotWidth, string) {
                var translateValue = getTranslateValue(timelineComponents.eventsWrapper),
                    wrapperWidth = Number(timelineComponents.timelineWrapper.css('width').replace('px', ''));
                (string == 'next') ? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth): translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance)
            }

            function showNewContent(timelineComponents, timelineTotWidth, string) {
                var visibleContent = timelineComponents.eventsContent.find('.selected'),
                    newContent = (string == 'next') ? visibleContent.next() : visibleContent.prev();
                if (newContent.length > 0) {
                    var selectedDate = timelineComponents.eventsWrapper.find('.selected'),
                        newEvent = (string == 'next') ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');
                    updateFilling(newEvent, timelineComponents.fillingLine, timelineTotWidth);
                    updateVisibleContent(newEvent, timelineComponents.eventsContent);
                    newEvent.addClass('selected');
                    selectedDate.removeClass('selected');
                    updateOlderEvents(newEvent);
                    updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth)
                }
            }

            function updateTimelinePosition(string, event, timelineComponents, timelineTotWidth) {
                var eventStyle = window.getComputedStyle(event.get(0), null),
                    eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
                    timelineWidth = Number(timelineComponents.timelineWrapper.css('width').replace('px', '')),
                    timelineTotWidth = Number(timelineComponents.eventsWrapper.css('width').replace('px', ''));
                var timelineTranslate = getTranslateValue(timelineComponents.eventsWrapper);
                if ((string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < -timelineTranslate)) {
                    translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth)
                }
            }

            function translateTimeline(timelineComponents, value, totWidth) {
                var eventsWrapper = timelineComponents.eventsWrapper.get(0);
                value = (value > 0) ? 0 : value;
                value = (!(typeof totWidth === 'undefined') && value < totWidth) ? totWidth : value;
                setTransformValue(eventsWrapper, 'translateX', value + 'px');
                (value == 0) ? timelineComponents.timelineNavigation.find('.prev').addClass('inactive'): timelineComponents.timelineNavigation.find('.prev').removeClass('inactive');
                (value == totWidth) ? timelineComponents.timelineNavigation.find('.next').addClass('inactive'): timelineComponents.timelineNavigation.find('.next').removeClass('inactive')
            }

            function updateFilling(selectedEvent, filling, totWidth) {
                var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
                    eventLeft = eventStyle.getPropertyValue("left"),
                    eventWidth = eventStyle.getPropertyValue("width");
                eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
                var scaleValue = eventLeft / totWidth;
                setTransformValue(filling.get(0), 'scaleX', scaleValue)
            }

            function setDatePosition(timelineComponents, min) {
                for (i = 0; i < timelineComponents.timelineDates.length; i++) {
                    var distance = daydiff(timelineComponents.timelineDates[0], timelineComponents.timelineDates[i]),
                        distanceNorm = Math.round(distance / timelineComponents.eventsMinLapse) + 2;
                    timelineComponents.timelineEvents.eq(i).css('left', distanceNorm * min + 'px')
                }
            }

            function setTimelineWidth(timelineComponents, width) {
                var timeSpan = daydiff(timelineComponents.timelineDates[0], timelineComponents.timelineDates[timelineComponents.timelineDates.length - 1]),
                    timeSpanNorm = timeSpan / timelineComponents.eventsMinLapse,
                    timeSpanNorm = Math.round(timeSpanNorm) + 4,
                    totalWidth = timeSpanNorm * width;
                timelineComponents.eventsWrapper.css('width', totalWidth + 'px');
                updateFilling(timelineComponents.timelineEvents.eq(0), timelineComponents.fillingLine, totalWidth);
                return totalWidth
            }

            function updateVisibleContent(event, eventsContent) {
                var eventDate = event.data('date'),
                    visibleContent = eventsContent.find('.selected'),
                    selectedContent = eventsContent.find('[data-date="' + eventDate + '"]'),
                    selectedContentHeight = selectedContent.height();
                if (selectedContent.index() > visibleContent.index()) {
                    var classEnetering = 'selected enter-right',
                        classLeaving = 'leave-left'
                } else {
                    var classEnetering = 'selected enter-left',
                        classLeaving = 'leave-right'
                }
                selectedContent.attr('class', classEnetering);
                visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                    visibleContent.removeClass('leave-right leave-left');
                    selectedContent.removeClass('enter-left enter-right')
                });
                eventsContent.css('height', selectedContentHeight + 'px')
            }

            function updateOlderEvents(event) {
                event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event')
            }

            function getTranslateValue(timeline) {
                var timelineStyle = window.getComputedStyle(timeline.get(0), null),
                    timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") || timelineStyle.getPropertyValue("-moz-transform") || timelineStyle.getPropertyValue("-ms-transform") || timelineStyle.getPropertyValue("-o-transform") || timelineStyle.getPropertyValue("transform");
                if (timelineTranslate.indexOf('(') >= 0) {
                    var timelineTranslate = timelineTranslate.split('(')[1];
                    timelineTranslate = timelineTranslate.split(')')[0];
                    timelineTranslate = timelineTranslate.split(',');
                    var translateValue = timelineTranslate[4]
                } else {
                    var translateValue = 0
                }
                return Number(translateValue)
            }

            function setTransformValue(element, property, value) {
                element.style["-webkit-transform"] = property + "(" + value + ")";
                element.style["-moz-transform"] = property + "(" + value + ")";
                element.style["-ms-transform"] = property + "(" + value + ")";
                element.style["-o-transform"] = property + "(" + value + ")";
                element.style.transform = property + "(" + value + ")"
            }

            function parseDate(events) {
                var dateArrays = [];
                events.each(function () {
                    var dateComp = jQuery(this).data('date').split('/'),
                        newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
                    dateArrays.push(newDate)
                });
                return dateArrays
            }

            function parseDate2(events) {
                var dateArrays = [];
                events.each(function () {
                    var singleDate = jQuery(this),
                        dateComp = singleDate.data('date').split('T');
                    if (dateComp.length > 1) {
                        var dayComp = dateComp[0].split('/'),
                            timeComp = dateComp[1].split(':')
                    } else if (dateComp[0].indexOf(':') >= 0) {
                        var dayComp = ["2000", "0", "0"],
                            timeComp = dateComp[0].split(':')
                    } else {
                        var dayComp = dateComp[0].split('/'),
                            timeComp = ["0", "0"]
                    }
                    var newDate = new Date(dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1]);
                    dateArrays.push(newDate)
                });
                return dateArrays
            }

            function daydiff(first, second) {
                return Math.round((second - first))
            }

            function minLapse(dates) {
                var dateDistances = [];
                for (i = 1; i < dates.length; i++) {
                    var distance = daydiff(dates[i - 1], dates[i]);
                    dateDistances.push(distance)
                }
                return Math.min.apply(null, dateDistances)
            }

            function elementInViewport(el) {
                var top = el.offsetTop;
                var left = el.offsetLeft;
                var width = el.offsetWidth;
                var height = el.offsetHeight;
                while (el.offsetParent) {
                    el = el.offsetParent;
                    top += el.offsetTop;
                    left += el.offsetLeft
                }
                return (top < (window.pageYOffset + window.innerHeight) && left < (window.pageXOffset + window.innerWidth) && (top + height) > window.pageYOffset && (left + width) > window.pageXOffset)
            }

            function checkMQ() {
                return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "")
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-background-list.default', function ($scope) {
            jQuery(".background-list-wrapper").each(function () {
                var parentDiv = jQuery(this);
                parentDiv.children('.background-list-column').hover(function () {
                    parentDiv.find('.background-list-img').removeClass('hover');
                    jQuery(this).next('.background-list-img').addClass('hover')
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-masonry.default', function ($scope) {
            jQuery(function ($) {
                jQuery(".portfolio-masonry-content-wrapper.do-masonry").each(function () {
                    var grid = jQuery(this);
                    var cols = grid.attr('data-cols');
                    cols = parseInt(cols);
                    var gutter = 50;
                    switch (cols) {
                        case 2:
                            gutter = 50;
                            break;
                        case 3:
                            gutter = 40;
                            break;
                        case 4:
                            gutter = 30;
                            break;
                        case 5:
                            gutter = 20;
                            break
                    }
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".gallery-grid-item",
                            columnWidth: ".gallery-grid-item",
                            gutter: gutter
                        })
                    });
                    jQuery(".portfolio-masonry-content-wrapper.do-masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        var cols = grid.attr('data-cols');
                        var gutter = 50;
                        switch (cols) {
                            case 2:
                                gutter = 50;
                                break;
                            case 3:
                                gutter = 40;
                                break;
                            case 4:
                                gutter = 30;
                                break;
                            case 5:
                                gutter = 20;
                                break
                        }
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    columnWidth: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    gutter: gutter
                                })
                            },
                        })
                    });
                    jQuery(".portfolio-masonry-container").each(function () {
                        var containderDiv = jQuery(this);
                        var selectedClass = "";
                        containderDiv.find(".filter-tag-btn").on('click', function () {
                            containderDiv.find(".filter-tag-btn").removeClass("active");
                            jQuery(this).addClass("active");
                            selectedClass = jQuery(this).attr("data-rel");
                            var gridDiv = containderDiv.find(".portfolio-masonry-content-wrapper.do-masonry");
                            gridDiv.fadeTo(100, 0);
                            gridDiv.find(".portfolio-masonry-grid-wrapper").css({
                                opacity: 0,
                                display: 'none',
                                transform: 'scale(0.0)'
                            });
                            gridDiv.find(".portfolio-masonry-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                            setTimeout(function () {
                                jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                                jQuery("." + selectedClass).css({
                                    opacity: 1,
                                    display: 'block',
                                    transform: 'scale(1,1)'
                                });
                                gridDiv.masonry('destroy');
                                var $grid = gridDiv.masonry({
                                    itemSelector: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    columnWidth: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    gutter: gutter
                                });
                                $grid.masonry('reloadItems');
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }, 300)
                        })
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-masonry-grid.default', function ($scope) {
            jQuery(function ($) {
                jQuery(".portfolio-masonry-content-wrapper.do-masonry").each(function () {
                    var grid = jQuery(this);
                    var cols = grid.attr('data-cols');
                    cols = parseInt(cols);
                    var gutter = 50;
                    switch (cols) {
                        case 2:
                            gutter = 50;
                            break;
                        case 3:
                            gutter = 40;
                            break;
                        case 4:
                            gutter = 30;
                            break;
                        case 5:
                            gutter = 20;
                            break
                    }
                    grid.imagesLoaded(function () {
                        grid.masonry({
                            itemSelector: ".portfolio-masonry-grid-wrapper.scale-anm",
                            columnWidth: ".portfolio-masonry-grid-wrapper.scale-anm",
                            gutter: gutter
                        })
                    });
                    jQuery(".portfolio-masonry-content-wrapper.do-masonry img.lazy_masonry").each(function () {
                        var currentImg = jQuery(this);
                        currentImg.parent("div.post-featured-image-hover").removeClass("lazy");
                        var cols = grid.attr('data-cols');
                        var gutter = 50;
                        switch (cols) {
                            case 2:
                                gutter = 50;
                                break;
                            case 3:
                                gutter = 40;
                                break;
                            case 4:
                                gutter = 30;
                                break;
                            case 5:
                                gutter = 20;
                                break
                        }
                        jQuery(this).Lazy({
                            onFinishedAll: function () {
                                grid.masonry({
                                    itemSelector: ".gallery-grid-item",
                                    columnWidth: ".gallery-grid-item",
                                    gutter: gutter
                                })
                            },
                        })
                    });
                    jQuery(".portfolio-masonry-container").each(function () {
                        var containderDiv = jQuery(this);
                        var selectedClass = "";
                        containderDiv.find(".filter-tag-btn").on('click', function () {
                            containderDiv.find(".filter-tag-btn").removeClass("active");
                            jQuery(this).addClass("active");
                            selectedClass = jQuery(this).attr("data-rel");
                            var gridDiv = containderDiv.find(".portfolio-masonry-content-wrapper.do-masonry");
                            gridDiv.fadeTo(100, 0);
                            gridDiv.find(".portfolio-masonry-grid-wrapper").css({
                                opacity: 0,
                                display: 'none',
                                transform: 'scale(0.0)'
                            });
                            gridDiv.find(".portfolio-masonry-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                            setTimeout(function () {
                                jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                                jQuery("." + selectedClass).css({
                                    opacity: 1,
                                    display: 'block',
                                    transform: 'scale(1,1)'
                                });
                                gridDiv.masonry('destroy');
                                var $grid = gridDiv.masonry({
                                    itemSelector: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    columnWidth: ".portfolio-masonry-grid-wrapper.scale-anm",
                                    gutter: gutter
                                });
                                $grid.masonry('reloadItems');
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }, 300)
                        })
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-timeline.default', function ($scope) {
            var timelines = jQuery('.cd-horizontal-timeline');
            var eventsMinDistance = timelines.attr('data-spacing');
            if (eventsMinDistance == '') {
                eventsMinDistance = 60
            }(timelines.length > 0) && initTimeline(timelines);

            function initTimeline(timelines) {
                timelines.each(function () {
                    var timeline = jQuery(this),
                        timelineComponents = {};
                    timelineComponents.timelineWrapper = timeline.find('.events-wrapper');
                    timelineComponents.eventsWrapper = timelineComponents.timelineWrapper.children('.events');
                    timelineComponents.fillingLine = timelineComponents.eventsWrapper.children('.filling-line');
                    timelineComponents.timelineEvents = timelineComponents.eventsWrapper.find('a');
                    timelineComponents.timelineDates = parseDate(timelineComponents.timelineEvents);
                    timelineComponents.eventsMinLapse = minLapse(timelineComponents.timelineDates);
                    timelineComponents.timelineNavigation = timeline.find('.cd-timeline-navigation');
                    timelineComponents.eventsContent = timeline.children('.events-content');
                    setDatePosition(timelineComponents, eventsMinDistance);
                    var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
                    timeline.addClass('loaded');
                    timelineComponents.timelineNavigation.on('click', '.next', function (event) {
                        event.preventDefault();
                        updateSlide(timelineComponents, timelineTotWidth, 'next')
                    });
                    timelineComponents.timelineNavigation.on('click', '.prev', function (event) {
                        event.preventDefault();
                        updateSlide(timelineComponents, timelineTotWidth, 'prev')
                    });
                    timelineComponents.eventsWrapper.on('click', 'a', function (event) {
                        event.preventDefault();
                        timelineComponents.timelineEvents.removeClass('selected');
                        jQuery(this).addClass('selected');
                        updateOlderEvents(jQuery(this));
                        updateFilling(jQuery(this), timelineComponents.fillingLine, timelineTotWidth);
                        updateVisibleContent(jQuery(this), timelineComponents.eventsContent)
                    });
                    timelineComponents.eventsContent.on('swipeleft', function () {
                        var mq = checkMQ();
                        (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'next')
                    });
                    timelineComponents.eventsContent.on('swiperight', function () {
                        var mq = checkMQ();
                        (mq == 'mobile') && showNewContent(timelineComponents, timelineTotWidth, 'prev')
                    });
                    jQuery(document).keyup(function (event) {
                        if (event.which == '37' && elementInViewport(timeline.get(0))) {
                            showNewContent(timelineComponents, timelineTotWidth, 'prev')
                        } else if (event.which == '39' && elementInViewport(timeline.get(0))) {
                            showNewContent(timelineComponents, timelineTotWidth, 'next')
                        }
                    })
                })
            }

            function updateSlide(timelineComponents, timelineTotWidth, string) {
                var translateValue = getTranslateValue(timelineComponents.eventsWrapper),
                    wrapperWidth = Number(timelineComponents.timelineWrapper.css('width').replace('px', ''));
                (string == 'next') ? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth): translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance)
            }

            function showNewContent(timelineComponents, timelineTotWidth, string) {
                var visibleContent = timelineComponents.eventsContent.find('.selected'),
                    newContent = (string == 'next') ? visibleContent.next() : visibleContent.prev();
                if (newContent.length > 0) {
                    var selectedDate = timelineComponents.eventsWrapper.find('.selected'),
                        newEvent = (string == 'next') ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');
                    updateFilling(newEvent, timelineComponents.fillingLine, timelineTotWidth);
                    updateVisibleContent(newEvent, timelineComponents.eventsContent);
                    newEvent.addClass('selected');
                    selectedDate.removeClass('selected');
                    updateOlderEvents(newEvent);
                    updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth)
                }
            }

            function updateTimelinePosition(string, event, timelineComponents, timelineTotWidth) {
                var eventStyle = window.getComputedStyle(event.get(0), null),
                    eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
                    timelineWidth = Number(timelineComponents.timelineWrapper.css('width').replace('px', '')),
                    timelineTotWidth = Number(timelineComponents.eventsWrapper.css('width').replace('px', ''));
                var timelineTranslate = getTranslateValue(timelineComponents.eventsWrapper);
                if ((string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < -timelineTranslate)) {
                    translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth)
                }
            }

            function translateTimeline(timelineComponents, value, totWidth) {
                var eventsWrapper = timelineComponents.eventsWrapper.get(0);
                value = (value > 0) ? 0 : value;
                value = (!(typeof totWidth === 'undefined') && value < totWidth) ? totWidth : value;
                setTransformValue(eventsWrapper, 'translateX', value + 'px');
                (value == 0) ? timelineComponents.timelineNavigation.find('.prev').addClass('inactive'): timelineComponents.timelineNavigation.find('.prev').removeClass('inactive');
                (value == totWidth) ? timelineComponents.timelineNavigation.find('.next').addClass('inactive'): timelineComponents.timelineNavigation.find('.next').removeClass('inactive')
            }

            function updateFilling(selectedEvent, filling, totWidth) {
                var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
                    eventLeft = eventStyle.getPropertyValue("left"),
                    eventWidth = eventStyle.getPropertyValue("width");
                eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
                var scaleValue = eventLeft / totWidth;
                setTransformValue(filling.get(0), 'scaleX', scaleValue)
            }

            function setDatePosition(timelineComponents, min) {
                for (i = 0; i < timelineComponents.timelineDates.length; i++) {
                    var distance = daydiff(timelineComponents.timelineDates[0], timelineComponents.timelineDates[i]),
                        distanceNorm = Math.round(distance / timelineComponents.eventsMinLapse) + 2;
                    timelineComponents.timelineEvents.eq(i).css('left', distanceNorm * min + 'px')
                }
            }

            function setTimelineWidth(timelineComponents, width) {
                var timeSpan = daydiff(timelineComponents.timelineDates[0], timelineComponents.timelineDates[timelineComponents.timelineDates.length - 1]),
                    timeSpanNorm = timeSpan / timelineComponents.eventsMinLapse,
                    timeSpanNorm = Math.round(timeSpanNorm) + 4,
                    totalWidth = timeSpanNorm * width;
                timelineComponents.eventsWrapper.css('width', totalWidth + 'px');
                updateFilling(timelineComponents.timelineEvents.eq(0), timelineComponents.fillingLine, totalWidth);
                return totalWidth
            }

            function updateVisibleContent(event, eventsContent) {
                var eventDate = event.data('date'),
                    visibleContent = eventsContent.find('.selected'),
                    selectedContent = eventsContent.find('[data-date="' + eventDate + '"]'),
                    selectedContentHeight = selectedContent.height();
                if (selectedContent.index() > visibleContent.index()) {
                    var classEnetering = 'selected enter-right',
                        classLeaving = 'leave-left'
                } else {
                    var classEnetering = 'selected enter-left',
                        classLeaving = 'leave-right'
                }
                selectedContent.attr('class', classEnetering);
                visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                    visibleContent.removeClass('leave-right leave-left');
                    selectedContent.removeClass('enter-left enter-right')
                });
                eventsContent.css('height', selectedContentHeight + 'px')
            }

            function updateOlderEvents(event) {
                event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event')
            }

            function getTranslateValue(timeline) {
                var timelineStyle = window.getComputedStyle(timeline.get(0), null),
                    timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") || timelineStyle.getPropertyValue("-moz-transform") || timelineStyle.getPropertyValue("-ms-transform") || timelineStyle.getPropertyValue("-o-transform") || timelineStyle.getPropertyValue("transform");
                if (timelineTranslate.indexOf('(') >= 0) {
                    var timelineTranslate = timelineTranslate.split('(')[1];
                    timelineTranslate = timelineTranslate.split(')')[0];
                    timelineTranslate = timelineTranslate.split(',');
                    var translateValue = timelineTranslate[4]
                } else {
                    var translateValue = 0
                }
                return Number(translateValue)
            }

            function setTransformValue(element, property, value) {
                element.style["-webkit-transform"] = property + "(" + value + ")";
                element.style["-moz-transform"] = property + "(" + value + ")";
                element.style["-ms-transform"] = property + "(" + value + ")";
                element.style["-o-transform"] = property + "(" + value + ")";
                element.style.transform = property + "(" + value + ")"
            }

            function parseDate(events) {
                var dateArrays = [];
                events.each(function () {
                    var dateComp = jQuery(this).data('date').split('/'),
                        newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
                    dateArrays.push(newDate)
                });
                return dateArrays
            }

            function parseDate2(events) {
                var dateArrays = [];
                events.each(function () {
                    var singleDate = jQuery(this),
                        dateComp = singleDate.data('date').split('T');
                    if (dateComp.length > 1) {
                        var dayComp = dateComp[0].split('/'),
                            timeComp = dateComp[1].split(':')
                    } else if (dateComp[0].indexOf(':') >= 0) {
                        var dayComp = ["2000", "0", "0"],
                            timeComp = dateComp[0].split(':')
                    } else {
                        var dayComp = dateComp[0].split('/'),
                            timeComp = ["0", "0"]
                    }
                    var newDate = new Date(dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1]);
                    dateArrays.push(newDate)
                });
                return dateArrays
            }

            function daydiff(first, second) {
                return Math.round((second - first))
            }

            function minLapse(dates) {
                var dateDistances = [];
                for (i = 1; i < dates.length; i++) {
                    var distance = daydiff(dates[i - 1], dates[i]);
                    dateDistances.push(distance)
                }
                return Math.min.apply(null, dateDistances)
            }

            function elementInViewport(el) {
                var top = el.offsetTop;
                var left = el.offsetLeft;
                var width = el.offsetWidth;
                var height = el.offsetHeight;
                while (el.offsetParent) {
                    el = el.offsetParent;
                    top += el.offsetTop;
                    left += el.offsetLeft
                }
                return (top < (window.pageYOffset + window.innerHeight) && left < (window.pageXOffset + window.innerWidth) && (top + height) > window.pageYOffset && (left + width) > window.pageXOffset)
            }

            function checkMQ() {
                return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "")
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-timeline-vertical.default', function ($scope) {
            jQuery(".portfolio-timeline-vertical-content-wrapper").each(function () {
                var slideshow = jQuery(this);
                var autoPlay = slideshow.attr('data-autoplay');
                var autoPlayArr = !1;
                if (typeof autoPlay != "undefined") {
                    autoPlayArr = {
                        delay: autoPlay
                    }
                }
                var speed = slideshow.attr('data-speed');
                if (typeof speed == "undefined") {
                    speed = 1600
                }
                var timelineSwiper = new Swiper('.portfolio-timeline-vertical-content-wrapper .timeline .swiper-container', {
                    direction: 'vertical',
                    loop: !1,
                    speed: parseInt(speed),
                    autoplay: autoPlayArr,
                    pagination: {
                        el: '.swiper-pagination',
                        type: 'bullets',
                        renderBullet: function (index, className) {
                            var year = document.querySelectorAll('.swiper-slide')[index].getAttribute('data-year');
                            return '<span class="' + className + '">' + year + '</span>'
                        },
                        clickable: !0
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    breakpoints: {
                        768: {
                            direction: 'horizontal',
                        }
                    },
                    on: {
                        init: function () {
                            slideshow.delay(100).queue(function (next) {
                                jQuery(this).addClass('active')
                            })
                        },
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-parallax.default', function ($scope) {
            jQuery(".slider-parallax-wrapper").each(function () {
                var slideshow = jQuery(this);
                var timer = slideshow.attr('data-autoplay');
                var autoplay = !0;
                if (timer == 0) {
                    timer = !1;
                    autoplay = !1
                }
                var pagination = slideshow.attr('data-pagination');
                if (pagination == 0) {
                    var pagination = !1
                } else {
                    var pagination = !0
                }
                var navigation = slideshow.attr('data-navigation');
                if (navigation == 0) {
                    var navigation = !1
                } else {
                    var navigation = !0
                }
                var slideshowDuration = timer;

                function slideshowSwitch(slideshow, index, auto) {
                    if (slideshow.data('wait')) return;
                    var slides = slideshow.find('.slide');
                    var pages = slideshow.find('.pagination');
                    var activeSlide = slides.filter('.is-active');
                    var activeSlideImage = activeSlide.find('.image-container');
                    var newSlide = slides.eq(index);
                    var newSlideImage = newSlide.find('.image-container');
                    var newSlideContent = newSlide.find('.slide-content');
                    var newSlideElements = newSlide.find('.caption > *');
                    if (newSlide.is(activeSlide)) return;
                    newSlide.addClass('is-new');
                    var timeout = slideshow.data('timeout');
                    clearTimeout(timeout);
                    slideshow.data('wait', !0);
                    var transition = slideshow.attr('data-transition');
                    if (transition == 'fade') {
                        newSlide.css({
                            display: 'block',
                            zIndex: 2
                        });
                        newSlideImage.css({
                            opacity: 0
                        });
                        TweenMax.to(newSlideImage, 1, {
                            alpha: 1,
                            onComplete: function () {
                                newSlide.addClass('is-active').removeClass('is-new');
                                activeSlide.removeClass('is-active');
                                newSlide.css({
                                    display: '',
                                    zIndex: ''
                                });
                                newSlideImage.css({
                                    opacity: ''
                                });
                                slideshow.find('.pagination').trigger('check');
                                slideshow.data('wait', !1);
                                if (auto) {
                                    timeout = setTimeout(function () {
                                        slideshowNext(slideshow, !1, !0)
                                    }, slideshowDuration);
                                    slideshow.data('timeout', timeout)
                                }
                            }
                        })
                    } else {
                        if (newSlide.index() > activeSlide.index()) {
                            var newSlideRight = 0;
                            var newSlideLeft = 'auto';
                            var newSlideImageRight = -slideshow.width() / 8;
                            var newSlideImageLeft = 'auto';
                            var newSlideImageToRight = 0;
                            var newSlideImageToLeft = 'auto';
                            var newSlideContentLeft = 'auto';
                            var newSlideContentRight = 0;
                            var activeSlideImageLeft = -slideshow.width() / 4
                        } else {
                            var newSlideRight = '';
                            var newSlideLeft = 0;
                            var newSlideImageRight = 'auto';
                            var newSlideImageLeft = -slideshow.width() / 8;
                            var newSlideImageToRight = '';
                            var newSlideImageToLeft = 0;
                            var newSlideContentLeft = 0;
                            var newSlideContentRight = 'auto';
                            var activeSlideImageLeft = slideshow.width() / 4
                        }
                        newSlide.css({
                            display: 'block',
                            width: 0,
                            right: newSlideRight,
                            left: newSlideLeft,
                            zIndex: 2
                        });
                        newSlideImage.css({
                            width: slideshow.width(),
                            right: newSlideImageRight,
                            left: newSlideImageLeft
                        });
                        newSlideContent.css({
                            width: slideshow.width(),
                            left: newSlideContentLeft,
                            right: newSlideContentRight
                        });
                        activeSlideImage.css({
                            left: 0
                        });
                        TweenMax.set(newSlideElements, {
                            y: 20,
                            force3D: !0
                        });
                        TweenMax.to(activeSlideImage, 1, {
                            left: activeSlideImageLeft,
                            ease: Power3.easeInOut
                        });
                        TweenMax.to(newSlide, 1, {
                            width: slideshow.width(),
                            ease: Power3.easeInOut
                        });
                        TweenMax.to(newSlideImage, 1, {
                            right: newSlideImageToRight,
                            left: newSlideImageToLeft,
                            ease: Power3.easeInOut
                        });
                        TweenMax.staggerFromTo(newSlideElements, 0.8, {
                            alpha: 0,
                            y: 60
                        }, {
                            alpha: 1,
                            y: 0,
                            ease: Power3.easeOut,
                            force3D: !0,
                            delay: 0.6
                        }, 0.1, function () {
                            newSlide.addClass('is-active').removeClass('is-new');
                            activeSlide.removeClass('is-active');
                            newSlide.css({
                                display: '',
                                width: '',
                                left: '',
                                zIndex: ''
                            });
                            newSlideImage.css({
                                width: '',
                                right: '',
                                left: ''
                            });
                            newSlideContent.css({
                                width: '',
                                left: ''
                            });
                            newSlideElements.css({
                                opacity: '',
                                transform: ''
                            });
                            activeSlideImage.css({
                                left: ''
                            });
                            slideshow.find('.pagination').trigger('check');
                            slideshow.data('wait', !1);
                            if (auto) {
                                timeout = setTimeout(function () {
                                    slideshowNext(slideshow, !1, !0)
                                }, slideshowDuration);
                                slideshow.data('timeout', timeout)
                            }
                        })
                    }
                }

                function slideshowNext(slideshow, previous, auto) {
                    var slides = slideshow.find('.slide');
                    var activeSlide = slides.filter('.is-active');
                    var newSlide = null;
                    if (previous) {
                        newSlide = activeSlide.prev('.slide');
                        if (newSlide.length === 0) {
                            newSlide = slides.last()
                        }
                    } else {
                        newSlide = activeSlide.next('.slide');
                        if (newSlide.length == 0)
                            newSlide = slides.filter('.slide').first()
                    }
                    slideshowSwitch(slideshow, newSlide.index(), auto)
                }

                function homeSlideshowParallax() {
                    var scrollTop = jQuery(window).scrollTop();
                    if (scrollTop > windowHeight) return;
                    var inner = slideshow.find('.slideshow-inner');
                    var newHeight = windowHeight - (scrollTop / 2);
                    var newTop = scrollTop * 0.8;
                    inner.css({
                        transform: 'translateY(' + newTop + 'px)',
                        height: newHeight
                    })
                }
                jQuery(document).ready(function () {
                    jQuery('.slider-parallax-wrapper .slide').addClass('is-loaded');
                    jQuery('.slider-parallax-wrapper .arrows .arrow').on('click', function () {
                        slideshowNext(jQuery(this).closest('.slider-parallax-wrapper'), jQuery(this).hasClass('prev'))
                    });
                    jQuery('.slider-parallax-wrapper .pagination .item').on('click', function () {
                        slideshowSwitch(jQuery(this).closest('.slider-parallax-wrapper'), jQuery(this).index())
                    });
                    jQuery('.slider-parallax-wrapper .pagination').on('check', function () {
                        var slideshow = jQuery(this).closest('.slider-parallax-wrapper');
                        var pages = jQuery(this).find('.item');
                        var index = slideshow.find('.slider_parallax_slides .is-active').index();
                        pages.removeClass('is-active');
                        pages.eq(index).addClass('is-active')
                    });
                    if (autoplay) {
                        var timeout = setTimeout(function () {
                            slideshowNext(slideshow, !1, !0)
                        }, slideshowDuration);
                        slideshow.data('timeout', timeout)
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-distortion-grid.default', function ($scope) {
            Array.from(document.querySelectorAll('.distortion-grid-item-img')).forEach((el) => {
                const imgs = Array.from(el.querySelectorAll('img'));
                new hoverEffect({
                    parent: el,
                    intensity: el.dataset.intensity || undefined,
                    speedIn: el.dataset.speedin || undefined,
                    speedOut: el.dataset.speedout || undefined,
                    easing: el.dataset.easing || undefined,
                    hover: el.dataset.hover || undefined,
                    image1: imgs[0].getAttribute('src'),
                    image2: imgs[1].getAttribute('src'),
                    displacementImage: el.dataset.displacement
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-animated.default', function ($scope) {
            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || !1;
                        descriptor.configurable = !0;
                        if ("value" in descriptor) descriptor.writable = !0;
                        Object.defineProperty(target, descriptor.key, descriptor)
                    }
                }
                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor
                }
            }();

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function")
                }
            }
            var $window = jQuery(window);
            var $body = jQuery('body');
            var Slideshow = function () {
                function Slideshow() {
                    var _this = this;
                    var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                    _classCallCheck(this, Slideshow);
                    var defaultOptions = {
                        $el: jQuery('.animated-slider-wrapper'),
                        showArrows: !1,
                        showPagination: !0,
                        duration: 10000,
                        autoplay: !0
                    };
                    var options = Object.assign({}, defaultOptions, userOptions);
                    this.$el = options.$el;
                    this.maxSlide = this.$el.find(jQuery('.js-slider-home-slide')).length;
                    this.showArrows = this.maxSlide > 1 ? options.showArrows : !1;
                    this.showPagination = options.showPagination;
                    this.currentSlide = 1;
                    this.isAnimating = !1;
                    this.animationDuration = 1200;
                    this.autoplaySpeed = options.duration;
                    this.interval;
                    this.$controls = this.$el.find('.js-slider-home-button');
                    this.autoplay = this.maxSlide > 1 ? options.autoplay : !1;
                    this.autoplay = !1;
                    this.$el.on('click', '.js-slider-home-next', function (event) {
                        return _this.nextSlide()
                    });
                    this.$el.on('click', '.js-slider-home-prev', function (event) {
                        return _this.prevSlide()
                    });
                    this.$el.on('click', '.js-pagination-item', function (event) {
                        if (!_this.isAnimating) {
                            _this.preventClick();
                            _this.goToSlide(event.target.dataset.slide)
                        }
                    });
                    this.init()
                }
                _createClass(Slideshow, [{
                    key: 'init',
                    value: function init() {
                        this.goToSlide(1);
                        if (this.autoplay) {
                            this.startAutoplay()
                        }
                        if (this.showPagination) {
                            var paginationNumber = this.maxSlide;
                            var pagination = '<div class="pagination"><div class="container">';
                            for (var i = 0; i < this.maxSlide; i++) {
                                var item = '<span class="pagination-item js-pagination-item ' + (i === 0 ? 'is-current' : '') + '" data-slide=' + (i + 1) + '>' + (i + 1) + '</span>';
                                pagination = pagination + item
                            }
                            pagination = pagination + '</div></div>';
                            this.$el.append(pagination)
                        }
                    }
                }, {
                    key: 'preventClick',
                    value: function preventClick() {
                        var _this2 = this;
                        this.isAnimating = !0;
                        this.$controls.prop('disabled', !0);
                        clearInterval(this.interval);
                        setTimeout(function () {
                            _this2.isAnimating = !1;
                            _this2.$controls.prop('disabled', !1);
                            if (_this2.autoplay) {
                                _this2.startAutoplay()
                            }
                        }, this.animationDuration)
                    }
                }, {
                    key: 'goToSlide',
                    value: function goToSlide(index) {
                        this.currentSlide = parseInt(index);
                        if (this.currentSlide > this.maxSlide) {
                            this.currentSlide = 1
                        }
                        if (this.currentSlide === 0) {
                            this.currentSlide = this.maxSlide
                        }
                        var newCurrent = this.$el.find('.js-slider-home-slide[data-slide="' + this.currentSlide + '"]');
                        var newPrev = this.currentSlide === 1 ? this.$el.find('.js-slider-home-slide').last() : newCurrent.prev('.js-slider-home-slide');
                        var newNext = this.currentSlide === this.maxSlide ? this.$el.find('.js-slider-home-slide').first() : newCurrent.next('.js-slider-home-slide');
                        this.$el.find('.js-slider-home-slide').removeClass('is-prev is-next is-current');
                        this.$el.find('.js-pagination-item').removeClass('is-current');
                        if (this.maxSlide > 1) {
                            newPrev.addClass('is-prev');
                            newNext.addClass('is-next')
                        }
                        newCurrent.addClass('is-current');
                        this.$el.find('.js-pagination-item[data-slide="' + this.currentSlide + '"]').addClass('is-current')
                    }
                }, {
                    key: 'nextSlide',
                    value: function nextSlide() {
                        this.preventClick();
                        this.goToSlide(this.currentSlide + 1)
                    }
                }, {
                    key: 'prevSlide',
                    value: function prevSlide() {
                        this.preventClick();
                        this.goToSlide(this.currentSlide - 1)
                    }
                }, {
                    key: 'startAutoplay',
                    value: function startAutoplay() {
                        var _this3 = this;
                        this.interval = setInterval(function () {
                            if (!_this3.isAnimating) {
                                _this3.nextSlide()
                            }
                        }, this.autoplaySpeed)
                    }
                }, {
                    key: 'destroy',
                    value: function destroy() {
                        this.$el.off()
                    }
                }]);
                return Slideshow
            }();
            (function () {
                var loaded = !1;
                var maxLoad = 3000;

                function load() {
                    var options = {
                        showPagination: !0
                    };
                    var slideShow = new Slideshow(options)
                }

                function addLoadClass() {
                    $body.addClass('is-loaded');
                    setTimeout(function () {
                        $body.addClass('is-animated')
                    }, 600)
                }
                $window.on('load', function () {
                    if (!loaded) {
                        loaded = !0;
                        load()
                    }
                });
                setTimeout(function () {
                    if (!loaded) {
                        loaded = !0;
                        load()
                    }
                }, maxLoad);
                addLoadClass()
            })()
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-fadeup.default', function ($scope) {
            function init(item) {
                var items = item.querySelectorAll('li'),
                    current = 0,
                    autoUpdate = !0;
                var nav = document.createElement('nav');
                nav.className = 'nav_arrows';
                var prevbtn = document.createElement('button');
                prevbtn.className = 'prev';
                prevbtn.setAttribute('aria-label', 'Prev');
                var nextbtn = document.createElement('button');
                nextbtn.className = 'next';
                nextbtn.setAttribute('aria-label', 'Next');
                var counter = document.createElement('div');
                counter.className = 'counter';
                counter.innerHTML = "<span>1</span><span>" + items.length + "</span>";
                if (items.length > 1) {
                    nav.appendChild(prevbtn);
                    nav.appendChild(counter);
                    nav.appendChild(nextbtn);
                    item.appendChild(nav)
                }
                items[current].className = "current";
                if (items.length > 1) items[items.length - 1].className = "prev-slide";
                var navigate = function (dir) {
                    items[current].className = "";
                    if (dir === 'right') {
                        current = current < items.length - 1 ? current + 1 : 0
                    } else {
                        current = current > 0 ? current - 1 : items.length - 1
                    }
                    var nextCurrent = current < items.length - 1 ? current + 1 : 0,
                        prevCurrent = current > 0 ? current - 1 : items.length - 1;
                    items[current].className = "current";
                    items[prevCurrent].className = "prev-slide";
                    items[nextCurrent].className = "";
                    counter.firstChild.textContent = current + 1
                }
                item.addEventListener('mouseenter', function () {
                    autoUpdate = !1
                });
                item.addEventListener('mouseleave', function () {
                    autoUpdate = !0
                });
                prevbtn.addEventListener('click', function () {
                    navigate('left')
                });
                nextbtn.addEventListener('click', function () {
                    navigate('right')
                });
                document.addEventListener('keydown', function (ev) {
                    var keyCode = ev.keyCode || ev.which;
                    switch (keyCode) {
                        case 37:
                            navigate('left');
                            break;
                        case 39:
                            navigate('right');
                            break
                    }
                });
                item.addEventListener('touchstart', handleTouchStart, !1);
                item.addEventListener('touchmove', handleTouchMove, !1);
                var xDown = null;
                var yDown = null;

                function handleTouchStart(evt) {
                    xDown = evt.touches[0].clientX;
                    yDown = evt.touches[0].clientY
                };

                function handleTouchMove(evt) {
                    if (!xDown || !yDown) {
                        return
                    }
                    var xUp = evt.touches[0].clientX;
                    var yUp = evt.touches[0].clientY;
                    var xDiff = xDown - xUp;
                    var yDiff = yDown - yUp;
                    if (Math.abs(xDiff) > Math.abs(yDiff)) {
                        if (xDiff > 0) {
                            navigate('right')
                        } else {
                            navigate('left')
                        }
                    }
                    xDown = null;
                    yDown = null
                }
            } [].slice.call(document.querySelectorAll('.fadeup-slider-wrapper')).forEach(function (item) {
                init(item)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-motion-reveal.default', function ($scope) {
            class Slide {
                constructor(el) {
                    this.DOM = {
                        el: el
                    };
                    this.DOM.imgWrap = this.DOM.el.querySelector('.slide-img-wrap');
                    this.DOM.revealer = this.DOM.imgWrap.querySelector('.slide-img-reveal');
                    this.DOM.title = this.DOM.el.querySelector('.slide-title');
                    this.DOM.number = this.DOM.el.querySelector('.slide-number');
                    this.DOM.preview = {
                        imgWrap: this.DOM.el.querySelector('.preview-img-wrap'),
                        revealer: this.DOM.el.querySelector('.preview-img-wrap > .preview-img-reveal'),
                        title: this.DOM.el.querySelector('.preview-title'),
                        content: this.DOM.el.querySelector('.preview-content')
                    };
                    this.config = {
                        animation: {
                            duration: 0.6,
                            ease: Expo.easeOut
                        }
                    }
                }
                setCurrent(isCurrent = !0) {
                    this.DOM.el.classList[isCurrent ? 'add' : 'remove']('slide-current')
                }
                hide(direction) {
                    return this.toggle('hide', direction)
                }
                show(direction) {
                    return this.toggle('show', direction)
                }
                toggle(action, direction) {
                    return new Promise((resolve, reject) => {
                        let revealerOpts = {
                            delay: action === 'hide' ? 0 : this.config.animation.duration / 2,
                            ease: this.config.animation.ease,
                            onComplete: resolve
                        };
                        const commonOpts = {
                            delay: action === 'hide' ? 0 : this.config.animation.duration / 2,
                            ease: this.config.animation.ease,
                            opacity: action === 'hide' ? 0 : 1
                        };
                        let imgOpts = Object.assign({}, commonOpts);
                        let numberOpts = Object.assign({}, commonOpts);
                        let titleOpts = Object.assign({}, commonOpts);
                        if (direction === 'left' || direction === 'right') {
                            revealerOpts.startAt = action === 'hide' ? {
                                x: direction === 'left' ? '-100%' : '100%',
                                y: '0%'
                            } : {
                                x: '0%',
                                y: '0%'
                            };
                            revealerOpts.x = action === 'hide' ? '0%' : direction === 'left' ? '100%' : '-100%';
                            imgOpts.startAt = action === 'show' ? {
                                opacity: 0,
                                x: direction === 'left' ? '-20%' : '20%'
                            } : {};
                            imgOpts.x = action === 'hide' ? direction === 'left' ? '20%' : '-20%' : '0%';
                            titleOpts.startAt = action === 'show' ? {
                                opacity: 1,
                                scale: 0.2,
                                x: direction === 'left' ? '-200%' : '200%'
                            } : {};
                            titleOpts.x = action === 'hide' ? direction === 'left' ? '200%' : '-200%' : '0%';
                            titleOpts.scale = action === 'hide' ? 0.2 : 1;
                            numberOpts.startAt = action === 'show' ? {
                                opacity: 1,
                                x: direction === 'left' ? '-50%' : '50%'
                            } : {};
                            numberOpts.x = action === 'hide' ? direction === 'left' ? '50%' : '-50%' : '0%'
                        } else {
                            revealerOpts.startAt = action === 'hide' ? {
                                x: '0%',
                                y: direction === 'down' ? '-100%' : '100%'
                            } : {
                                x: '0%',
                                y: '0%'
                            };
                            revealerOpts.y = action === 'hide' ? '0%' : direction === 'down' ? '100%' : '-100%';
                            imgOpts.startAt = action === 'show' ? {
                                opacity: 1,
                                y: direction === 'down' ? '-10%' : '10%'
                            } : {};
                            imgOpts.y = action === 'hide' ? direction === 'down' ? '10%' : '-10%' : '0%';
                            titleOpts.ease = this.config.animation.ease, titleOpts.startAt = action === 'show' ? {
                                opacity: 1,
                                y: direction === 'down' ? '-100%' : '100%'
                            } : {};
                            titleOpts.y = action === 'hide' ? direction === 'down' ? '100%' : '-100%' : '0%'
                        }
                        TweenMax.to(this.DOM.revealer, this.config.animation.duration, revealerOpts);
                        TweenMax.to(this.DOM.imgWrap, this.config.animation.duration, imgOpts);
                        TweenMax.to(this.DOM.title, this.config.animation.duration * 1.5, titleOpts);
                        TweenMax.to(this.DOM.number, this.config.animation.duration, numberOpts)
                    })
                }
                hidePreview(delay) {
                    return this.togglePreview('hide')
                }
                showPreview(delay) {
                    return this.togglePreview('show')
                }
                togglePreview(action) {
                    return new Promise((resolve, reject) => {
                        TweenMax.to(this.DOM.preview.revealer, this.config.animation.duration, {
                            delay: action === 'hide' ? 0 : this.config.animation.duration / 2,
                            ease: this.config.animation.ease,
                            startAt: action === 'hide' ? {
                                x: '0%',
                                y: '-100%'
                            } : {
                                x: '0%',
                                y: '0%'
                            },
                            y: action === 'hide' ? '0%' : '-100%',
                            onComplete: resolve
                        });
                        TweenMax.to(this.DOM.preview.imgWrap, this.config.animation.duration, {
                            delay: action === 'hide' ? 0 : this.config.animation.duration / 2,
                            ease: this.config.animation.ease,
                            startAt: action === 'hide' ? {} : {
                                opacity: 0,
                                y: '20%'
                            },
                            y: action === 'hide' ? '20%' : '0%',
                            opacity: action === 'hide' ? 0 : 1
                        });
                        TweenMax.to([this.DOM.preview.title, this.DOM.preview.content], this.config.animation.duration, {
                            delay: action === 'hide' ? 0 : this.config.animation.duration / 2,
                            ease: this.config.animation.ease,
                            startAt: action === 'hide' ? {} : {
                                opacity: 0,
                                y: '200%'
                            },
                            y: action === 'hide' ? '200%' : '0%',
                            opacity: action === 'hide' ? 0 : 1
                        })
                    })
                }
            }
            class Slideshow {
                constructor(el) {
                    this.DOM = {
                        el: el
                    };
                    this.DOM.prevCtrl = this.DOM.el.querySelector('.slidenav-item--prev');
                    this.DOM.nextCtrl = this.DOM.el.querySelector('.slidenav-item--next');
                    this.DOM.previewCtrl = this.DOM.el.querySelector('.slidenav-preview');
                    this.slides = [];
                    Array.from(this.DOM.el.querySelectorAll('.slide')).forEach(slideEl => this.slides.push(new Slide(slideEl)));
                    this.slidesTotal = this.slides.length;
                    this.current = 0;
                    this.init()
                }
                init() {
                    this.slides[this.current].setCurrent();
                    this.initEvents()
                }
                initEvents() {
                    this.DOM.prevCtrl.addEventListener('click', () => this.prev());
                    this.DOM.nextCtrl.addEventListener('click', () => this.next());
                    this.DOM.previewCtrl.addEventListener('click', (ev) => {
                        if (this.isAnimating) return;
                        if (ev.target.classList.contains('slidenav-preview--open')) {
                            ev.target.classList.remove('slidenav-preview--open');
                            this.exitPreview()
                        } else {
                            ev.target.classList.add('slidenav-preview--open')
                            this.enterPreview()
                        }
                    })
                }
                prev() {
                    this.navigate('left')
                }
                next() {
                    this.navigate('right')
                }
                enterPreview() {
                    this.togglePreview('enter')
                }
                exitPreview() {
                    this.togglePreview('exit')
                }
                togglePreview(action) {
                    if (this.isAnimating) return;
                    this.isAnimating = !0;
                    const processing = action === 'enter' ? [this.slides[this.current].hide('up'), this.slides[this.current].showPreview()] : [this.slides[this.current].show('down'), this.slides[this.current].hidePreview()];
                    this.toggleNavCtrls(action);
                    Promise.all(processing).then(() => this.isAnimating = !1)
                }
                toggleNavCtrls(action) {
                    TweenMax.to([this.DOM.prevCtrl, this.DOM.nextCtrl], 0.5, {
                        ease: 'Expo.easeOut',
                        opacity: action === 'enter' ? 0 : 1,
                        onStart: () => this.DOM.prevCtrl.style.pointerEvents = this.DOM.nextCtrl.style.pointerEvents = action === 'enter' ? 'none' : 'auto'
                    })
                }
                navigate(direction) {
                    if (this.isAnimating) return;
                    this.isAnimating = !0;
                    const nextSlidePos = direction === 'right' ? this.current < this.slidesTotal - 1 ? this.current + 1 : 0 : this.current > 0 ? this.current - 1 : this.slidesTotal - 1;
                    Promise.all([this.slides[this.current].hide(direction), this.slides[nextSlidePos].show(direction)]).then(() => {
                        this.slides[this.current].setCurrent(!1);
                        this.current = nextSlidePos;
                        this.isAnimating = !1;
                        this.slides[this.current].setCurrent()
                    })
                }
            }
            const slideshow = new Slideshow(document.querySelector('.motion-reveal-slider-wrapper.slideshow'))
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-testimonial-card.default', function ($scope) {
            jQuery(".testimonials-card-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = jQuery(this).attr('data-timer');
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                jQuery(this).owlCarousel({
                    loop: !0,
                    center: !0,
                    items: 3,
                    margin: 0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: 3
                        }
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-testimonial-slider.default', function ($scope) {
            jQuery(".testimonials-slider-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = jQuery(this).attr('data-timer');
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                jQuery(this).owlCarousel({
                    loop: !0,
                    center: !0,
                    margin: 0,
                    nav: !0,
                    autoplay: autoPlay,
                    autoplayTimeout: timer,
                    smartSpeed: 300,
                    navText: ['<span class="arrow-left"></span>', '<span class="arrow-right"></span>'],
                    responsive: {
                        0: {
                            items: 1
                        },
                        600: {
                            items: 1
                        },
                        800: {
                            items: 1
                        },
                        1024: {
                            items: 1
                        }
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-image-carousel.default', function ($scope) {
            jQuery(".image-carousel-slider-wrapper").each(function () {
                jQuery(this).find('.carousel-item').eq(0).addClass('active');
                var total = jQuery(this).find('.carousel-item').length;
                var current = 0;
                var slideObj = jQuery(this);
                jQuery(this).find('#moveRight').on('click', function () {
                    var next = current;
                    current = current + 1;
                    setSlide(next, current, slideObj)
                });
                jQuery(this).find('#moveLeft').on('click', function () {
                    var prev = current;
                    current = current - 1;
                    setSlide(prev, current, slideObj)
                });

                function setSlide(prev, next, slideObj) {
                    var slide = current;
                    if (next > total - 1) {
                        slide = 0;
                        current = 0
                    }
                    if (next < 0) {
                        slide = total - 1;
                        current = total - 1
                    }
                    slideObj.find('.carousel-item').eq(prev).removeClass('active');
                    slideObj.find('.carousel-item').eq(slide).addClass('active');
                    setTimeout(function () {}, 800)
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-grid.default', function ($scope) {
            jQuery(".portfolio_grid_container").each(function () {
                var containderDiv = jQuery(this);
                var selectedClass = "";
                containderDiv.find(".filter-tag-btn").on('click', function () {
                    containderDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containderDiv.find(".portfolio-grid-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-grid-wrapper").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-grid-wrapper.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-grid-wrapper.scale-anm").length;
                        gridDiv.find(".portfolio-grid-wrapper.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-grid-overlay.default', function ($scope) {
            jQuery(".portfolio-grid-overlay-container").each(function () {
                var containderDiv = jQuery(this);
                var selectedClass = "";
                containderDiv.find(".portfolio-grid-wrapper-overlay").imagesLoaded().always(function () {
                    var currentWrapper = containderDiv.find(".portfolio-grid-wrapper-overlay");
                    var currentImg = containderDiv.find(".portfolio-grid-wrapper-overlay img");
                    currentWrapper.css('height', currentImg.height() + 'px')
                });
                jQuery(window).resize(function () {
                    containderDiv.find(".portfolio-grid-wrapper-overlay").each(function () {
                        var currentImg = jQuery(this).find("img");
                        jQuery(this).css('height', currentImg.height() + 'px')
                    })
                });
                containderDiv.find(".filter-tag-btn").on('click', function () {
                    containderDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containderDiv.find(".portfolio-grid-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-grid-wrapper-overlay").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-grid-wrapper-overlay").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-grid-wrapper-overlay.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-grid-wrapper-overlay.scale-anm").length;
                        gridDiv.find(".portfolio-grid-wrapper-overlay.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-3d-overlay.default', function ($scope) {
            jQuery(".portfolio-grid-overlay-container").each(function () {
                var containderDiv = jQuery(this);
                var selectedClass = "";
                containderDiv.find(".portfolio-grid-wrapper-overlay").imagesLoaded().always(function () {
                    var currentWrapper = containderDiv.find(".portfolio-grid-wrapper-overlay");
                    var currentImg = containderDiv.find(".portfolio-grid-wrapper-overlay img");
                    currentWrapper.css('height', currentImg.height() + 'px')
                });
                jQuery(window).resize(function () {
                    containderDiv.find(".portfolio-grid-wrapper-overlay").each(function () {
                        var currentImg = jQuery(this).find("img");
                        jQuery(this).css('height', currentImg.height() + 'px')
                    })
                });
                if (!is_touch_device()) {
                    var scaleTilt = 1.1;
                    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
                        scaleTilt = 1
                    }
                    containderDiv.find(".grid_tilt").tilt({
                        scale: scaleTilt,
                        perspective: 2000,
                        glare: !0,
                        maxGlare: .5
                    })
                }
                if (!elementorFrontend.isEditMode()) {
                    containderDiv.find(".portfolio-grid-wrapper-overlay").on('click', function () {
                        window.location = jQuery(this).find("a").first().attr("href")
                    })
                }
                containderDiv.find(".filter-tag-btn").on('click', function () {
                    containderDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containderDiv.find(".portfolio-grid-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-grid-wrapper-overlay").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-grid-wrapper-overlay").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).fadeIn().addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-grid-wrapper-overlay.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-grid-wrapper-overlay.scale-anm").length;
                        gridDiv.find(".portfolio-grid-wrapper-overlay.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-classic.default', function ($scope) {
            jQuery(".portfolio-classic-container").each(function () {
                var containderDiv = jQuery(this);
                var selectedClass = "";
                containderDiv.find(".filter-tag-btn").on('click', function () {
                    containderDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containderDiv.find(".portfolio-classic-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-classic-grid-wrapper").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-classic-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-classic-grid-wrapper.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").length;
                        gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-contain.default', function ($scope) {
            jQuery(".portfolio-classic-container.contain").each(function () {
                var containderDiv = jQuery(this);
                var selectedClass = "";
                containderDiv.find(".filter-tag-btn").on('click', function () {
                    containderDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containderDiv.find(".portfolio-classic-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-classic-grid-wrapper").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-classic-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-classic-grid-wrapper.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").length;
                        gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-navigation-menu.default', function ($scope) {
            jQuery('.themegoods-navigation-wrapper .nav li.menu-item').hover(function () {
                jQuery('.themegoods-navigation-wrapper .nav li.menu-item ul').removeClass('visible');
                jQuery('.themegoods-navigation-wrapper .nav li.menu-item ul').removeClass('hover');
                jQuery('.themegoods-navigation-wrapper .nav li.menu-item .elementor-megamenu-wrapper').removeClass('visible');
                jQuery('.themegoods-navigation-wrapper .nav li.menu-item .elementor-megamenu-wrapper').removeClass('hover');
                jQuery(this).children('ul:first').addClass('visible');
                jQuery(this).children('ul:first').addClass('hover');
                jQuery(this).children('.elementor-megamenu-wrapper:first').addClass('visible');
                jQuery(this).children('.elementor-megamenu-wrapper:first').addClass('hover')
            }, function () {
                jQuery(this).children('ul:first').stop().removeClass('visible');
                jQuery(this).children('ul:first').stop().removeClass('hover');
                jQuery(this).children('.elementor-megamenu-wrapper:first').stop().removeClass('visible');
                jQuery(this).children('.elementor-megamenu-wrapper:first').stop().removeClass('hover')
            });
            jQuery('.themegoods-navigation-wrapper .nav li.menu-item').children('ul:first.hover').hover(function () {
                jQuery(this).stop().addClass('visible')
            }, function () {
                jQuery(this).stop().removeClass('visible')
            });
            jQuery('.themegoods-navigation-wrapper .nav li.menu-item').children('.elementor-megamenu-wrapper.hover').hover(function () {
                jQuery(this).stop().addClass('visible')
            }, function () {
                jQuery(this).stop().removeClass('visible')
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-video-grid.default', function ($scope) {
            jQuery(".portfolio-classic-container.video-grid").each(function () {
                var containerDiv = jQuery(this);
                var selectedClass = "";
                containerDiv.find(".filter-tag-btn").on('click', function () {
                    containerDiv.find(".filter-tag-btn").removeClass("active");
                    jQuery(this).addClass("active");
                    selectedClass = jQuery(this).attr("data-rel");
                    column = jQuery(this).attr("data-cols");
                    var gridDiv = containerDiv.find(".portfolio-classic-content-wrapper");
                    gridDiv.fadeTo(100, 0);
                    gridDiv.find(".portfolio-classic-grid-wrapper").css({
                        opacity: 0,
                        display: 'none',
                        transform: 'scale(0.0)'
                    });
                    gridDiv.find(".portfolio-classic-grid-wrapper").not("." + selectedClass).fadeOut().removeClass('scale-anm');
                    setTimeout(function () {
                        jQuery("." + selectedClass).addClass('scale-anm');
                        jQuery("." + selectedClass).css({
                            opacity: 1,
                            display: 'block',
                            transform: 'scale(1,1)'
                        });
                        gridDiv.find(".portfolio-classic-grid-wrapper.last").removeClass('last');
                        var count = gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").length;
                        gridDiv.find(".portfolio-classic-grid-wrapper.scale-anm").each(function (index) {
                            var lastIndex = parseInt(index + 1);
                            if (lastIndex % column == 0) {
                                jQuery(this).addClass('last')
                            }
                            if (lastIndex == count) {
                                setTimeout(function () {
                                    gridDiv.fadeTo(300, 1)
                                }, 300)
                            }
                        })
                    }, 300)
                })
            });
            jQuery(".portfolio-classic-content-wrapper.video-grid .video-grid-wrapper").each(function () {
                var video = this.getElementsByClassName("video-card")[0];
                var id = jQuery(video).data('video-id');
                var play = document.createElement("div");
                var outline = document.createElement("div");
                var ring = document.createElement("div");
                var fill = document.createElement("div");
                var mask = document.createElement("div");
                var wipe = document.createElement("div");
                var wrap = document.createElement("div");
                var iframe = '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
                TweenMax.set(play, {
                    css: {
                        width: 0,
                        height: 0,
                        "border-top": "10px solid transparent",
                        "border-bottom": "10px solid transparent",
                        "border-left": "14px solid white",
                        "z-index": 50,
                        position: 'absolute',
                        top: "50%",
                        left: "50%",
                        marginLeft: "-4px",
                        marginTop: "-9px"
                    }
                });
                TweenMax.set(outline, {
                    css: {
                        width: 65,
                        height: 65,
                        border: "3px solid white",
                        "border-radius": "999px",
                        "z-index": 50,
                        position: 'absolute',
                        top: "50%",
                        left: "50%",
                        y: "-50%",
                        x: "-50%"
                    }
                });
                TweenMax.set(ring, {
                    css: {
                        width: 65,
                        height: 65,
                        border: "1px solid white",
                        "border-radius": "999px",
                        "z-index": 50,
                        position: 'absolute',
                        top: "50%",
                        left: "50%",
                        y: "-50%",
                        x: "-50%"
                    }
                });
                TweenMax.set(fill, {
                    css: {
                        width: 65,
                        opacity: 0,
                        height: 65,
                        "background-color": "white",
                        "border-radius": "999px",
                        "z-index": 50,
                        position: 'absolute',
                        top: "50%",
                        left: "50%",
                        y: "-50%",
                        x: "-50%"
                    }
                });
                TweenMax.set(mask, {
                    css: {
                        width: 600,
                        height: 600,
                        scale: 1,
                        opacity: 0,
                        backgroundColor: "#fff",
                        "border-radius": "300px",
                        "z-index": 51,
                        position: 'absolute',
                        top: "50%",
                        left: "50%",
                        y: "-50%",
                        x: "-50%"
                    }
                });
                TweenMax.set(wipe, {
                    css: {
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        backgroundColor: "#fff",
                        "z-index": 53,
                        position: 'absolute',
                        top: "0",
                        right: "0"
                    }
                });
                TweenMax.set(wrap, {
                    css: {
                        width: "100%",
                        height: "100%",
                        autoAlpha: 0,
                        "z-index": 52,
                        position: 'absolute',
                        top: "0",
                        left: "0"
                    }
                });
                video.appendChild(play);
                video.appendChild(outline);
                video.appendChild(ring);
                video.appendChild(fill);
                video.appendChild(mask);
                video.appendChild(wipe);
                jQuery(wrap).html(iframe);
                video.appendChild(wrap);
                jQuery(video).on("mouseenter", function (event) {
                    TweenLite.killTweensOf([fill, outline, ring]);
                    TweenLite.to(fill, 0.4, {
                        opacity: 0.2,
                        ease: "cubic-bezier(0.39, 0.575, 0.565, 1)"
                    });
                    TweenLite.to(outline, 0.4, {
                        scale: 0.9,
                        ease: "cubic-bezier(0.39, 0.575, 0.565, 1)"
                    });
                    TweenLite.fromTo(ring, 0.7, {
                        scale: 1,
                        opacity: 0.5
                    }, {
                        scale: 2,
                        opacity: 0,
                        ease: "cubic-bezier(0.165, 0.84, 0.44, 1)"
                    });
                    TweenLite.to(play, 0.2, {
                        x: 8,
                        opacity: 0,
                        ease: "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
                        onComplete: function () {
                            TweenLite.set(play, {
                                x: -12,
                                onComplete: function () {
                                    TweenLite.to(play, 0.4, {
                                        x: 0,
                                        opacity: 1,
                                        ease: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
                                    })
                                }
                            })
                        }
                    })
                });
                jQuery(video).on("mouseleave", function (event) {
                    TweenLite.killTweensOf([fill, outline]);
                    TweenLite.to(fill, 0.4, {
                        opacity: 0,
                        ease: "cubic-bezier(0.39, 0.575, 0.565, 1)"
                    });
                    TweenLite.to(outline, 0.4, {
                        scale: 1,
                        ease: "cubic-bezier(0.39, 0.575, 0.565, 1)"
                    })
                });
                jQuery(video).on("click", function (event) {
                    event.preventDefault();
                    TweenLite.fromTo(mask, 0.35, {
                        opacity: 1,
                        scale: 0
                    }, {
                        scale: 1,
                        ease: "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
                        onComplete: function () {
                            TweenLite.set(mask, {
                                opacity: 0,
                                scale: 0,
                                delay: 0.5,
                                onComplete: function () {
                                    TweenLite.fromTo(wipe, 0.4, {
                                        width: "100%",
                                    }, {
                                        width: 0,
                                        ease: "cubic-bezier(.42,0,.58,1)"
                                    })
                                }
                            });
                            TweenLite.set(wipe, {
                                opacity: 1,
                            });
                            TweenLite.set(wrap, {
                                autoAlpha: 1,
                            })
                        }
                    })
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-coverflow.default', function ($scope) {
            jQuery(".portfolio-coverflow").each(function () {
                var initialSlide = 0;
                initialSlide = parseInt(jQuery(this).attr('data-initial') - 1);
                var coverflowSwiper = new Swiper(jQuery(this), {
                    grabCursor: !0,
                    centeredSlides: !0,
                    slidesPerView: 'auto',
                    spaceBetween: 50,
                    keyboard: {
                        enabled: !0,
                        onlyInViewport: !1,
                    },
                    pagination: {
                        el: '.swiper-pagination',
                    },
                    initialSlide: initialSlide
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-glitch-slideshow.default', function ($scope) {
            class Slide {
                constructor(el) {
                    this.DOM = {
                        el: el
                    };
                    this.DOM.slideImg = this.DOM.el.querySelector('.slide-img');
                    this.bgImage = this.DOM.slideImg.style.backgroundImage;
                    this.layout()
                }
                layout() {
                    this.DOM.slideImg.innerHTML = `<div class='glitch-img' style='background-image: ${this.DOM.slideImg.style.backgroundImage};'></div>`.repeat(5);
                    this.DOM.glitchImgs = Array.from(this.DOM.slideImg.querySelectorAll('.glitch-img'))
                }
                changeBGImage(bgimage, pos = 0, delay = 0) {
                    setTimeout(() => this.DOM.glitchImgs[pos].style.backgroundImage = bgimage, delay)
                }
            }
            class GlitchSlideshow {
                constructor(el) {
                    this.DOM = {
                        el: el
                    };
                    this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slide'));
                    this.slidesTotal = this.DOM.slides.length;
                    this.slides = [];
                    this.DOM.slides.forEach(slide => this.slides.push(new Slide(slide)));
                    this.current = 0;
                    this.glitchTime = 1800;
                    this.totalGlitchSlices = 5
                }
                glitch(slideFrom, slideTo) {
                    return new Promise((resolve, reject) => {
                        slideFrom.DOM.slideImg.classList.add('glitch--animate');
                        const slideFromBGImage = slideFrom.bgImage;
                        const slideToBGImage = slideTo.bgImage;
                        for (let i = this.totalGlitchSlices - 1; i >= 0; --i) {
                            slideFrom.changeBGImage(slideToBGImage, i, this.glitchTime / (this.totalGlitchSlices + 1) * (this.totalGlitchSlices - i - 1) + this.glitchTime / (this.totalGlitchSlices + 1))
                        }
                        setTimeout(() => {
                            slideFrom.DOM.slideImg.classList.remove('glitch--animate');
                            for (let i = this.totalGlitchSlices - 1; i >= 0; --i) {
                                slideFrom.changeBGImage(slideFromBGImage, i, 0)
                            }
                            resolve()
                        }, this.glitchTime)
                    })
                }
                navigate(dir) {
                    if (this.isAnimating) return;
                    this.isAnimating = !0;
                    const newCurrent = dir === 'next' ? this.current < this.slidesTotal - 1 ? this.current + 1 : 0 : this.current > 0 ? this.current - 1 : this.slidesTotal - 1;
                    this.glitch(this.slides[this.current], this.slides[newCurrent]).then(() => {
                        this.DOM.slides[this.current].classList.remove('slide-current');
                        this.current = newCurrent;
                        this.DOM.slides[this.current].classList.add('slide-current');
                        this.isAnimating = !1
                    })
                }
            }
            imagesLoaded(document.querySelectorAll('.slide-img'), {
                background: !0
            }, () => {
                document.body.classList.remove('loading');
                const slideshow = new GlitchSlideshow(document.querySelector('.slides'));
                const nav = Array.from(document.querySelectorAll('.slide-nav-button'));
                nav[0].addEventListener('click', () => slideshow.navigate('prev'));
                nav[1].addEventListener('click', () => slideshow.navigate('next'))
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-music-player.default', function ($scope) {
            jQuery(".grandconference-music-player").each(function () {
                var containerDiv = jQuery(this);
                var songIndex = 0;
                var audio = new Audio();
                var $audio = jQuery(audio);
                var handleDrag = !1;
                var timeIn = 0;
                var songListID = containerDiv.attr('data-songlist');
                var playlist = JSON.parse(jQuery('#' + songListID).val());
                const $player = containerDiv.find('.player'),
                    $poster = containerDiv.find('.player-img'),
                    $background = containerDiv.find('.player-background'),
                    $title = containerDiv.find('.player-title'),
                    $artist = containerDiv.find('.player-artist'),
                    $prev = containerDiv.find('.player-controls__prev'),
                    $next = containerDiv.find('.player-controls__next'),
                    $play = containerDiv.find('.player-controls__play'),
                    $scrubber = containerDiv.find('.player-scrubber'),
                    $handle = containerDiv.find('.player-scrubber-handle'),
                    $fill = containerDiv.find('.player-scrubber__fill'),
                    $time = containerDiv.find('.player-time__played'),
                    $dur = containerDiv.find('.player-time__duration');

                function time(seconds) {
                    seconds = Math.floor(seconds);
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    return mins + ":" + (secs < 10 ? "0" : "") + secs
                }

                function changeSong(offset, play) {
                    songIndex += offset;
                    if (songIndex > playlist.length - 1) songIndex = 0;
                    if (songIndex < 0) songIndex = playlist.length - 1;
                    $audio.attr('src', playlist[songIndex].mp3);
                    const src = playlist[songIndex].poster;
                    $title.text(playlist[songIndex].title);
                    $artist.text(playlist[songIndex].artist);
                    $dur.text("-:--");
                    $audio.on('loadedmetadata', function () {
                        $dur.text(time(audio.duration));
                        setHandle(0, audio.duration)
                    });
                    $audio.on('ended', () => changeSong(+1, !0));
                    var img = new Image();
                    jQuery(img).attr("src", src).on("load", function () {
                        $poster.attr('src', src);
                        $background.css('background-image', 'url("' + src + '")')
                    }).on("error", function () {
                        console.log("Cannot find image")
                    });
                    if (play) {
                        audio.play();
                        $play.find('i').removeClass('fa-play').addClass('fa-pause')
                    } else {
                        $play.find('i').removeClass('fa-pause').addClass('fa-play')
                    }
                }

                function setHandle(seconds, duration) {
                    const percent = seconds / duration * 100;
                    $time.text(time(seconds));
                    $handle.css('left', percent + "%");
                    $fill.css('width', percent + "%")
                }
                $play.click(function () {
                    if (audio.currentTime > 0 && !audio.paused) {
                        audio.pause();
                        $play.find('i').removeClass('fa-pause').addClass('fa-play')
                    } else {
                        audio.play();
                        $play.find('i').removeClass('fa-play').addClass('fa-pause')
                    }
                });
                $prev.click(() => changeSong(-1, !0));
                $next.click(() => changeSong(+1, !0));
                $audio.on("timeupdate", () => {
                    setHandle(audio.currentTime, audio.duration)
                });
                $handle.on('mousedown', function () {
                    handleDrag = !0;
                    audio.pause()
                });
                $player.on('mousemove', function (e) {
                    if (handleDrag) {
                        const width = $scrubber.width();
                        var diff = $scrubber.offset().left - e.clientX;
                        var percent = -diff / width * 100;
                        percent = (percent < 0 ? 0 : (percent > 100 ? 100 : percent));
                        var seconds = percent / 100 * audio.duration;
                        setHandle(seconds, audio.duration);
                        timeIn = seconds
                    }
                }).on('mouseup mouseleave', function () {
                    if (handleDrag) {
                        handleDrag = !1;
                        audio.currentTime = timeIn;
                        $play.find('i').removeClass('fa-pause').addClass('fa-play')
                    }
                });
                changeSong(0, !1)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-mouse-driven-vertical-carousel.default', function ($scope) {
            class VerticalMouseDrivenCarousel {
                constructor(options = {}) {
                    const _defaults = {
                        carousel: ".mouse-driven-vertical-carousel-wrapper .js-carousel",
                        bgImg: ".js-carousel-bg-img",
                        list: ".js-carousel-list",
                        listItem: ".js-carousel-list-item"
                    };
                    this.posY = 0;
                    this.defaults = Object.assign({}, _defaults, options);
                    this.initCursor();
                    this.init();
                    this.bgImgController()
                }
                getBgImgs() {
                    return document.querySelectorAll(this.defaults.bgImg)
                }
                getListItems() {
                    return document.querySelectorAll(this.defaults.listItem)
                }
                getList() {
                    return document.querySelector(this.defaults.list)
                }
                getCarousel() {
                    return document.querySelector(this.defaults.carousel)
                }
                init() {
                    TweenMax.set(this.getBgImgs(), {
                        autoAlpha: 0,
                        scale: 1.05
                    });
                    TweenMax.set(this.getBgImgs()[0], {
                        autoAlpha: 1,
                        scale: 1
                    });
                    this.listItems = this.getListItems().length - 1;
                    this.listOpacityController(0)
                }
                initCursor() {
                    if (jQuery(window).width() > 1024) {
                        const listHeight = this.getList().clientHeight;
                        const carouselHeight = this.getCarousel().clientHeight;
                        const carouselPos = this.getCarousel().getBoundingClientRect();
                        const carouselPosY = parseInt(carouselPos.top);
                        this.getCarousel().addEventListener("mousemove", event => {
                            this.posY = parseInt(event.pageY - carouselPosY) - this.getCarousel().offsetTop;
                            let offset = -this.posY / carouselHeight * listHeight;
                            TweenMax.to(this.getList(), 0.3, {
                                y: offset,
                                ease: Power4.easeOut
                            })
                        }, !1)
                    }
                }
                bgImgController() {
                    for (const link of this.getListItems()) {
                        link.addEventListener("mouseenter", ev => {
                            let currentId = ev.currentTarget.dataset.itemId;
                            this.listOpacityController(currentId);
                            TweenMax.to(ev.currentTarget, 0.3, {
                                autoAlpha: 1
                            });
                            TweenMax.to(".is-visible", 0.2, {
                                autoAlpha: 0,
                                scale: 1.05
                            });
                            if (!this.getBgImgs()[currentId].classList.contains("is-visible")) {
                                this.getBgImgs()[currentId].classList.add("is-visible")
                            }
                            TweenMax.to(this.getBgImgs()[currentId], 0.6, {
                                autoAlpha: 1,
                                scale: 1
                            })
                        })
                    }
                }
                listOpacityController(id) {
                    id = parseInt(id);
                    let aboveCurrent = this.listItems - id;
                    let belowCurrent = parseInt(id);
                    if (aboveCurrent > 0) {
                        for (let i = 1; i <= aboveCurrent; i++) {
                            let opacity = 0.5 / i;
                            let offset = 5 * i;
                            TweenMax.to(this.getListItems()[id + i], 0.5, {
                                autoAlpha: opacity,
                                x: offset,
                                ease: Power3.easeOut
                            })
                        }
                    }
                    if (belowCurrent > 0) {
                        for (let i = 0; i <= belowCurrent; i++) {
                            let opacity = 0.5 / i;
                            let offset = 5 * i;
                            TweenMax.to(this.getListItems()[id - i], 0.5, {
                                autoAlpha: opacity,
                                x: offset,
                                ease: Power3.easeOut
                            })
                        }
                    }
                }
            }
            new VerticalMouseDrivenCarousel()
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-synchronized-carousel.default', function ($scope) {
            jQuery(".synchronized-carousel-slider-wrapper").each(function () {
                var sliderID = jQuery(this).attr('id');
                var slidersContainer = document.querySelector("#" + sliderID);
                var countSlide = jQuery(this).attr('data-countslide');
                var msNumbers = new MomentumSlider({
                    el: slidersContainer,
                    cssClass: "ms--numbers",
                    range: [1, countSlide],
                    rangeContent: function (i) {
                        return "0" + i
                    },
                    style: {
                        transform: [{
                            scale: [0.4, 1]
                        }],
                        opacity: [0, 1]
                    },
                    interactive: !1
                });
                var titles = JSON.parse(jQuery(this).attr('data-slidetitles'));
                var msTitles = new MomentumSlider({
                    el: slidersContainer,
                    cssClass: "ms--titles",
                    range: [0, parseInt(countSlide - 1)],
                    rangeContent: function (i) {
                        return "<h3>" + titles[i] + "</h3>"
                    },
                    vertical: !0,
                    reverse: !0,
                    style: {
                        opacity: [0, 1]
                    },
                    interactive: !1
                });
                var buttonTitles = JSON.parse(jQuery(this).attr('data-slidebuttontitles'));
                var buttonUrls = JSON.parse(jQuery(this).attr('data-slidebuttonurls'));
                var msLinks = new MomentumSlider({
                    el: slidersContainer,
                    cssClass: "ms--links",
                    range: [0, parseInt(countSlide - 1)],
                    rangeContent: function (i) {
                        return "<a href=\"" + buttonUrls[i] + "\" class=\"ms-slide-link\">" + buttonTitles[i] + "</a>"
                    },
                    vertical: !0,
                    interactive: !1
                });
                var paginationID = jQuery(this).attr('data-pagination');
                var pagination = document.querySelector("#" + paginationID);
                var paginationItems = [].slice.call(pagination.children);
                var images = JSON.parse(jQuery(this).attr('data-slideimages'));
                var msImages = new MomentumSlider({
                    el: slidersContainer,
                    cssClass: "ms--images",
                    range: [0, parseInt(countSlide - 1)],
                    rangeContent: function (i) {
                        return "<div class=\"ms-slide-image-container\"><div class=\"ms-slide-image\" style=\"background-image: url('" + images[i] + "')\"></div></div>"
                    },
                    sync: [msNumbers, msTitles, msLinks],
                    style: {
                        ".ms-slide-image": {
                            transform: [{
                                scale: [1.5, 1]
                            }]
                        }
                    },
                    change: function (newIndex, oldIndex) {
                        if (typeof oldIndex !== "undefined") {
                            paginationItems[oldIndex].classList.remove("pagination-item--active")
                        }
                        paginationItems[newIndex].classList.add("pagination-item--active")
                    }
                });
                pagination.addEventListener("click", function (e) {
                    if (e.target.matches(".pagination-button")) {
                        var index = paginationItems.indexOf(e.target.parentNode);
                        msImages.select(index)
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-flip-box.default', function ($scope) {
            var countSquare = jQuery('.square').length;
            for (i = 0; i < countSquare; i++) {
                var firstImage = jQuery('.square').eq([i]);
                var secondImage = jQuery('.square2').eq([i]);
                var getImage = firstImage.attr('data-image');
                var getImage2 = secondImage.attr('data-image');
                firstImage.css('background-image', 'url(' + getImage + ')');
                secondImage.css('background-image', 'url(' + getImage2 + ')')
            }
            jQuery('.flip-box-wrapper').on('click', function () {
                jQuery(this).trigger("mouseover")
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-slider-zoom.default', function ($scope) {
            var _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || !1;
                        descriptor.configurable = !0;
                        if ("value" in descriptor) descriptor.writable = !0;
                        Object.defineProperty(target, descriptor.key, descriptor)
                    }
                }
                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor
                }
            }();

            function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                    throw new TypeError("Cannot call a class as a function")
                }
            }
            var $window = $(window);
            var $body = $('body');
            var Slideshow = function () {
                function Slideshow() {
                    var _this = this;
                    var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                    _classCallCheck(this, Slideshow);
                    var timer = $('.slider-zoom-wrapper').attr('data-autoplay');
                    var autoplay = !0;
                    if (timer == 0) {
                        timer = !1;
                        autoplay = !1
                    }
                    var pagination = $('.slider-zoom-wrapper').attr('data-pagination');
                    if (pagination == 0) {
                        var pagination = !1
                    } else {
                        var pagination = !0
                    }
                    var defaultOptions = {
                        $el: $('.slider-zoom-wrapper'),
                        showArrows: !1,
                        showPagination: !1,
                        duration: timer,
                        autoplay: autoplay
                    };
                    var options = Object.assign({}, defaultOptions, userOptions);
                    this.$el = options.$el;
                    this.maxSlide = this.$el.find($('.js-slider-home-slide')).length;
                    this.showArrows = this.maxSlide > 1 ? options.showArrows : !1;
                    this.showPagination = pagination;
                    this.currentSlide = 1;
                    this.isAnimating = !1;
                    this.animationDuration = 1200;
                    this.autoplaySpeed = options.duration;
                    this.interval;
                    this.$controls = this.$el.find('.js-slider-home-button');
                    this.autoplay = this.maxSlide > 1 ? options.autoplay : !1;
                    this.$el.on('click', '.js-slider-home-next', function (event) {
                        return _this.nextSlide()
                    });
                    this.$el.on('click', '.js-slider-home-prev', function (event) {
                        return _this.prevSlide()
                    });
                    this.$el.on('click', '.js-pagination-item', function (event) {
                        if (!_this.isAnimating) {
                            _this.preventClick();
                            _this.goToSlide(event.target.dataset.slide)
                        }
                    });
                    this.init()
                }
                _createClass(Slideshow, [{
                    key: 'init',
                    value: function init() {
                        this.goToSlide(1);
                        if (this.autoplay) {
                            this.startAutoplay()
                        }
                        if (this.showPagination) {
                            var paginationNumber = this.maxSlide;
                            var pagination = '<div class="pagination"><div class="container">';
                            for (var i = 0; i < this.maxSlide; i++) {
                                var item = '<span class="pagination-item js-pagination-item ' + (i === 0 ? 'is-current' : '') + '" data-slide=' + (i + 1) + '>' + (i + 1) + '</span>';
                                pagination = pagination + item
                            }
                            pagination = pagination + '</div></div>';
                            this.$el.append(pagination)
                        }
                    }
                }, {
                    key: 'preventClick',
                    value: function preventClick() {
                        var _this2 = this;
                        this.isAnimating = !0;
                        this.$controls.prop('disabled', !0);
                        clearInterval(this.interval);
                        setTimeout(function () {
                            _this2.isAnimating = !1;
                            _this2.$controls.prop('disabled', !1);
                            if (_this2.autoplay) {
                                _this2.startAutoplay()
                            }
                        }, this.animationDuration)
                    }
                }, {
                    key: 'goToSlide',
                    value: function goToSlide(index) {
                        this.currentSlide = parseInt(index);
                        if (this.currentSlide > this.maxSlide) {
                            this.currentSlide = 1
                        }
                        if (this.currentSlide === 0) {
                            this.currentSlide = this.maxSlide
                        }
                        var newCurrent = this.$el.find('.js-slider-home-slide[data-slide="' + this.currentSlide + '"]');
                        var newPrev = this.currentSlide === 1 ? this.$el.find('.js-slider-home-slide').last() : newCurrent.prev('.js-slider-home-slide');
                        var newNext = this.currentSlide === this.maxSlide ? this.$el.find('.js-slider-home-slide').first() : newCurrent.next('.js-slider-home-slide');
                        this.$el.find('.js-slider-home-slide').removeClass('is-prev is-next is-current');
                        this.$el.find('.js-pagination-item').removeClass('is-current');
                        if (this.maxSlide > 1) {
                            newPrev.addClass('is-prev');
                            newNext.addClass('is-next')
                        }
                        newCurrent.addClass('is-current');
                        this.$el.find('.js-pagination-item[data-slide="' + this.currentSlide + '"]').addClass('is-current')
                    }
                }, {
                    key: 'nextSlide',
                    value: function nextSlide() {
                        this.preventClick();
                        this.goToSlide(this.currentSlide + 1)
                    }
                }, {
                    key: 'prevSlide',
                    value: function prevSlide() {
                        this.preventClick();
                        this.goToSlide(this.currentSlide - 1)
                    }
                }, {
                    key: 'startAutoplay',
                    value: function startAutoplay() {
                        var _this3 = this;
                        this.interval = setInterval(function () {
                            if (!_this3.isAnimating) {
                                _this3.nextSlide()
                            }
                        }, this.autoplaySpeed)
                    }
                }, {
                    key: 'destroy',
                    value: function destroy() {
                        this.$el.off()
                    }
                }]);
                return Slideshow
            }();
            (function () {
                var loaded = !1;
                var maxLoad = 3000;

                function load() {
                    var options = {
                        showPagination: !0
                    };
                    var slideShow = new Slideshow(options)
                }

                function addLoadClass() {
                    $body.addClass('is-loaded');
                    setTimeout(function () {
                        $body.addClass('is-animated')
                    }, 600)
                }
                $window.on('load', function () {
                    if (!loaded) {
                        loaded = !0;
                        load()
                    }
                });
                setTimeout(function () {
                    if (!loaded) {
                        loaded = !0;
                        load()
                    }
                }, maxLoad);
                addLoadClass()
            })()
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-course-grid.default', function ($scope) {
            jQuery('.course_tooltip').tooltipster({
                position: 'right',
                multiple: !0,
                contentCloning: !0,
                theme: 'tooltipster-shadow',
                minWidth: 300,
                maxWidth: 300,
                delay: 50,
                interactive: !0,
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-search.default', function ($scope) {
            jQuery(".grandconference-search-icon").each(function () {
                var iconInput = jQuery(this).find('a');
                iconInput.bind('click', function () {
                    var openDiv = jQuery(this).attr('data-open');
                    jQuery('#' + openDiv).addClass('active');
                    var isTouch = ('ontouchstart' in document.documentElement);
                    if (isTouch) {
                        jQuery('#' + openDiv).find('.grandconference-search-inner').addClass('touch')
                    }
                    jQuery('body').addClass('elementor-no-overflow');
                    jQuery('body').addClass('elementor-search-activate');
                    setTimeout(function () {
                        jQuery('#' + openDiv).find('.tg_search_form.autocomplete_form').find('input#s').trigger('focus')
                    }, 300)
                })
            });
            jQuery(".tg_search_form.autocomplete_form").each(function () {
                var wrapper = jQuery(this).attr('data-open');
                var formInput = jQuery(this).find('input[name="s"]');
                var resultDiv = jQuery(this).attr('data-result');
                var isTouch = ('ontouchstart' in document.documentElement);
                if (!isTouch) {
                    formInput.on('input', function () {
                        if (jQuery(this).val().length > 1) {
                            jQuery.ajax({
                                url: tgAjax.ajaxurl,
                                type: 'POST',
                                data: 'action=grandconference_ajax_search_result&' + jQuery(this).serialize(),
                                success: function (results) {
                                    jQuery("#" + resultDiv).html(results);
                                    if (results != '') {
                                        jQuery("#" + resultDiv).addClass('visible');
                                        jQuery("#" + resultDiv).show();
                                        jQuery("#" + resultDiv).css('z-index', 99);
                                        jQuery("#" + resultDiv + " ul li a").mousedown(function () {
                                            jQuery("#" + resultDiv).addClass('visible');
                                            jQuery("#" + resultDiv).attr('data-mousedown', 'true');
                                            location.href = jQuery(this).attr('href')
                                        })
                                    } else {
                                        jQuery("#" + resultDiv).hide()
                                    }
                                }
                            })
                        } else {
                            jQuery("#" + resultDiv).html('')
                        }
                    })
                }
                formInput.bind('click', function () {
                    jQuery("#" + resultDiv).addClass('visible');
                    jQuery("#" + resultDiv).attr('data-mousedown', 'true')
                });
                formInput.bind('focus', function () {
                    jQuery("#" + resultDiv).addClass('visible');
                    formInput.addClass('visible')
                });
                formInput.bind('blur', function () {
                    jQuery("#" + resultDiv).removeClass('visible');
                    formInput.removeClass('visible')
                });
                jQuery("#" + wrapper).bind('click', function () {
                    if (!formInput.hasClass('visible')) {
                        if (jQuery("#" + resultDiv).attr('data-mousedown') != 'true') {
                            jQuery("#" + resultDiv).removeClass('visible')
                        }
                        jQuery('#' + wrapper).removeClass('active');
                        jQuery('body').removeClass('elementor-no-overflow');
                        jQuery('body').removeClass('elementor-search-activate')
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/image.default', function ($scope) {
            if (elementorFrontend.isEditMode()) {
                var elementSettings = {};
                var modelCID = $scope.data('model-cid');
                var settings = elementorFrontend.config.elements.data[modelCID];
                if (typeof settings != 'undefined') {
                    var type = settings.attributes.widgetType || settings.attributes.elType,
                        settingsKeys = elementorFrontend.config.elements.keys[type];
                    if (!settingsKeys) {
                        settingsKeys = elementorFrontend.config.elements.keys[type] = [];
                        jQuery.each(settings.controls, function (name, control) {
                            if (control.frontend_available) {
                                settingsKeys.push(name)
                            }
                        })
                    }
                    jQuery.each(settings.getActiveControls(), function (controlKey) {
                        if (-1 !== settingsKeys.indexOf(controlKey)) {
                            elementSettings[controlKey] = settings.attributes[controlKey]
                        }
                    });
                    var widgetExt = elementSettings
                }
            } else {
                var widgetExtObj = $scope.attr('data-settings');
                if (typeof widgetExtObj != 'undefined') {
                    var widgetExt = JSON.parse(widgetExtObj)
                }
            }
            if (typeof widgetExt != 'undefined') {
                if (widgetExt.grandconference_image_is_animation == 'true') {
                    $scope.addClass('themegoods-image-animation-' + widgetExt.grandconference_image_animation_effect);
                    $scope.addClass('themegoods-image-animation');
                    $scope.smoove({
                        offset: '30%'
                    })
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-portfolio-carousel.default', function ($scope) {
            jQuery(".portfolio-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var portfolioCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items + 1)
                        },
                        2000: {
                            items: parseInt(items + 2)
                        },
                        2400: {
                            items: parseInt(items + 3)
                        },
                    }
                });
                setTimeout(function () {
                    portfolioCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-service-grid.default', function ($scope) {
            jQuery(".service-grid-wrapper").mouseover(function () {
                var dataHoverY = jQuery(this).attr('data-hoverY');
                jQuery(this).find('.header-wrap').css('transform', 'translateY(-' + dataHoverY + 'px)')
            }).mouseleave(function () {
                jQuery(this).find('.header-wrap').css('transform', 'translateY(0px)')
            });
            jQuery(".service-grid-wrapper").each(function () {
                var hoverContent = jQuery(this).find('.hover-content');
                var hoverMoveY = parseInt(hoverContent.height() + 10);
                jQuery(this).attr('data-hoverY', hoverMoveY)
            });
            jQuery(window).resize(function () {
                jQuery(".service-grid-wrapper").each(function () {
                    var hoverContent = jQuery(this).find('.hover-content');
                    var hoverMoveY = parseInt(hoverContent.height() + 10);
                    jQuery(this).attr('data-hoverY', hoverMoveY)
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-service-carousel.default', function ($scope) {
            jQuery(".service-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var serviceCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items + 1)
                        },
                        2000: {
                            items: parseInt(items + 2)
                        },
                        2400: {
                            items: parseInt(items + 3)
                        },
                    }
                });
                setTimeout(function () {
                    serviceCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-blog-carousel.default', function ($scope) {
            jQuery(".blog-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var blogCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items + 1)
                        },
                        2000: {
                            items: parseInt(items + 2)
                        },
                        2400: {
                            items: parseInt(items + 3)
                        },
                    }
                });
                setTimeout(function () {
                    blogCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-event-carousel.default', function ($scope) {
            jQuery(".event-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var blogCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items + 1)
                        },
                        2000: {
                            items: parseInt(items + 2)
                        },
                        2400: {
                            items: parseInt(items + 3)
                        },
                    }
                });
                setTimeout(function () {
                    blogCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-pricing-table.default', function ($scope) {
            var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
            elems.forEach(function (elem) {
                var switchery = new Switchery(elem, {
                    disabled: !0,
                    disabledOpacity: 1,
                    color: elem.getAttribute('data-switch-bg'),
                    secondaryColor: elem.getAttribute('data-switch-bg'),
                    jackColor: elem.getAttribute('data-switch-button'),
                    jackSecondaryColor: elem.getAttribute('data-switch-button')
                })
            });
            var changeCheckbox = document.querySelector('.js-switch');
            if (!!changeCheckbox) {
                changeCheckbox.onchange = function () {
                    jQuery(".pricing-plan-price").each(function () {
                        if (changeCheckbox.checked) {
                            var pricingPlan = jQuery(this).attr('data-price-year');
                            jQuery(this).html(pricingPlan);
                            jQuery('.pricing-plan-unit-month').addClass('hide');
                            jQuery('.pricing-plan-unit-year').removeClass('hide')
                        } else {
                            var pricingPlan = jQuery(this).attr('data-price-month');
                            jQuery(this).html(pricingPlan);
                            jQuery('.pricing-plan-unit-year').addClass('hide');
                            jQuery('.pricing-plan-unit-month').removeClass('hide')
                        }
                    })
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-food-menu.default', function ($scope) {
            jQuery('.food-tooltip').tooltipster({
                position: 'right',
                multiple: !0,
                contentCloning: !0,
                theme: 'tooltipster-shadow',
                minWidth: 300,
                maxWidth: 300,
                delay: 50,
                interactive: !0,
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-search-form.default', function ($scope) {
            jQuery(".tg-search-form.autocomplete-form").each(function () {
                var formInput = jQuery(this).find('input[name="s"]');
                var resultDiv = jQuery(this).attr('data-result');
                var eventOnly = jQuery(this).attr('data-autocomplete-event');
                formInput.on('input', function () {
                    if (jQuery(this).val().length > 1) {
                        jQuery.ajax({
                            url: tgAjax.ajaxurl,
                            type: 'POST',
                            data: 'action=grandconference_ajax_search_result&search_event=' + eventOnly + '&' + jQuery(this).serialize(),
                            success: function (results) {
                                jQuery("#" + resultDiv).html(results);
                                if (results != '') {
                                    jQuery("#" + resultDiv).addClass('visible');
                                    jQuery("#" + resultDiv).show();
                                    jQuery("#" + resultDiv).css('z-index', 99);
                                    jQuery("#" + resultDiv + " ul li a").mousedown(function () {
                                        jQuery("#" + resultDiv).attr('data-mousedown', !0)
                                    })
                                } else {
                                    jQuery("#" + resultDiv).hide()
                                }
                            }
                        })
                    }
                });
                formInput.bind('focus', function () {
                    jQuery("#" + resultDiv).addClass('visible')
                });
                formInput.bind('blur', function () {
                    if (jQuery("#" + resultDiv).attr('data-mousedown') != 'true') {
                        jQuery("#" + resultDiv).removeClass('visible')
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-animated-headline.default', function ($scope) {
            jQuery(".themegoods-animated-headline").each(function () {
                var animationType = jQuery(this).attr('data-animation');
                jQuery(this).animatedHeadline({
                    animationType: animationType
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-animated-text.default', function ($scope) {
            jQuery(".themegoods-animated-text").each(function () {
                var textContent = jQuery(this).first();
                var delimiterTypeOri = jQuery(this).attr('data-delimiter');
                var delimiterType = jQuery(this).attr('data-delimiter');
                var transitionSpeed = parseInt(jQuery(this).attr('data-transition'));
                var transitionDelay = parseInt(jQuery(this).attr('data-transition-delay'));
                var transitionDuration = parseInt(jQuery(this).attr('data-transition-duration'));
                if (delimiterType == 'sentence') {
                    delimiterType = 'word'
                }
                var animatedText = textContent.blast({
                    delimiter: delimiterType,
                    aria: !1,
                });
                if (jQuery(this).hasClass('overflow-hidden')) {
                    animatedText.each(function (i) {
                        var textEachSpan = jQuery(this);
                        var initialText = textEachSpan.text()
                    })
                }
                if (textContent.isInViewport() && jQuery(this).closest('.fullmenu-wrapper').length != 1) {
                    animatedText.each(function (i) {
                        var delaySpeed = parseInt(transitionDelay + (i * transitionSpeed));
                        if (delimiterTypeOri == 'sentence') {
                            delaySpeed = parseInt(transitionDelay + transitionSpeed)
                        }
                        jQuery(this).queue(function (next) {
                            jQuery(this).css({
                                'transition-delay': delaySpeed + 'ms',
                                'transition-duration': transitionDuration + 'ms',
                                'transform': 'translateX(0px) translateY(0px) translateZ(0px)',
                                'opacity': 1
                            })
                        })
                    })
                }
                jQuery(window).on('resize scroll', function () {
                    if (textContent.isInViewport()) {
                        animatedText.each(function (i) {
                            var delaySpeed = parseInt(transitionDelay + (i * transitionSpeed));
                            if (delimiterTypeOri == 'sentence') {
                                delaySpeed = parseInt(transitionDelay + transitionSpeed)
                            }
                            jQuery(this).queue(function (next) {
                                jQuery(this).css({
                                    'transition-delay': delaySpeed + 'ms',
                                    'transition-duration': transitionDuration + 'ms',
                                    'transform': 'translateX(0px) translateY(0px) translateZ(0px)',
                                    'opacity': 1
                                })
                            })
                        })
                    }
                });
                jQuery('body').on('classChange', function () {
                    if (jQuery(this).hasClass('fullmenu-active')) {
                        animatedText.each(function (i) {
                            var delaySpeed = parseInt(transitionDelay + (i * transitionSpeed));
                            if (delimiterTypeOri == 'sentence') {
                                delaySpeed = parseInt(transitionDelay + transitionSpeed)
                            }
                            jQuery(this).queue(function (next) {
                                jQuery(this).css({
                                    'transition-delay': delaySpeed + 'ms',
                                    'transition-duration': transitionDuration + 'ms',
                                    'transform': 'translateX(0px) translateY(0px) translateZ(0px)',
                                    'opacity': 1
                                })
                            })
                        })
                    }
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-gallery-animated.default', function ($scope) {
            jQuery(".grandconference-gallery-animated-content-wrapper").each(function () {
                var columns = jQuery(this).attr('data-columns');
                if (typeof columns == "undefined") {
                    columns = 7
                }
                var rows = jQuery(this).attr('data-rows');
                if (typeof rows == "undefined") {
                    rows = 1
                }
                var animationType = jQuery(this).attr('data-animation');
                if (typeof animationType == "undefined") {
                    animationType = 'random'
                }
                var animationSpeed = jQuery(this).attr('data-animation-speed');
                if (typeof animationSpeed == "undefined") {
                    animationSpeed = 800
                }
                var intervalTime = jQuery(this).attr('data-interval');
                if (typeof intervalTime == "undefined") {
                    intervalTime = 3000
                }
                jQuery(this).gridrotator({
                    rows: parseInt(rows),
                    maxStep: 2,
                    columns: parseInt(columns),
                    preventClick: !0,
                    animType: animationType,
                    animEasingOut: 'ease',
                    animEasingIn: 'ease',
                    animSpeed: parseInt(animationSpeed),
                    interval: parseInt(intervalTime),
                    w1024: {
                        rows: parseInt(rows),
                        columns: parseInt(columns)
                    },
                    w768: {
                        rows: parseInt(rows),
                        columns: parseInt(columns)
                    },
                    w480: {
                        rows: parseInt(rows),
                        columns: parseInt(columns)
                    },
                    w320: {
                        rows: 1,
                        columns: 3
                    },
                    w240: {
                        rows: 1,
                        columns: 3
                    },
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-team-carousel.default', function ($scope) {
            jQuery(".team-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var teamCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items)
                        },
                        2000: {
                            items: parseInt(items)
                        },
                        2400: {
                            items: parseInt(items)
                        },
                    }
                });
                setTimeout(function () {
                    teamCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-classic-session-fullwidth.default', function ($scope) {
            jQuery(".session-fullwidth-wrapper").each(function () {
                var widgetID = jQuery(this).attr('data-widget-id');
                var grid = jQuery('#' + widgetID).masonry({
                    itemSelector: '.scheduleday_wrapper',
                    columnWidth: ".scheduleday_wrapper",
                    gutter: 40
                });
                jQuery('#' + widgetID + ' li .session_content_wrapper.expandable').on('click', function (e) {
                    var targetID = jQuery(this).attr('data-expandid');
                    jQuery(this).parent('li').find('#' + targetID).toggleClass('hide');
                    jQuery(this).toggleClass('active');
                    grid.masonry()
                });
                jQuery('#session_filter_' + widgetID + ' li a').on('click', function (e) {
                    var targetFilter = jQuery(this).attr('data-filter');
                    jQuery('#session_filter_' + widgetID + ' li a').removeClass('active');
                    jQuery(this).addClass('active');
                    if (targetFilter != '') {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide');
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').each(function () {
                            if (!jQuery(this).hasClass(targetFilter) && !jQuery(this).hasClass('scheduleday_title')) {
                                jQuery(this).addClass('hide')
                            }
                        })
                    } else {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide')
                    }
                    grid.masonry()
                });
                jQuery('#session_expand_' + widgetID).on('click', function (e) {
                    jQuery('#' + widgetID + ' ul.scheduleday_wrapper li .session_content_wrapper.expandable').trigger('click');
                    var expandTitle = jQuery(this).attr('data-expand-title');
                    var collapseTitle = jQuery(this).attr('data-collapse-title');
                    if (jQuery(this).hasClass('do_expand')) {
                        jQuery(this).removeClass('do_expand');
                        jQuery(this).addClass('do_collapse');
                        jQuery(this).html(collapseTitle + ' -')
                    } else {
                        jQuery(this).addClass('do_expand');
                        jQuery(this).removeClass('do_collapse');
                        jQuery(this).html(expandTitle + ' +')
                    }
                    grid.masonry()
                });
                var isExpand = jQuery(this).attr('data-expand');
                if (isExpand == 'yes') {
                    jQuery('#session_expand_' + widgetID).click()
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-classic-session-sidebar.default', function ($scope) {
            jQuery(".session-sidebar-wrapper").each(function () {
                var widgetID = jQuery(this).attr('data-widget-id');
                var grid = jQuery('#' + widgetID).masonry({
                    itemSelector: '.scheduleday_wrapper',
                    columnWidth: ".scheduleday_wrapper",
                    gutter: 40
                });
                jQuery('#' + widgetID + ' li .session_content_wrapper.expandable').on('click', function (e) {
                    var targetID = jQuery(this).attr('data-expandid');
                    jQuery(this).parent('li').find('#' + targetID).toggleClass('hide');
                    jQuery(this).toggleClass('active');
                    grid.masonry()
                });
                jQuery('#session_filter_' + widgetID + ' li a').on('click', function (e) {
                    var targetFilter = jQuery(this).attr('data-filter');
                    jQuery('#session_filter_' + widgetID + ' li a').removeClass('active');
                    jQuery(this).addClass('active');
                    if (targetFilter != '') {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide');
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').each(function () {
                            if (!jQuery(this).hasClass(targetFilter) && !jQuery(this).hasClass('scheduleday_title')) {
                                jQuery(this).addClass('hide')
                            }
                        })
                    } else {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide')
                    }
                    grid.masonry()
                });
                jQuery('#session_expand_' + widgetID).on('click', function (e) {
                    jQuery('#' + widgetID + ' ul.scheduleday_wrapper li .session_content_wrapper.expandable').trigger('click');
                    var expandTitle = jQuery(this).attr('data-expand-title');
                    var collapseTitle = jQuery(this).attr('data-collapse-title');
                    if (jQuery(this).hasClass('do_expand')) {
                        jQuery(this).removeClass('do_expand');
                        jQuery(this).addClass('do_collapse');
                        jQuery(this).html(collapseTitle + ' -')
                    } else {
                        jQuery(this).addClass('do_expand');
                        jQuery(this).removeClass('do_collapse');
                        jQuery(this).html(expandTitle + ' +')
                    }
                    grid.masonry()
                });
                var isExpand = jQuery(this).attr('data-expand');
                if (isExpand == 'yes') {
                    jQuery('#session_expand_' + widgetID).click()
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-classic-session-tab.default', function ($scope) {
            jQuery(".session-tab-wrapper").each(function () {
                var widgetID = jQuery(this).attr('data-widget-id');
                jQuery('#' + widgetID + ' li .session_content_wrapper.expandable').on('click', function (e) {
                    var targetID = jQuery(this).attr('data-expandid');
                    jQuery(this).parent('li').find('#' + targetID).toggleClass('hide');
                    jQuery(this).toggleClass('active')
                });
                jQuery('#' + widgetID + ' ul.scheduleday_wrapper li.scheduleday_title').on('click', function (e) {
                    jQuery('#' + widgetID + ' ul.scheduleday_wrapper li.scheduleday_title').removeClass('active');
                    jQuery(this).addClass('active');
                    var targetTab = jQuery(this).attr('data-tab');
                    jQuery('#' + widgetID + ' ul.scheduleday_wrapper.tab_content').addClass('hide');
                    jQuery('#' + widgetID + ' ul#' + targetTab).removeClass('hide')
                });
                jQuery('#session_filter_' + widgetID + ' li a').on('click', function (e) {
                    var targetFilter = jQuery(this).attr('data-filter');
                    jQuery('#session_filter_' + widgetID + ' li a').removeClass('active');
                    jQuery(this).addClass('active');
                    if (targetFilter != '') {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide');
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').each(function () {
                            if (!jQuery(this).hasClass(targetFilter) && !jQuery(this).hasClass('scheduleday_title')) {
                                jQuery(this).addClass('hide')
                            }
                        })
                    } else {
                        jQuery('#' + widgetID + ' ul.scheduleday_wrapper li').removeClass('hide')
                    }
                });
                jQuery('#session_expand_' + widgetID).on('click', function (e) {
                    jQuery('#' + widgetID + ' ul.scheduleday_wrapper li .session_content_wrapper.expandable').trigger('click');
                    var expandTitle = jQuery(this).attr('data-expand-title');
                    var collapseTitle = jQuery(this).attr('data-collapse-title');
                    if (jQuery(this).hasClass('do_expand')) {
                        jQuery(this).removeClass('do_expand');
                        jQuery(this).addClass('do_collapse');
                        jQuery(this).html(collapseTitle + ' -')
                    } else {
                        jQuery(this).addClass('do_expand');
                        jQuery(this).removeClass('do_collapse');
                        jQuery(this).html(expandTitle + ' +')
                    }
                });
                var isExpand = jQuery(this).attr('data-expand');
                if (isExpand == 'yes') {
                    jQuery('#session_expand_' + widgetID).click()
                }
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-classic-testimonials-slider.default', function ($scope) {
            jQuery(".testimonials-slider-wrapper").find('.testimonial_slider_wrapper').each(function () {
                var timer = jQuery(this).attr('data-timer');
                var autoplay = jQuery(this).attr('data-autoplay');
                if (timer == 0) {
                    timer = !1;
                    autoplay = !1
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (pagination == 0) {
                    var pagination = !1
                } else {
                    var pagination = !0
                }
                jQuery(this).flexslider({
                    animation: "fade",
                    animationLoop: !0,
                    itemMargin: 0,
                    minItems: 1,
                    maxItems: 1,
                    slideshow: autoplay,
                    controlNav: pagination,
                    smoothHeight: !1,
                    pauseOnHover: !0,
                    directionNav: !1,
                    slideshowSpeed: timer,
                    animationSpeed: 400,
                    move: 1
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-countdown.default', function ($scope) {
            jQuery(".countdown-wrapper").find('.countdown-clock').each(function () {
                var dataDate = jQuery(this).attr('data-date');
                var labelWeek = jQuery(this).attr('data-weeks');
                var labelDay = jQuery(this).attr('data-days');
                var labelhour = jQuery(this).attr('data-hours');
                var labelMinute = jQuery(this).attr('data-minutes');
                var labelSecond = jQuery(this).attr('data-seconds');
                jQuery(this).countdown(dataDate, function (event) {
                    var clock = jQuery(this).html(event.strftime('' + '<div class="countdown-clock-col"><div class="countdown-clock-counter">%w</div><div class="countdown-clock-label">' + labelWeek + '</div></div>' + '<div class="countdown-clock-col"><div class="countdown-clock-counter">%d</div><div class="countdown-clock-label">' + labelDay + '</div></div>' + '<div class="countdown-clock-col"><div class="countdown-clock-counter">%H</div><div class="countdown-clock-label">' + labelhour + '</div></div>' + '<div class="countdown-clock-col"><div class="countdown-clock-counter">%M</div><div class="countdown-clock-label">' + labelMinute + '</div></div>' + '<div class="countdown-clock-col"><div class="countdown-clock-counter">%S</div><div class="countdown-clock-label">' + labelSecond + '</div></div>'))
                })
            })
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/grandconference-speaker-carousel.default', function ($scope) {
            jQuery(".speaker-carousel-wrapper .owl-carousel").each(function () {
                var autoPlay = jQuery(this).attr('data-autoplay');
                if (typeof autoPlay == "undefined") {
                    autoPlay = !1
                }
                if (autoPlay == 1) {
                    autoPlay = !0
                } else {
                    autoPlay = !1
                }
                var timer = parseInt(jQuery(this).attr('data-timer'));
                if (typeof timer == "undefined") {
                    timer = 8000
                }
                var slidePadding = parseInt(jQuery(this).attr('data-stage-padding'));
                if (typeof slidePadding == "undefined") {
                    slidePadding = 70
                }
                var slideMargin = parseInt(jQuery(this).attr('data-margin'));
                if (typeof slideMargin == "undefined") {
                    slideMargin = 40
                }
                var items = parseInt(jQuery(this).attr('data-items'));
                if (typeof items == "undefined") {
                    items = 4
                }
                var pagination = jQuery(this).attr('data-pagination');
                if (typeof pagination == "undefined") {
                    pagination = !0
                }
                if (pagination == 1) {
                    pagination = !0
                } else {
                    pagination = !1
                }
                var speakerCarousel = jQuery(this).owlCarousel({
                    stagePadding: parseInt(slidePadding),
                    loop: !1,
                    center: !1,
                    items: parseInt(items),
                    margin: parseInt(slideMargin),
                    autoHeight: !0,
                    autoplay: autoPlay,
                    dots: pagination,
                    autoplayTimeout: timer,
                    smartSpeed: 450,
                    responsive: {
                        0: {
                            items: 1
                        },
                        768: {
                            items: 2
                        },
                        1170: {
                            items: parseInt(items)
                        },
                        1600: {
                            items: parseInt(items)
                        },
                        2000: {
                            items: parseInt(items)
                        },
                        2400: {
                            items: parseInt(items)
                        },
                    }
                });
                setTimeout(function () {
                    speakerCarousel.trigger('refresh.owl.carousel')
                }, 1000)
            })
        })
    })
})(jQuery)


// Modifikasi by arzu_354 //

 