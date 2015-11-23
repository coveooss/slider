/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
/// <reference path="Slider.d.ts" />
var Slider = (function () {
    function Slider(options) {
        var _this = this;
        if (options.slider && _.isUndefined(options.min) && options.slider.attr('min')) {
            options.min = parseFloat(options.slider.attr('min'));
        }
        if (options.slider && _.isUndefined(options.max) && options.slider.attr('max')) {
            options.max = parseFloat(options.slider.attr('max'));
        }
        this.options = _.defaults(options, this.defaults());
        this.$el = this.options.slider;
        this._uid = ++Slider._uid;
        this.$el.attr({
            'data-uid': this._uid,
            max: this.options.max,
            min: this.options.min
        });
        this.$el.on('input change', function () { return _this.update(); });
    }
    Slider.prototype.defaults = function () {
        return {
            colors: { lower: Slider.LowerDefaultColor, upper: Slider.UpperDefaultColor },
            min: 0,
            max: 100,
            labels: [],
            value: Slider.DefaultValue
        };
    };
    Slider.prototype.update = function () {
        var value = (this.value / this.options.max) * 100;
        this.updateSliderColors(value);
    };
    Slider.prototype.updateSliderColors = function (value) {
        var styleElement = this.$el.prev('.' + Slider.StyleElementClass);
        var colors = this.options.colors;
        var gradient = "background: linear-gradient(to right, " + colors.lower + " " + value + "%, " + colors.upper + " " + value + "%);";
        var selector = ".coveo-input-slider[data-uid='" + this._uid + "']";
        var webkit = [("input[type=range]" + selector + "::-webkit-slider-runnable-track {"), gradient, '}'].join('');
        var firefox = [("input[type=range]" + selector + "::-moz-range-track {"), gradient, '}'].join('');
        var ie = [
            ("input[type=range]" + selector + "::-ms-fill-lower {"),
            'background: ',
            this.options.colors.lower,
            '}',
            ("input[type=range]" + selector + "::-ms-fill-upper {"),
            'background: ',
            this.options.colors.upper,
            '}'
        ].join('');
        styleElement.html([webkit, firefox, ie].join(''));
    };
    Object.defineProperty(Slider.prototype, "value", {
        get: function () { return parseFloat(this.$el.val()); },
        set: function (value) {
            var minOfValueAndMax = Math.min(value, this.options.max);
            var maxOfValueAndMin = Math.max(minOfValueAndMax, this.options.min);
            this.$el.val(maxOfValueAndMin);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "min", {
        get: function () { return parseFloat(this.$el.attr('min')); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Slider.prototype, "max", {
        get: function () { return parseFloat(this.$el.attr('max')); },
        enumerable: true,
        configurable: true
    });
    Slider.prototype.destroy = function (elem) {
        this.$el.prev('.' + Slider.StyleElementClass).remove();
        this.$el.removeData('slider');
        this.$el.removeAttr('data-uid');
        this.$el.off('input change');
        elem.removeData('slider');
    };
    Slider.LowerDefaultColor = '#f57f03';
    Slider.UpperDefaultColor = '#dddddd';
    Slider.StyleElementClass = 'coveo-input-slider-style';
    Slider.InputElementClass = 'coveo-input-slider';
    Slider.DefaultValue = 50;
    Slider._uid = 0;
    return Slider;
})();
+function ($) {
    'use strict';
    var createStyleElement = function () { return $('<style />', { type: 'text/css', class: Slider.StyleElementClass }); };
    var createInputElement = function (value) { return $('<input />', { type: 'range', class: Slider.InputElementClass, value: value }); };
    $.fn.slider = function (opts) {
        var $this = $(this);
        opts = opts || { slider: $this };
        var slider = $this.data('slider');
        if (slider && slider instanceof Slider) {
            var slider = $this.data('slider');
            if (_.isNumber(opts)) {
                slider.value = opts;
                validateAndCreateElements($this, slider.value);
                slider.update();
            }
            else if (opts && !_.isUndefined(opts.value)) {
                slider.value = opts.value;
                validateAndCreateElements($this, slider.value);
                slider.update();
            }
            else if (_.isString(opts)) {
                validateAndCreateElements($this, slider.value);
                switch (opts) {
                    case 'destroy':
                        slider.destroy($this);
                        break;
                    default:
                        break;
                }
            }
            else {
                //no param. update
                validateAndCreateElements($this, slider.value);
                slider.update();
            }
        }
        else {
            var sliderOptions = opts;
            var elements = validateAndCreateElements($this, sliderOptions.value);
            sliderOptions.slider = elements.input;
            slider = new Slider(sliderOptions);
            $this.data('slider', slider);
        }
        slider.update();
        return $this;
    };
    function validateAndCreateElements($el, value) {
        var style;
        var input;
        if ($el.is('input[type="range"]')) {
            input = $el;
            style = $el.prev('style.' + Slider.StyleElementClass);
            if (style.length == 0) {
                style = createStyleElement();
                $el.before(style);
            }
        }
        else {
            //assume container
            style = $el.children('style.' + Slider.StyleElementClass);
            if (style.length == 0) {
                style = createStyleElement();
                $el.prepend(style);
            }
            input = $el.children('input[type="range"].' + Slider.InputElementClass);
            if (input.length == 0) {
                input = createInputElement(value || Slider.DefaultValue);
                $el.append(input);
            }
        }
        return {
            input: input,
            style: style
        };
    }
}(jQuery);

//# sourceMappingURL=dist/js/Coveo.Slider.js.map
