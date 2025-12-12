/*! Blast.js (2.0.0): julian.com/research/blast (C) 2015 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
;
(function ($, window, document, undefined) {
    var IE = (function () {
        if (document.documentMode) {
            return document.documentMode
        } else {
            for (var i = 7; i > 0; i--) {
                var div = document.createElement("div");
                div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";
                if (div.getElementsByTagName("span").length) {
                    div = null;
                    return i
                }
                div = null
            }
        }
        return undefined
    })();
    var console = window.console || {
        log: function () {},
        time: function () {}
    };
    var NAME = "blast",
        characterRanges = {
            latinPunctuation: "–—′’'“″„\"(«.…¡¿′’'”″“\")».…!?",
            latinLetters: "\\u0041-\\u005A\\u0061-\\u007A\\u00C0-\\u017F\\u0100-\\u01FF\\u0180-\\u027F"
        },
        Reg = {
            abbreviations: new RegExp("[^" + characterRanges.latinLetters + "](e\\.g\\.)|(i\\.e\\.)|(mr\\.)|(mrs\\.)|(ms\\.)|(dr\\.)|(prof\\.)|(esq\\.)|(sr\\.)|(jr\\.)[^" + characterRanges.latinLetters + "]", "ig"),
            innerWordPeriod: new RegExp("[" + characterRanges.latinLetters + "]\.[" + characterRanges.latinLetters + "]", "ig"),
            onlyContainsPunctuation: new RegExp("[^" + characterRanges.latinPunctuation + "]"),
            adjoinedPunctuation: new RegExp("^[" + characterRanges.latinPunctuation + "]+|[" + characterRanges.latinPunctuation + "]+$", "g"),
            skippedElements: /(script|style|select|textarea)/i,
            hasPluginClass: new RegExp("(^| )" + NAME + "( |$)", "gi")
        };
    $.fn[NAME] = function (options) {
        function encodePunctuation(text) {
            return text.replace(Reg.abbreviations, function (match) {
                return match.replace(/\./g, "{{46}}")
            }).replace(Reg.innerWordPeriod, function (match) {
                return match.replace(/\./g, "{{46}}")
            })
        }

        function decodePunctuation(text) {
            return text.replace(/{{(\d{1,3})}}/g, function (fullMatch, subMatch) {
                return String.fromCharCode(subMatch)
            })
        }

        function wrapNode(node, opts) {
            var wrapper = document.createElement(opts.tag);
            wrapper.className = NAME;
            if (opts.customClass) {
                wrapper.className += " " + opts.customClass;
                if (opts.generateIndexID) {
                    wrapper.id = opts.customClass + "-" + Element.blastedIndex
                }
            }
            if (opts.delimiter === "all" && /\s/.test(node.data)) {
                wrapper.style.whiteSpace = "pre-line"
            }
            if (opts.generateValueClass === !0 && !opts.search && (opts.delimiter === "character" || opts.delimiter === "word")) {
                var valueClass, text = node.data;
                if (opts.delimiter === "word" && Reg.onlyContainsPunctuation.test(text)) {
                    text = text.replace(Reg.adjoinedPunctuation, "")
                }
                valueClass = NAME + "-" + opts.delimiter.toLowerCase() + "-" + text.toLowerCase();
                wrapper.className += " " + valueClass
            }
            if (opts.aria) {
                wrapper.setAttribute("aria-hidden", "true")
            }
            wrapper.appendChild(node.cloneNode(!1));
            return wrapper
        }

        function traverseDOM(node, opts) {
            var matchPosition = -1,
                skipNodeBit = 0;
            if (node.nodeType === 3 && node.data.length) {
                if (Element.nodeBeginning) {
                    node.data = (!opts.search && opts.delimiter === "sentence") ? encodePunctuation(node.data) : decodePunctuation(node.data);
                    Element.nodeBeginning = !1
                }
                matchPosition = node.data.search(delimiterRegex);
                if (matchPosition !== -1) {
                    var match = node.data.match(delimiterRegex),
                        matchText = match[0],
                        subMatchText = match[1] || !1;
                    if (matchText === "") {
                        matchPosition++
                    } else if (subMatchText && subMatchText !== matchText) {
                        matchPosition += matchText.indexOf(subMatchText);
                        matchText = subMatchText
                    }
                    var middleBit = node.splitText(matchPosition);
                    middleBit.splitText(matchText.length);
                    skipNodeBit = 1;
                    if (!opts.search && opts.delimiter === "sentence") {
                        middleBit.data = decodePunctuation(middleBit.data)
                    }
                    var wrappedNode = wrapNode(middleBit, opts, Element.blastedIndex);
                    middleBit.parentNode.replaceChild(wrappedNode, middleBit);
                    Element.wrappers.push(wrappedNode);
                    Element.blastedIndex++
                }
            } else if (node.nodeType === 1 && node.hasChildNodes() && !Reg.skippedElements.test(node.tagName) && !Reg.hasPluginClass.test(node.className)) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    Element.nodeBeginning = !0;
                    i += traverseDOM(node.childNodes[i], opts)
                }
            }
            return skipNodeBit
        }
        var opts = $.extend({}, $.fn[NAME].defaults, options),
            delimiterRegex, Element = {};
        if (opts.search.length && (typeof opts.search === "string" || /^\d/.test(parseFloat(opts.search)))) {
            opts.delimiter = opts.search.toString().replace(/[-[\]{,}(.)*+?|^$\\\/]/g, "\\$&");
            delimiterRegex = new RegExp("(?:^|[^-" + characterRanges.latinLetters + "])(" + opts.delimiter + "('s)?)(?![-" + characterRanges.latinLetters + "])", "i")
        } else {
            if (typeof opts.delimiter === "string") {
                opts.delimiter = opts.delimiter.toLowerCase()
            }
            switch (opts.delimiter) {
                case "all":
                    delimiterRegex = /(.)/;
                    break;
                case "letter":
                case "char":
                case "character":
                    delimiterRegex = /(\S)/;
                    break;
                case "word":
                    delimiterRegex = /\s*(\S+)\s*/;
                    break;
                case "sentence":
                    delimiterRegex = /(?=\S)(([.]{2,})?[^!?]+?([.…!?]+|(?=\s+$)|$)(\s*[′’'”″“")»]+)*)/;
                    break;
                case "element":
                    delimiterRegex = /(?=\S)([\S\s]*\S)/;
                    break;
                default:
                    if (opts.delimiter instanceof RegExp) {
                        delimiterRegex = opts.delimiter
                    } else {
                        console.log(NAME + ": Unrecognized delimiter, empty search string, or invalid custom Regex. Aborting.");
                        return !0
                    }
            }
        }
        this.each(function () {
            var $this = $(this),
                text = $this.text();
            if (options !== !1) {
                Element = {
                    blastedIndex: 0,
                    nodeBeginning: !1,
                    wrappers: Element.wrappers || []
                };
                if ($this.data(NAME) !== undefined && ($this.data(NAME) !== "search" || opts.search === !1)) {
                    reverse($this, opts);
                    if (opts.debug) console.log(NAME + ": Removed element's existing Blast call.")
                }
                $this.data(NAME, opts.search !== !1 ? "search" : opts.delimiter);
                if (opts.aria) {
                    $this.attr("aria-label", text)
                }
                if (opts.stripHTMLTags) {
                    $this.html(text)
                }
                try {
                    document.createElement(opts.tag)
                } catch (error) {
                    opts.tag = "span";
                    if (opts.debug) console.log(NAME + ": Invalid tag supplied. Defaulting to span.")
                }
                $this.addClass(NAME + "-root");
                if (opts.debug) console.time(NAME);
                traverseDOM(this, opts);
                if (opts.debug) console.timeEnd(NAME)
            } else if (options === !1 && $this.data(NAME) !== undefined) {
                reverse($this, opts)
            }
            if (opts.debug) {
                $.each(Element.wrappers, function (index, element) {
                    console.log(NAME + " [" + opts.delimiter + "] " + this.outerHTML);
                    this.style.backgroundColor = index % 2 ? "#f12185" : "#075d9a"
                })
            }
        });

        function reverse($this, opts) {
            if (opts.debug) console.time("blast reversal");
            var skippedDescendantRoot = !1;
            $this.removeClass(NAME + "-root").removeAttr("aria-label").find("." + NAME).each(function () {
                var $this = $(this);
                if (!$this.closest("." + NAME + "-root").length) {
                    var thisParentNode = this.parentNode;
                    if (IE <= 7)(thisParentNode.firstChild.nodeName);
                    thisParentNode.replaceChild(this.firstChild, this);
                    thisParentNode.normalize()
                } else {
                    skippedDescendantRoot = !0
                }
            });
            if (window.Zepto) {
                $this.data(NAME, undefined)
            } else {
                $this.removeData(NAME)
            }
            if (opts.debug) {
                console.log(NAME + ": Reversed Blast" + ($this.attr("id") ? " on #" + $this.attr("id") + "." : ".") + (skippedDescendantRoot ? " Skipped reversal on the children of one or more descendant root elements." : ""));
                console.timeEnd("blast reversal")
            }
        }
        if (options !== !1 && opts.returnGenerated === !0) {
            var newStack = $().add(Element.wrappers);
            newStack.prevObject = this;
            newStack.context = this.context;
            return newStack
        } else {
            return this
        }
    };
    $.fn.blast.defaults = {
        returnGenerated: !0,
        delimiter: "word",
        tag: "span",
        search: !1,
        customClass: "",
        generateIndexID: !1,
        generateValueClass: !1,
        stripHTMLTags: !1,
        aria: !0,
        debug: !1
    }
})(window.jQuery || window.Zepto, window, document)