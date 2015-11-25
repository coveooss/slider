/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
/// <reference path="Slider.d.ts" />
var CoveoSliderMethods = {
    Destroy: 'destroy',
    Disable: 'disable',
    Enable: 'enable',
    Update: 'update'
};

class Slider {
    private colors: Colors;
    private options: ParsedSliderOptions;
    private $el: JQuery;
    private _uid: number;

    static LowerDefaultColor = '#f57f03';
    static UpperDefaultColor = '#dddddd';
    static StyleClass = 'coveo-slider-style';
    static InputClass = 'coveo-slider-input';
    static LabelContainerClass = 'coveo-slider-labels';
    static LabelClass = 'coveo-slider-label';
    static TickContainerClass = 'coveo-slider-ticks';
    static TickClass = 'coveo-slider-tick';
    static DefaultValue = 50;

    static _uid = 0;

    constructor(options: SliderOptions) {
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

        this.$el.on('input', () => this.onInput());
        this.$el.on('change', () => this.onChange());

        if (this.$el.prop('disabled')) {
            this.disable();
        }

        this.options.onInit(this);
    }

    private onInput() {
        this.update();
        this.options.onSlide(this)
    }

    private onChange() {
        this.update();
        this.options.onChange(this)
    }

    defaults(colors?: Colors): ParsedSliderOptions {
        return {
            colors: _.defaults(colors || {}, {lower: Slider.LowerDefaultColor, upper: Slider.UpperDefaultColor}),
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
    }

    update() {
        var value = ((this.value - this.min) / (this.max - this.min)) * 100;
        this.updateSliderColors(value);
        this.positionElements();
    }

    private positionElements() {
        if (this.options.labels && this.options.labels.length) {
            var $container = this.$el.nextAll('.' + Slider.LabelContainerClass);
            if ($container && $container.length) {
                var numberOfTicks = (this.max - this.min) / this.options.step;
                _.each(this.options.labels, (label: Label) => {
                    var $el = $container.find(`.${Slider.LabelClass}[data-index="${label.index}"]`);
                    if ($el && $el.length) {
                        var offsetForMiddle = $el.width() / $container.width() * 100 / 2;
                        var offset = (label.index - this.options.min) / this.options.step / numberOfTicks;
                        $el.css({
                            'left': (offset * 100 - offsetForMiddle) + '%',
                            'margin-left': (offset * -1 * this.options.thumbWidth + (this.options.thumbWidth / 2)) + 'px'
                        });
                    }
                });
            }
        }

        if (this.options.ticks && this.options.ticks.length) {
            var $container = this.$el.nextAll('.' + Slider.TickContainerClass);
            if ($container && $container.length) {
                var numberOfTicks = (this.max - this.min) / this.options.step;
                _.each(this.options.ticks, (tick: number) => {
                    var $el = $container.find(`.${Slider.TickClass}[data-index="${tick}"]`);
                    if ($el && $el.length) {
                        var index = (tick - this.min) / this.options.step;
                        var offset = index / numberOfTicks;
                        $el.css({
                            left: (offset * 100) + '%',
                            'margin-left': offset * -1 * this.options.thumbWidth + 'px',
                            background: tick < this.value ? this.options.colors.lower : this.options.colors.upper
                        });
                    }
                });
            }
        }
    }

    private updateSliderColors(value: number) {
        var styleElement = this.$el.prev('.' + Slider.StyleClass);
        var colors = this.options.colors;
        var gradient = `background: linear-gradient(to right, ${colors.lower} ${value}%, ${colors.upper} ${value}%);`;

        var selector = `.${Slider.InputClass}[data-uid='${this._uid}']`;

        var webkit = [`input[type="range"]${selector}::-webkit-slider-runnable-track {`, gradient, '}'].join('');
        var firefox = [`input[type="range"]${selector}::-moz-range-track {`, gradient, '}'].join('');
        var ie = [
            `input[type="range"]${selector}::-ms-fill-lower {`,
            'background: ',
            this.options.colors.lower,
            '}',
            `input[type="range"]${selector}::-ms-fill-upper {`,
            'background: ',
            this.options.colors.upper,
            '}'
        ].join('');

        styleElement.html([webkit, firefox, ie].join(''));
    }

    get value(): number { return parseFloat(this.$el.val()); }

    set value(value: number) {
        var minOfValueAndMax = Math.min(value, this.max);
        var maxOfValueAndMin = Math.max(minOfValueAndMax, this.min);
        this.$el.val(maxOfValueAndMin);
    }

    get min(): number {return parseFloat(this.$el.attr('min')); }

    get max(): number {return parseFloat(this.$el.attr('max')); }

    disable() {
        this.$el.prop('disabled', true);
        this.$el.css('opacity', '0.8');
    }

    enable() {
        this.$el.prop('disabled', false);
        this.$el.css('opacity', '1');
    }

    destroy(elem: JQuery) {
        this.$el.prev('.' + Slider.StyleClass).remove();
        this.$el.nextAll('.' + Slider.TickContainerClass).remove();
        this.$el.nextAll('.' + Slider.LabelContainerClass).remove();
        this.$el.removeData('slider');
        this.$el.removeAttr('data-uid');
        this.$el.off('input change');

        elem.removeData('slider');

        this.options.onDestroy();
    }
}

+function ($) {
    'use strict';

    var createStyleElement = () => $('<style />', {type: 'text/css', class: Slider.StyleClass});
    var createInputElement = (value: number, disabled: boolean) => $('<input />',
        {type: 'range', class: Slider.InputClass, value: value}).prop('disabled', disabled);
    var createTickContainer = () => $('<div />', {class: Slider.TickContainerClass});
    var createLabelContainer = () => $('<div />', {class: Slider.LabelContainerClass});
    var createLabelElements = (container: JQuery, labels: Label[]) => {
        _.chain(labels)
            .sortBy((label: Label) => label.index)
            .each((label: Label) => {
                var $el = $('<div />', {
                    class: Slider.LabelClass,
                    text: label.label || label.index,
                    'data-index': label.index
                });
                container.append($el)
            });
    };

    var createTickElements = (container: JQuery, ticks: number[]) => {
        _.chain(ticks)
            .sortBy(_.identity)
            .each((tick: number) => {
                var $el = $('<div />', {class: Slider.TickClass, 'data-index': tick});
                container.append($el)
            });
    };

    $.fn.slider = function (opts?: SliderOptions|number|string) {
        var $this = $(this);
        opts = opts || {slider: $this};
        var slider: Slider = $this.data('slider');

        if (_.isNumber(opts)) {
            opts = {value: <number>opts};
        }

        if (slider && slider instanceof Slider) {
            var slider: Slider = $this.data('slider');
            if (opts && !_.isUndefined((<SliderOptions>opts).value)) {
                slider.value = (<SliderOptions>opts).value;
                validateAndCreateElements($this, {value: slider.value});
                slider.update();
            } else if (_.isString(opts)) {
                validateAndCreateElements($this, slider.value);
                switch (<string>opts) {
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
            } else {
                //no param. update
                validateAndCreateElements($this, {value: slider.value});
                slider.update();
            }
        } else if (!_.isString(opts) && !_.isNumber(opts)) {
            var sliderOptions = <SliderOptions>opts;

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

    function validateAndCreateElements($el: JQuery, opts?: SliderOptions) {
        var style: JQuery;
        var input: JQuery;
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
                var ticks: number[] = _.isBoolean(opts.ticks) && opts.ticks ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1),
                    opts.step || 1)
                    : <number[]>opts.ticks;
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
                var labels: Array<number|Label> = _.isBoolean(opts.labels) && opts.labels ? _.range(opts.min || 0,
                    (opts.max || 100) + (opts.step || 1), opts.step || 1) : <Label[]>opts.labels;

                if (labels && labels.length) {
                    labels = _.map(labels, (label: number|Label): Label => _.isNumber(label) ? <Label>{index: label} : <Label>label);

                    if (labelsContainer.length == 0) {
                        labelsContainer = createLabelContainer();
                    }
                    createLabelElements(labelsContainer, <Label[]>labels);
                    $el.after(labelsContainer);
                }
                opts.labels = <Label[]>labels;
            }
        } else {
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
            } else if (_.isNumber(opts.value)) {
                input.val(opts.value);
            }

            if (opts && opts.ticks) {
                var ticksContainer = $el.children('.' + Slider.TickContainerClass);
                var ticks: number[] = _.isBoolean(opts.ticks) && opts.ticks ? _.range(opts.min || 0, (opts.max || 100) + (opts.step || 1),
                    opts.step || 1)
                    : <number[]>opts.ticks;
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
                var labels: Array<number|Label> = _.isBoolean(opts.labels) && opts.labels ? _.range(opts.min || 0,
                    (opts.max || 100) + (opts.step || 1), opts.step || 1) : <Label[]>opts.labels;

                if (labels && labels.length) {
                    labels = _.map(labels, (label: number|Label): Label => _.isNumber(label) ? <Label>{index: label} : <Label>label);

                    if (labelsContainer.length == 0) {
                        labelsContainer = createLabelContainer();
                    }
                    createLabelElements(labelsContainer, <Label[]>labels);
                    $el.append(labelsContainer);
                }
                opts.labels = <Label[]>labels;
            }
        }
        return {
            input: input,
            style: style
        };
    }
}(jQuery);
