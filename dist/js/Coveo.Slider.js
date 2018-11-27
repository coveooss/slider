/// <reference path="Slider.d.ts" />
var CoveoSliderMethods = {
    Destroy: 'destroy',
    Disable: 'disable',
    Enable: 'enable',
    Update: 'update'
};
var Slider = /** @class */ (function () {
    function Slider(options) {
        var _this = this;
        if (options.slider && _.isUndefined(options.min) && options.slider.attr('min')) {
            options.min = parseFloat(options.slider.attr('min'));
        }
        if (options.slider && _.isUndefined(options.max) && options.slider.attr('max')) {
            options.max = parseFloat(options.slider.attr('max'));
        }
        this.options = _.defaults(options, this.defaults(options.colors));
        this.$el = options.slider;
        this._uid = ++Slider._uid;
        this.$el.attr({
            'data-uid': this._uid,
            max: this.options.max,
            min: this.options.min,
            step: this.options.step
        });
        this.$el.on('input', function () { return _this.onInput(); });
        this.$el.on('change', function () { return _this.onChange(); });
        if (this.$el.prop('disabled')) {
            this.disable();
        }
        this.options.onInit(this);
    }
    Slider.prototype.onInput = function () {
        this.update();
        this.options.onSlide(this);
    };
    Slider.prototype.onChange = function () {
        this.update();
        this.options.onChange(this);
    };
    Slider.prototype.defaults = function (colors) {
        return {
            colors: _.defaults(colors || {}, { lower: Slider.LowerDefaultColor, upper: Slider.UpperDefaultColor }),
            min: 0,
            max: 100,
            step: 1,
            labels: [],
            ticks: [],
            value: Slider.DefaultValue,
            thumbWidth: 20,
            onInit: _.noop,
            onSlide: _.noop,
            onChange: _.noop,
            onDestroy: _.noop
        };
    };
    Slider.prototype.update = function () {
        var value = ((this.value - this.min) / (this.max - this.min)) * 100;
        this.updateSliderColors(value);
        this.positionElements();
    };
    Slider.prototype.positionElements = function () {
        var _this = this;
        if (this.options.labels && this.options.labels.length) {
            var $container = this.$el.nextAll('.' + Slider.LabelContainerClass);
            if ($container && $container.length) {
                var numberOfTicks = (this.max - this.min) / this.options.step;
                _.each(this.options.labels, function (label) {
                    var $el = $container.find("." + Slider.LabelClass + "[data-index=\"" + label.index + "\"]");
                    if ($el && $el.length) {
                        var offsetForMiddle = $el.width() / $container.width() * 100 / 2;
                        var offset = (label.index - _this.options.min) / _this.options.step / numberOfTicks;
                        $el.css({
                            'left': (offset * 100 - offsetForMiddle) + '%',
                            'margin-left': (offset * -1 * _this.options.thumbWidth + (_this.options.thumbWidth / 2)) + 'px'
                        });
                    }
                });
            }
        }
        if (this.options.ticks && this.options.ticks.length) {
            var $container = this.$el.nextAll('.' + Slider.TickContainerClass);
            if ($container && $container.length) {
                var numberOfTicks = (this.max - this.min) / this.options.step;
                _.each(this.options.ticks, function (tick) {
                    var $el = $container.find("." + Slider.TickClass + "[data-index=\"" + tick + "\"]");
                    if ($el && $el.length) {
                        var index = (tick - _this.min) / _this.options.step;
                        var offset = index / numberOfTicks;
                        $el.css({
                            left: (offset * 100) + '%',
                            'margin-left': offset * -1 * _this.options.thumbWidth + 'px',
                            background: tick < _this.value ? _this.options.colors.lower : _this.options.colors.upper
                        });
                    }
                });
            }
        }
    };
    Slider.prototype.updateSliderColors = function (value) {
        var styleElement = this.$el.prev('.' + Slider.StyleClass);
        var colors = this.options.colors;
        var gradient = "background: linear-gradient(to right, " + colors.lower + " " + value + "%, " + colors.upper + " " + value + "%);";
        var selector = "." + Slider.InputClass + "[data-uid='" + this._uid + "']";
        var webkit = ["input[type=\"range\"]" + selector + "::-webkit-slider-runnable-track {", gradient, '}'].join('');
        var firefox = ["input[type=\"range\"]" + selector + "::-moz-range-track {", gradient, '}'].join('');
        var ie = [
            "input[type=\"range\"]" + selector + "::-ms-fill-lower {",
            'background: ',
            this.options.colors.lower,
            '}',
            "input[type=\"range\"]" + selector + "::-ms-fill-upper {",
            'background: ',
            this.options.colors.upper,
            '}'
        ].join('');
        styleElement.html([webkit, firefox, ie].join(''));
    };
    Object.defineProperty(Slider.prototype, "value", {
        get: function () { return parseFloat(this.$el.val()); },
        set: function (value) {
            var minOfValueAndMax = Math.min(value, this.max);
            var maxOfValueAndMin = Math.max(minOfValueAndMax, this.min);
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
    Slider.prototype.disable = function () {
        this.$el.prop('disabled', true);
        this.$el.css('opacity', '0.8');
    };
    Slider.prototype.enable = function () {
        this.$el.prop('disabled', false);
        this.$el.css('opacity', '1');
    };
    Slider.prototype.destroy = function (elem) {
        this.$el.prev('.' + Slider.StyleClass).remove();
        this.$el.nextAll('.' + Slider.TickContainerClass).remove();
        this.$el.nextAll('.' + Slider.LabelContainerClass).remove();
        this.$el.removeData('slider');
        this.$el.removeAttr('data-uid');
        this.$el.off('input change');
        elem.removeData('slider');
        this.options.onDestroy();
    };
    Slider.LowerDefaultColor = '#f57f03';
    Slider.UpperDefaultColor = '#dddddd';
    Slider.StyleClass = 'coveo-slider-style';
    Slider.InputClass = 'coveo-slider-input';
    Slider.LabelContainerClass = 'coveo-slider-labels';
    Slider.LabelClass = 'coveo-slider-label';
    Slider.TickContainerClass = 'coveo-slider-ticks';
    Slider.TickClass = 'coveo-slider-tick';
    Slider.DefaultValue = 50;
    Slider._uid = 0;
    return Slider;
}());
+function ($) {
    'use strict';
    var createStyleElement = function () { return $('<style />', { type: 'text/css', class: Slider.StyleClass }); };
    var createInputElement = function (value, disabled) { return $('<input />', { type: 'range', class: Slider.InputClass, value: value }).prop('disabled', disabled); };
    var createTickContainer = function () { return $('<div />', { class: Slider.TickContainerClass }); };
    var createLabelContainer = function () { return $('<div />', { class: Slider.LabelContainerClass }); };
    var createLabelElements = function (container, labels) {
        _.chain(labels)
            .sortBy(function (label) { return label.index; })
            .each(function (label) {
            var $el = $('<div />', {
                class: Slider.LabelClass,
                text: label.label || label.index,
                'data-index': label.index
            });
            container.append($el);
        });
    };
    var createTickElements = function (container, ticks) {
        _.chain(ticks)
            .sortBy(_.identity)
            .each(function (tick) {
            var $el = $('<div />', { class: Slider.TickClass, 'data-index': tick });
            container.append($el);
        });
    };
    $.fn.slider = function (opts) {
        var $this = $(this);
        opts = opts || { slider: $this };
        var slider = $this.data('slider');
        if (_.isNumber(opts)) {
            opts = { value: opts };
        }
        if (slider && slider instanceof Slider) {
            var slider = $this.data('slider');
            if (opts && !_.isUndefined(opts.value)) {
                slider.value = opts.value;
                validateAndCreateElements($this, { value: slider.value });
                slider.update();
            }
            else if (_.isString(opts)) {
                validateAndCreateElements($this, {});
                switch (opts) {
                    case CoveoSliderMethods.Destroy:
                        slider.destroy($this);
                        break;
                    case CoveoSliderMethods.Disable:
                        slider.disable();
                        break;
                    case CoveoSliderMethods.Enable:
                        slider.enable();
                        break;
                    case CoveoSliderMethods.Update:
                        slider.update();
                        break;
                    default:
                        break;
                }
            }
            else {
                //no param. update
                validateAndCreateElements($this, { value: slider.value });
                slider.update();
            }
        }
        else if (!_.isString(opts) && !_.isNumber(opts)) {
            var sliderOptions = opts;
            var elements = validateAndCreateElements($this, sliderOptions);
            sliderOptions.slider = elements.input;
            slider = new Slider(sliderOptions);
            $this.data('slider', slider);
        }
        if (slider && slider instanceof Slider) {
            slider.update();
        }
        return $this;
    };
    function validateAndCreateElements($el, opts) {
        var style;
        var input;
        if ($el.is('input[type="range"]')) {
            input = $el;
            input.prop('disabled', opts.disabled === true);
            style = $el.prev('style.' + Slider.StyleClass);
            if (style.length == 0) {
                style = createStyleElement();
                $el.before(style);
            }
            if (opts && opts.ticks) {
                var ticksContainer = $el.nextAll('.' + Slider.TickContainerClass);
                var ticks = _.isBoolean(opts.ticks) && opts.ticks ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1), opts.step || 1)
                    : opts.ticks;
                opts.ticks = ticks;
                if (ticks && ticks.length) {
                    if (ticksContainer.length == 0) {
                        ticksContainer = createTickContainer();
                    }
                    createTickElements(ticksContainer, ticks);
                    $el.after(ticksContainer);
                }
            }
            if (opts && opts.labels) {
                var labelsContainer = $el.nextAll('.' + Slider.LabelContainerClass);
                var labels = _.isBoolean(opts.labels) && opts.labels ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1), opts.step || 1) : opts.labels;
                if (labels && labels.length) {
                    labels = _.map(labels, function (label) { return _.isNumber(label) ? { index: label } : label; });
                    if (labelsContainer.length == 0) {
                        labelsContainer = createLabelContainer();
                    }
                    createLabelElements(labelsContainer, labels);
                    $el.after(labelsContainer);
                }
                opts.labels = labels;
            }
        }
        else {
            //assume container
            style = $el.children('style.' + Slider.StyleClass);
            if (style.length == 0) {
                style = createStyleElement();
                $el.prepend(style);
            }
            input = $el.children('input[type="range"].' + Slider.InputClass);
            if (input.length == 0) {
                input = createInputElement(_.isUndefined(opts.value) ? Slider.DefaultValue : opts.value, opts && opts.disabled === true);
                $el.append(input);
            }
            else if (_.isNumber(opts.value)) {
                input.val(opts.value);
            }
            if (opts && opts.ticks) {
                var ticksContainer = $el.children('.' + Slider.TickContainerClass);
                var ticks = _.isBoolean(opts.ticks) && opts.ticks ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1), opts.step || 1)
                    : opts.ticks;
                opts.ticks = ticks;
                if (ticks && ticks.length) {
                    if (ticksContainer.length == 0) {
                        ticksContainer = createTickContainer();
                    }
                    createTickElements(ticksContainer, ticks);
                    $el.append(ticksContainer);
                }
            }
            if (opts && opts.labels) {
                var labelsContainer = $el.children('.' + Slider.LabelContainerClass);
                var labels = _.isBoolean(opts.labels) && opts.labels ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1), opts.step || 1) : opts.labels;
                if (labels && labels.length) {
                    labels = _.map(labels, function (label) { return _.isNumber(label) ? { index: label } : label; });
                    if (labelsContainer.length == 0) {
                        labelsContainer = createLabelContainer();
                    }
                    createLabelElements(labelsContainer, labels);
                    $el.append(labelsContainer);
                }
                opts.labels = labels;
            }
        }
        return {
            input: input,
            style: style
        };
    }
}(jQuery);

//# sourceMappingURL=dist/js/Coveo.Slider.js.map
