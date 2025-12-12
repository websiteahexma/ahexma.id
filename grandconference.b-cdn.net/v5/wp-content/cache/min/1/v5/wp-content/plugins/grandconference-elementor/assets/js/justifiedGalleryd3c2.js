(function ($) {
    function hasScrollBar() {
        return $("body").height() > $(window).height()
    }
    var JustifiedGallery = function ($gallery, settings) {
        this.settings = settings;
        this.checkSettings();
        this.imgAnalyzerTimeout = null;
        this.entries = null;
        this.buildingRow = {
            entriesBuff: [],
            width: 0,
            height: 0,
            aspectRatio: 0
        };
        this.lastFetchedEntry = null;
        this.lastAnalyzedIndex = -1;
        this.yield = {
            every: 2,
            flushed: 0
        };
        this.border = settings.border >= 0 ? settings.border : settings.margins;
        this.maxRowHeight = this.retrieveMaxRowHeight();
        this.suffixRanges = this.retrieveSuffixRanges();
        this.offY = this.border;
        this.rows = 0;
        this.spinner = {
            phase: 0,
            timeSlot: 150,
            $el: $('<div class="spinner"><span></span><span></span><span></span></div>'),
            intervalId: null
        };
        this.checkWidthIntervalId = null;
        this.galleryWidth = $gallery.width();
        this.$gallery = $gallery
    };
    JustifiedGallery.prototype.getSuffix = function (width, height) {
        var longestSide, i;
        longestSide = (width > height) ? width : height;
        for (i = 0; i < this.suffixRanges.length; i++) {
            if (longestSide <= this.suffixRanges[i]) {
                return this.settings.sizeRangeSuffixes[this.suffixRanges[i]]
            }
        }
        return this.settings.sizeRangeSuffixes[this.suffixRanges[i - 1]]
    };
    JustifiedGallery.prototype.removeSuffix = function (str, suffix) {
        return str.substring(0, str.length - suffix.length)
    };
    JustifiedGallery.prototype.endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1
    };
    JustifiedGallery.prototype.getUsedSuffix = function (str) {
        for (var si in this.settings.sizeRangeSuffixes) {
            if (this.settings.sizeRangeSuffixes.hasOwnProperty(si)) {
                if (this.settings.sizeRangeSuffixes[si].length === 0) continue;
                if (this.endsWith(str, this.settings.sizeRangeSuffixes[si])) return this.settings.sizeRangeSuffixes[si]
            }
        }
        return ''
    };
    JustifiedGallery.prototype.newSrc = function (imageSrc, imgWidth, imgHeight, image) {
        var newImageSrc;
        if (this.settings.thumbnailPath) {
            newImageSrc = this.settings.thumbnailPath(imageSrc, imgWidth, imgHeight, image)
        } else {
            var matchRes = imageSrc.match(this.settings.extension);
            var ext = (matchRes !== null) ? matchRes[0] : '';
            newImageSrc = imageSrc.replace(this.settings.extension, '');
            newImageSrc = this.removeSuffix(newImageSrc, this.getUsedSuffix(newImageSrc));
            newImageSrc += this.getSuffix(imgWidth, imgHeight) + ext
        }
        return newImageSrc
    };
    JustifiedGallery.prototype.showImg = function ($entry, callback) {
        if (this.settings.cssAnimation) {
            $entry.addClass('entry-visible');
            if (callback) callback()
        } else {
            $entry.stop().fadeTo(this.settings.imagesAnimationDuration, 1.0, callback);
            $entry.find('> img, > a > img').stop().fadeTo(this.settings.imagesAnimationDuration, 1.0, callback)
        }
    };
    JustifiedGallery.prototype.extractImgSrcFromImage = function ($image) {
        var imageSrc = (typeof $image.data('safe-src') !== 'undefined') ? $image.data('safe-src') : $image.attr('src');
        $image.data('jg.originalSrc', imageSrc);
        return imageSrc
    };
    JustifiedGallery.prototype.imgFromEntry = function ($entry) {
        var $img = $entry.find('> img');
        if ($img.length === 0) $img = $entry.find('> a > img');
        return $img.length === 0 ? null : $img
    };
    JustifiedGallery.prototype.captionFromEntry = function ($entry) {
        var $caption = $entry.find('> .caption');
        return $caption.length === 0 ? null : $caption
    };
    JustifiedGallery.prototype.displayEntry = function ($entry, x, y, imgWidth, imgHeight, rowHeight) {
        $entry.width(imgWidth);
        $entry.height(rowHeight);
        $entry.css('top', y);
        $entry.css('left', x);
        var $image = this.imgFromEntry($entry);
        if ($image !== null) {
            $image.css('width', imgWidth);
            $image.css('height', imgHeight);
            $image.css('margin-left', -imgWidth / 2);
            $image.css('margin-top', -imgHeight / 2);
            var imageSrc = $image.attr('src');
            var newImageSrc = this.newSrc(imageSrc, imgWidth, imgHeight, $image[0]);
            $image.one('error', function () {
                $image.attr('src', $image.data('jg.originalSrc'))
            });
            var loadNewImage = function () {
                if (imageSrc !== newImageSrc) {
                    $image.attr('src', newImageSrc)
                }
            };
            if ($entry.data('jg.loaded') === 'skipped') {
                this.onImageEvent(imageSrc, $.proxy(function () {
                    this.showImg($entry, loadNewImage);
                    $entry.data('jg.loaded', !0)
                }, this))
            } else {
                this.showImg($entry, loadNewImage)
            }
        } else {
            this.showImg($entry)
        }
        this.displayEntryCaption($entry)
    };
    JustifiedGallery.prototype.displayEntryCaption = function ($entry) {
        var $image = this.imgFromEntry($entry);
        if ($image !== null && this.settings.captions) {
            var $imgCaption = this.captionFromEntry($entry);
            if ($imgCaption === null) {
                var caption = $image.attr('alt');
                if (!this.isValidCaption(caption)) caption = $entry.attr('title');
                if (this.isValidCaption(caption)) {
                    $imgCaption = $('<div class="caption">' + caption + '</div>');
                    $entry.append($imgCaption);
                    $entry.data('jg.createdCaption', !0)
                }
            }
            if ($imgCaption !== null) {
                if (!this.settings.cssAnimation) $imgCaption.stop().fadeTo(0, this.settings.captionSettings.nonVisibleOpacity);
                this.addCaptionEventsHandlers($entry)
            }
        } else {
            this.removeCaptionEventsHandlers($entry)
        }
    };
    JustifiedGallery.prototype.isValidCaption = function (caption) {
        return (typeof caption !== 'undefined' && caption.length > 0)
    };
    JustifiedGallery.prototype.onEntryMouseEnterForCaption = function (eventObject) {
        var $caption = this.captionFromEntry($(eventObject.currentTarget));
        if (this.settings.cssAnimation) {
            $caption.addClass('caption-visible').removeClass('caption-hidden')
        } else {
            $caption.stop().fadeTo(this.settings.captionSettings.animationDuration, this.settings.captionSettings.visibleOpacity)
        }
    };
    JustifiedGallery.prototype.onEntryMouseLeaveForCaption = function (eventObject) {
        var $caption = this.captionFromEntry($(eventObject.currentTarget));
        if (this.settings.cssAnimation) {
            $caption.removeClass('caption-visible').removeClass('caption-hidden')
        } else {
            $caption.stop().fadeTo(this.settings.captionSettings.animationDuration, this.settings.captionSettings.nonVisibleOpacity)
        }
    };
    JustifiedGallery.prototype.addCaptionEventsHandlers = function ($entry) {
        var captionMouseEvents = $entry.data('jg.captionMouseEvents');
        if (typeof captionMouseEvents === 'undefined') {
            captionMouseEvents = {
                mouseenter: $.proxy(this.onEntryMouseEnterForCaption, this),
                mouseleave: $.proxy(this.onEntryMouseLeaveForCaption, this)
            };
            $entry.on('mouseenter', undefined, undefined, captionMouseEvents.mouseenter);
            $entry.on('mouseleave', undefined, undefined, captionMouseEvents.mouseleave);
            $entry.data('jg.captionMouseEvents', captionMouseEvents)
        }
    };
    JustifiedGallery.prototype.removeCaptionEventsHandlers = function ($entry) {
        var captionMouseEvents = $entry.data('jg.captionMouseEvents');
        if (typeof captionMouseEvents !== 'undefined') {
            $entry.off('mouseenter', undefined, captionMouseEvents.mouseenter);
            $entry.off('mouseleave', undefined, captionMouseEvents.mouseleave);
            $entry.removeData('jg.captionMouseEvents')
        }
    };
    JustifiedGallery.prototype.prepareBuildingRow = function (isLastRow) {
        var i, $entry, imgAspectRatio, newImgW, newImgH, justify = !0;
        var minHeight = 0;
        var availableWidth = this.galleryWidth - 2 * this.border - ((this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
        var rowHeight = availableWidth / this.buildingRow.aspectRatio;
        var defaultRowHeight = this.settings.rowHeight;
        var justifiable = this.buildingRow.width / availableWidth > this.settings.justifyThreshold;
        if (isLastRow && this.settings.lastRow === 'hide' && !justifiable) {
            for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
                $entry = this.buildingRow.entriesBuff[i];
                if (this.settings.cssAnimation)
                    $entry.removeClass('entry-visible');
                else {
                    $entry.stop().fadeTo(0, 0.1);
                    $entry.find('> img, > a > img').fadeTo(0, 0)
                }
            }
            return -1
        }
        if (isLastRow && !justifiable && this.settings.lastRow !== 'justify' && this.settings.lastRow !== 'hide') {
            justify = !1;
            if (this.rows > 0) {
                defaultRowHeight = (this.offY - this.border - this.settings.margins * this.rows) / this.rows;
                justify = defaultRowHeight * this.buildingRow.aspectRatio / availableWidth > this.settings.justifyThreshold
            }
        }
        for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
            $entry = this.buildingRow.entriesBuff[i];
            imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');
            if (justify) {
                newImgW = (i === this.buildingRow.entriesBuff.length - 1) ? availableWidth : rowHeight * imgAspectRatio;
                newImgH = rowHeight
            } else {
                newImgW = defaultRowHeight * imgAspectRatio;
                newImgH = defaultRowHeight
            }
            availableWidth -= Math.round(newImgW);
            $entry.data('jg.jwidth', Math.round(newImgW));
            $entry.data('jg.jheight', Math.ceil(newImgH));
            if (i === 0 || minHeight > newImgH) minHeight = newImgH
        }
        this.buildingRow.height = minHeight;
        return justify
    };
    JustifiedGallery.prototype.clearBuildingRow = function () {
        this.buildingRow.entriesBuff = [];
        this.buildingRow.aspectRatio = 0;
        this.buildingRow.width = 0
    };
    JustifiedGallery.prototype.flushRow = function (isLastRow) {
        var settings = this.settings;
        var $entry, buildingRowRes, offX = this.border,
            i;
        buildingRowRes = this.prepareBuildingRow(isLastRow);
        if (isLastRow && settings.lastRow === 'hide' && buildingRowRes === -1) {
            this.clearBuildingRow();
            return
        }
        if (this.maxRowHeight) {
            if (this.maxRowHeight.isPercentage && this.maxRowHeight.value * settings.rowHeight < this.buildingRow.height) {
                this.buildingRow.height = this.maxRowHeight.value * settings.rowHeight
            } else if (this.maxRowHeight.value >= settings.rowHeight && this.maxRowHeight.value < this.buildingRow.height) {
                this.buildingRow.height = this.maxRowHeight.value
            }
        }
        if (settings.lastRow === 'center' || settings.lastRow === 'right') {
            var availableWidth = this.galleryWidth - 2 * this.border - (this.buildingRow.entriesBuff.length - 1) * settings.margins;
            for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
                $entry = this.buildingRow.entriesBuff[i];
                availableWidth -= $entry.data('jg.jwidth')
            }
            if (settings.lastRow === 'center')
                offX += availableWidth / 2;
            else if (settings.lastRow === 'right')
                offX += availableWidth
        }
        for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
            $entry = this.buildingRow.entriesBuff[i];
            this.displayEntry($entry, offX, this.offY, $entry.data('jg.jwidth'), $entry.data('jg.jheight'), this.buildingRow.height);
            offX += $entry.data('jg.jwidth') + settings.margins
        }
        this.galleryHeightToSet = this.offY + this.buildingRow.height + this.border;
        this.$gallery.height(this.galleryHeightToSet + this.getSpinnerHeight());
        if (!isLastRow || (this.buildingRow.height <= settings.rowHeight && buildingRowRes)) {
            this.offY += this.buildingRow.height + settings.margins;
            this.rows += 1;
            this.clearBuildingRow();
            this.$gallery.trigger('jg.rowflush')
        }
    };
    var scrollBarOn = !1;
    JustifiedGallery.prototype.checkWidth = function () {
        this.checkWidthIntervalId = setInterval($.proxy(function () {
            var galleryWidth = parseFloat(this.$gallery.width());
            if (hasScrollBar() === scrollBarOn) {
                if (Math.abs(galleryWidth - this.galleryWidth) > this.settings.refreshSensitivity) {
                    this.galleryWidth = galleryWidth;
                    this.rewind();
                    this.startImgAnalyzer(!0)
                }
            } else {
                scrollBarOn = hasScrollBar();
                this.galleryWidth = galleryWidth
            }
        }, this), this.settings.refreshTime)
    };
    JustifiedGallery.prototype.isSpinnerActive = function () {
        return this.spinner.intervalId !== null
    };
    JustifiedGallery.prototype.getSpinnerHeight = function () {
        return this.spinner.$el.innerHeight()
    };
    JustifiedGallery.prototype.stopLoadingSpinnerAnimation = function () {
        clearInterval(this.spinner.intervalId);
        this.spinner.intervalId = null;
        this.$gallery.height(this.$gallery.height() - this.getSpinnerHeight());
        this.spinner.$el.detach()
    };
    JustifiedGallery.prototype.startLoadingSpinnerAnimation = function () {
        var spinnerContext = this.spinner;
        var $spinnerPoints = spinnerContext.$el.find('span');
        clearInterval(spinnerContext.intervalId);
        this.$gallery.append(spinnerContext.$el);
        this.$gallery.height(this.offY + this.buildingRow.height + this.getSpinnerHeight());
        spinnerContext.intervalId = setInterval(function () {
            if (spinnerContext.phase < $spinnerPoints.length) {
                $spinnerPoints.eq(spinnerContext.phase).fadeTo(spinnerContext.timeSlot, 1)
            } else {
                $spinnerPoints.eq(spinnerContext.phase - $spinnerPoints.length).fadeTo(spinnerContext.timeSlot, 0)
            }
            spinnerContext.phase = (spinnerContext.phase + 1) % ($spinnerPoints.length * 2)
        }, spinnerContext.timeSlot)
    };
    JustifiedGallery.prototype.rewind = function () {
        this.lastFetchedEntry = null;
        this.lastAnalyzedIndex = -1;
        this.offY = this.border;
        this.rows = 0;
        this.clearBuildingRow()
    };
    JustifiedGallery.prototype.updateEntries = function (norewind) {
        var newEntries;
        if (norewind && this.lastFetchedEntry != null) {
            newEntries = $(this.lastFetchedEntry).nextAll(this.settings.selector).toArray()
        } else {
            this.entries = [];
            newEntries = this.$gallery.children(this.settings.selector).toArray()
        }
        if (newEntries.length > 0) {
            if ($.isFunction(this.settings.sort)) {
                newEntries = this.sortArray(newEntries)
            } else if (this.settings.randomize) {
                newEntries = this.shuffleArray(newEntries)
            }
            this.lastFetchedEntry = newEntries[newEntries.length - 1];
            if (this.settings.filter) {
                newEntries = this.filterArray(newEntries)
            } else {
                this.resetFilters(newEntries)
            }
        }
        this.entries = this.entries.concat(newEntries);
        return !0
    };
    JustifiedGallery.prototype.insertToGallery = function (entries) {
        var that = this;
        $.each(entries, function () {
            $(this).appendTo(that.$gallery)
        })
    };
    JustifiedGallery.prototype.shuffleArray = function (a) {
        var i, j, temp;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = a[i];
            a[i] = a[j];
            a[j] = temp
        }
        this.insertToGallery(a);
        return a
    };
    JustifiedGallery.prototype.sortArray = function (a) {
        a.sort(this.settings.sort);
        this.insertToGallery(a);
        return a
    };
    JustifiedGallery.prototype.resetFilters = function (a) {
        for (var i = 0; i < a.length; i++) $(a[i]).removeClass('jg-filtered');
    };
    JustifiedGallery.prototype.filterArray = function (a) {
        var settings = this.settings;
        if ($.type(settings.filter) === 'string') {
            return a.filter(function (el) {
                var $el = $(el);
                if ($el.is(settings.filter)) {
                    $el.removeClass('jg-filtered');
                    return !0
                } else {
                    $el.addClass('jg-filtered').removeClass('jg-visible');
                    return !1
                }
            })
        } else if ($.isFunction(settings.filter)) {
            var filteredArr = a.filter(settings.filter);
            for (var i = 0; i < a.length; i++) {
                if (filteredArr.indexOf(a[i]) === -1) {
                    $(a[i]).addClass('jg-filtered').removeClass('jg-visible')
                } else {
                    $(a[i]).removeClass('jg-filtered')
                }
            }
            return filteredArr
        }
    };
    JustifiedGallery.prototype.destroy = function () {
        clearInterval(this.checkWidthIntervalId);
        $.each(this.entries, $.proxy(function (_, entry) {
            var $entry = $(entry);
            $entry.css('width', '');
            $entry.css('height', '');
            $entry.css('top', '');
            $entry.css('left', '');
            $entry.data('jg.loaded', undefined);
            $entry.removeClass('jg-entry');
            var $img = this.imgFromEntry($entry);
            $img.css('width', '');
            $img.css('height', '');
            $img.css('margin-left', '');
            $img.css('margin-top', '');
            $img.attr('src', $img.data('jg.originalSrc'));
            $img.data('jg.originalSrc', undefined);
            this.removeCaptionEventsHandlers($entry);
            var $caption = this.captionFromEntry($entry);
            if ($entry.data('jg.createdCaption')) {
                $entry.data('jg.createdCaption', undefined);
                if ($caption !== null) $caption.remove()
            } else {
                if ($caption !== null) $caption.fadeTo(0, 1)
            }
        }, this));
        this.$gallery.css('height', '');
        this.$gallery.removeClass('justified-gallery');
        this.$gallery.data('jg.controller', undefined)
    };
    JustifiedGallery.prototype.analyzeImages = function (isForResize) {
        for (var i = this.lastAnalyzedIndex + 1; i < this.entries.length; i++) {
            var $entry = $(this.entries[i]);
            if ($entry.data('jg.loaded') === !0 || $entry.data('jg.loaded') === 'skipped') {
                var availableWidth = this.galleryWidth - 2 * this.border - ((this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
                var imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');
                if (availableWidth / (this.buildingRow.aspectRatio + imgAspectRatio) < this.settings.rowHeight) {
                    this.flushRow(!1);
                    if (++this.yield.flushed >= this.yield.every) {
                        this.startImgAnalyzer(isForResize);
                        return
                    }
                }
                this.buildingRow.entriesBuff.push($entry);
                this.buildingRow.aspectRatio += imgAspectRatio;
                this.buildingRow.width += imgAspectRatio * this.settings.rowHeight;
                this.lastAnalyzedIndex = i
            } else if ($entry.data('jg.loaded') !== 'error') {
                return
            }
        }
        if (this.buildingRow.entriesBuff.length > 0) this.flushRow(!0);
        if (this.isSpinnerActive()) {
            this.stopLoadingSpinnerAnimation()
        }
        this.stopImgAnalyzerStarter();
        this.$gallery.trigger(isForResize ? 'jg.resize' : 'jg.complete');
        this.$gallery.height(this.galleryHeightToSet)
    };
    JustifiedGallery.prototype.stopImgAnalyzerStarter = function () {
        this.yield.flushed = 0;
        if (this.imgAnalyzerTimeout !== null) clearTimeout(this.imgAnalyzerTimeout)
    };
    JustifiedGallery.prototype.startImgAnalyzer = function (isForResize) {
        var that = this;
        this.stopImgAnalyzerStarter();
        this.imgAnalyzerTimeout = setTimeout(function () {
            that.analyzeImages(isForResize)
        }, 0.001)
    };
    JustifiedGallery.prototype.onImageEvent = function (imageSrc, onLoad, onError) {
        if (!onLoad && !onError) return;
        var memImage = new Image();
        var $memImage = $(memImage);
        if (onLoad) {
            $memImage.one('load', function () {
                $memImage.off('load error');
                onLoad(memImage)
            })
        }
        if (onError) {
            $memImage.one('error', function () {
                $memImage.off('load error');
                onError(memImage)
            })
        }
        memImage.src = imageSrc
    };
    JustifiedGallery.prototype.init = function () {
        var imagesToLoad = !1,
            skippedImages = !1,
            that = this;
        $.each(this.entries, function (index, entry) {
            var $entry = $(entry);
            var $image = that.imgFromEntry($entry);
            $entry.addClass('jg-entry');
            if ($entry.data('jg.loaded') !== !0 && $entry.data('jg.loaded') !== 'skipped') {
                if (that.settings.rel !== null) $entry.attr('rel', that.settings.rel);
                if (that.settings.target !== null) $entry.attr('target', that.settings.target);
                if ($image !== null) {
                    var imageSrc = that.extractImgSrcFromImage($image);
                    $image.attr('src', imageSrc);
                    if (that.settings.waitThumbnailsLoad === !1) {
                        var width = parseFloat($image.attr('width'));
                        var height = parseFloat($image.attr('height'));
                        if (!isNaN(width) && !isNaN(height)) {
                            $entry.data('jg.width', width);
                            $entry.data('jg.height', height);
                            $entry.data('jg.loaded', 'skipped');
                            skippedImages = !0;
                            that.startImgAnalyzer(!1);
                            return !0
                        }
                    }
                    $entry.data('jg.loaded', !1);
                    imagesToLoad = !0;
                    if (!that.isSpinnerActive()) that.startLoadingSpinnerAnimation();
                    that.onImageEvent(imageSrc, function (loadImg) {
                        $entry.data('jg.width', loadImg.width);
                        $entry.data('jg.height', loadImg.height);
                        $entry.data('jg.loaded', !0);
                        that.startImgAnalyzer(!1)
                    }, function () {
                        $entry.data('jg.loaded', 'error');
                        that.startImgAnalyzer(!1)
                    })
                } else {
                    $entry.data('jg.loaded', !0);
                    $entry.data('jg.width', $entry.width() | parseFloat($entry.css('width')) | 1);
                    $entry.data('jg.height', $entry.height() | parseFloat($entry.css('height')) | 1)
                }
            }
        });
        if (!imagesToLoad && !skippedImages) this.startImgAnalyzer(!1);
        this.checkWidth()
    };
    JustifiedGallery.prototype.checkOrConvertNumber = function (settingContainer, settingName) {
        if ($.type(settingContainer[settingName]) === 'string') {
            settingContainer[settingName] = parseFloat(settingContainer[settingName])
        }
        if ($.type(settingContainer[settingName]) === 'number') {
            if (isNaN(settingContainer[settingName])) throw 'invalid number for ' + settingName
        } else {
            throw settingName + ' must be a number'
        }
    };
    JustifiedGallery.prototype.checkSizeRangesSuffixes = function () {
        if ($.type(this.settings.sizeRangeSuffixes) !== 'object') {
            throw 'sizeRangeSuffixes must be defined and must be an object'
        }
        var suffixRanges = [];
        for (var rangeIdx in this.settings.sizeRangeSuffixes) {
            if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(rangeIdx)
        }
        var newSizeRngSuffixes = {
            0: ''
        };
        for (var i = 0; i < suffixRanges.length; i++) {
            if ($.type(suffixRanges[i]) === 'string') {
                try {
                    var numIdx = parseInt(suffixRanges[i].replace(/^[a-z]+/, ''), 10);
                    newSizeRngSuffixes[numIdx] = this.settings.sizeRangeSuffixes[suffixRanges[i]]
                } catch (e) {
                    throw 'sizeRangeSuffixes keys must contains correct numbers (' + e + ')'
                }
            } else {
                newSizeRngSuffixes[suffixRanges[i]] = this.settings.sizeRangeSuffixes[suffixRanges[i]]
            }
        }
        this.settings.sizeRangeSuffixes = newSizeRngSuffixes
    };
    JustifiedGallery.prototype.retrieveMaxRowHeight = function () {
        var newMaxRowHeight = {};
        if ($.type(this.settings.maxRowHeight) === 'string') {
            if (this.settings.maxRowHeight.match(/^[0-9]+%$/)) {
                newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight.match(/^([0-9]+)%$/)[1]) / 100;
                newMaxRowHeight.isPercentage = !1
            } else {
                newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight);
                newMaxRowHeight.isPercentage = !0
            }
        } else if ($.type(this.settings.maxRowHeight) === 'number') {
            newMaxRowHeight.value = this.settings.maxRowHeight;
            newMaxRowHeight.isPercentage = !1
        } else if (this.settings.maxRowHeight === !1 || this.settings.maxRowHeight === null || typeof this.settings.maxRowHeight === 'undefined') {
            return null
        } else {
            throw 'maxRowHeight must be a number or a percentage'
        }
        if (isNaN(newMaxRowHeight.value)) throw 'invalid number for maxRowHeight';
        if (newMaxRowHeight.isPercentage) {
            if (newMaxRowHeight.value < 100) newMaxRowHeight.value = 100
        }
        return newMaxRowHeight
    };
    JustifiedGallery.prototype.checkSettings = function () {
        this.checkSizeRangesSuffixes();
        this.checkOrConvertNumber(this.settings, 'rowHeight');
        this.checkOrConvertNumber(this.settings, 'margins');
        this.checkOrConvertNumber(this.settings, 'border');
        var lastRowModes = ['justify', 'nojustify', 'left', 'center', 'right', 'hide'];
        if (lastRowModes.indexOf(this.settings.lastRow) === -1) {
            throw 'lastRow must be one of: ' + lastRowModes.join(', ')
        }
        this.checkOrConvertNumber(this.settings, 'justifyThreshold');
        if (this.settings.justifyThreshold < 0 || this.settings.justifyThreshold > 1) {
            throw 'justifyThreshold must be in the interval [0,1]'
        }
        if ($.type(this.settings.cssAnimation) !== 'boolean') {
            throw 'cssAnimation must be a boolean'
        }
        if ($.type(this.settings.captions) !== 'boolean') throw 'captions must be a boolean';
        this.checkOrConvertNumber(this.settings.captionSettings, 'animationDuration');
        this.checkOrConvertNumber(this.settings.captionSettings, 'visibleOpacity');
        if (this.settings.captionSettings.visibleOpacity < 0 || this.settings.captionSettings.visibleOpacity > 1) {
            throw 'captionSettings.visibleOpacity must be in the interval [0, 1]'
        }
        this.checkOrConvertNumber(this.settings.captionSettings, 'nonVisibleOpacity');
        if (this.settings.captionSettings.nonVisibleOpacity < 0 || this.settings.captionSettings.nonVisibleOpacity > 1) {
            throw 'captionSettings.nonVisibleOpacity must be in the interval [0, 1]'
        }
        this.checkOrConvertNumber(this.settings, 'imagesAnimationDuration');
        this.checkOrConvertNumber(this.settings, 'refreshTime');
        this.checkOrConvertNumber(this.settings, 'refreshSensitivity');
        if ($.type(this.settings.randomize) !== 'boolean') throw 'randomize must be a boolean';
        if ($.type(this.settings.selector) !== 'string') throw 'selector must be a string';
        if (this.settings.sort !== !1 && !$.isFunction(this.settings.sort)) {
            throw 'sort must be false or a comparison function'
        }
        if (this.settings.filter !== !1 && !$.isFunction(this.settings.filter) && $.type(this.settings.filter) !== 'string') {
            throw 'filter must be false, a string or a filter function'
        }
    };
    JustifiedGallery.prototype.retrieveSuffixRanges = function () {
        var suffixRanges = [];
        for (var rangeIdx in this.settings.sizeRangeSuffixes) {
            if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(parseInt(rangeIdx, 10))
        }
        suffixRanges.sort(function (a, b) {
            return a > b ? 1 : a < b ? -1 : 0
        });
        return suffixRanges
    };
    JustifiedGallery.prototype.updateSettings = function (newSettings) {
        this.settings = $.extend({}, this.settings, newSettings);
        this.checkSettings();
        this.border = this.settings.border >= 0 ? this.settings.border : this.settings.margins;
        this.maxRowHeight = this.retrieveMaxRowHeight();
        this.suffixRanges = this.retrieveSuffixRanges()
    };
    $.fn.justifiedGallery = function (arg) {
        return this.each(function (index, gallery) {
            var $gallery = $(gallery);
            $gallery.addClass('justified-gallery');
            var controller = $gallery.data('jg.controller');
            if (typeof controller === 'undefined') {
                if (typeof arg !== 'undefined' && arg !== null && $.type(arg) !== 'object') {
                    if (arg === 'destroy') return
                }
                controller = new JustifiedGallery($gallery, $.extend({}, $.fn.justifiedGallery.defaults, arg));
                $gallery.data('jg.controller', controller)
            } else if (arg === 'norewind') {} else if (arg === 'destroy') {
                controller.destroy();
                return
            } else {
                controller.updateSettings(arg);
                controller.rewind()
            }
            if (!controller.updateEntries(arg === 'norewind')) return;
            controller.init()
        })
    };
    $.fn.justifiedGallery.defaults = {
        sizeRangeSuffixes: {},
        thumbnailPath: undefined,
        rowHeight: 120,
        maxRowHeight: !1,
        margins: 1,
        border: -1,
        lastRow: 'nojustify',
        justifyThreshold: 0.90,
        waitThumbnailsLoad: !0,
        captions: !0,
        cssAnimation: !0,
        imagesAnimationDuration: 500,
        captionSettings: {
            animationDuration: 500,
            visibleOpacity: 0.7,
            nonVisibleOpacity: 0.0
        },
        rel: null,
        target: null,
        extension: /\.[^.\\/]+$/,
        refreshTime: 200,
        refreshSensitivity: 0,
        randomize: !1,
        sort: !1,
        filter: !1,
        selector: 'a, div:not(.spinner)'
    }
}(jQuery))