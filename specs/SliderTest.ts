/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../dist/js/Slider.d.ts" />

describe('Coveo Slider', () => {
    var inputSelector = `input[type="range"].${Slider.InputElementClass}`;
    var styleSelector = `style.${Slider.StyleElementClass}`;

    it('should exists on JQuery elements', () => {
        expect($('body').slider).toBeDefined();
    });

    describe('Initialized on a JQuery element', () => {
        var $input: JQuery;
        var min = 100;
        var max = 1000;
        var initialValue = 500;
        beforeEach(() => {
            $input = $(`<input type="range" class="coveo-input-slider" min="${min}" max="${max}" value="${initialValue}">`);
            $('body').append($input);
        });

        afterEach(() => {
            $('body').empty();
        });

        it('should put the slider instance in the element data', () => {
            expect($input.data()).toEqual({}, 'precondition failed');

            $input.slider();

            expect($input.data().slider).toBeDefined();
            expect($input.data().slider instanceof Slider).toBe(true);
        });

        it('should add a style tag if the previous element is not one', () => {
            var selector = `style.${Slider.StyleElementClass}`;
            expect($input.prevAll(selector).length).toBe(0);

            $input.slider();

            expect($input.prevAll(selector).length).toBe(1);
        });

        it('should not add a style tag if the previous element is one', () => {
            var selector = `style.${Slider.StyleElementClass}`;
            var $el = $('<style />', {type: 'text/css', class: Slider.StyleElementClass});
            $input.before($el);

            expect($input.prevAll(selector).length).toBe(1);

            $input.slider();

            expect($input.prevAll(selector).length).toBe(1);
        });

        it('should use the element min/max/value', () => {
            $input.slider();
            var slider = $input.data().slider;
            expect(slider.min).toEqual(min);
            expect(slider.max).toEqual(max);
            expect(slider.value).toEqual(initialValue);
        });
    });

    describe('With empty element', () => {
        var $el: JQuery;

        beforeEach(() => {
            $el = $('<div />');
            $('body').append($el);
        });

        afterEach(() => {
            $('body').empty();
        });

        it('should create nested elements', () => {
            expect($el.children().length).toBe(0);
            $el.slider();
            expect($el.children().length).toBeGreaterThan(0);
        });

        it('should contains a style element', () => {
            expect($el.children(styleSelector).length).toBe(0);
            $el.slider();
            expect($el.children(styleSelector).length).toBe(1);
        });

        it('should contains an input of type "range"', () => {
            expect($el.children(inputSelector).length).toBe(0);
            $el.slider();
            expect($el.children(inputSelector).length).toBe(1);
        });

        it('should not add a style tag if it contains one', () => {
            var $style = $('<style />', {type: 'text/css', class: Slider.StyleElementClass});
            $el.append($style);

            expect($el.children(styleSelector).length).toBe(1);

            $el.slider();

            expect($el.children(styleSelector).length).toBe(1);
        });

        it('should not add an input tag if it contains one', () => {
            var $input = $('<input />', {type: 'range', class: Slider.InputElementClass, value: Slider.DefaultValue});
            $el.append($input);

            expect($el.children(inputSelector).length).toBe(1);

            $el.slider();

            expect($el.children(inputSelector).length).toBe(1);
        });
    });

    describe('With an existing slider', () => {
        var $el: JQuery;
        var min = 0;
        var max = 50;
        var initialValue = 25;
        beforeAll(() => {
            $el = $('<div />');
            $('body').append($el);
            $el.slider({
                value: initialValue,
                min: min,
                max: max
            });
        });

        it('should not throw if we call it again', () => {
            $el.slider();
            $el.slider({slider: $el});
        });

        it('should be possible to update the value', () => {
            var originalValue = $el.data('slider').value;

            $el.slider(42);

            expect($el.data('slider').value).not.toEqual(originalValue);
            expect($el.data('slider').value).toEqual(42);

            $el.slider({value: 43});
            expect($el.data('slider').value).toEqual(43);
        });

        it('should not update for values above maximum', () => {
            $el.slider(max + 1000);
            expect($el.data('slider').value).toEqual(max);
        });

        it('should not update for values under minimum', () => {
            $el.slider(min - 1000);
            expect($el.data('slider').value).toEqual(min);
        });

        it('should update the style tag when slider is changed', () => {
            var notExpected = $el.children(styleSelector).html();

            $el.children(inputSelector).val(max - 5).change();
            expect($el.children(styleSelector).html()).not.toEqual(notExpected);
        });

        it('should not throw if the user remove the style tag', () => {
            $el.children(styleSelector).remove();
            expect($el.children(styleSelector).length).toBe(0);

            expect(() => $el.slider()).not.toThrow();

            expect($el.children(styleSelector).length).toBe(1);
        });

        it('should not have side effect when called with an unknown method', () => {
            var expected = $el.data('slider');

            expect(() => $el.slider('this is not a method')).not.toThrow();
            expect($el.data('slider')).toEqual(expected);
        });

        it('should be destroyable', () => {
            expect($el.children(styleSelector).length).toBe(1);

            expect(() => $el.slider('destroy')).not.toThrow();

            expect($el.children(styleSelector).length).toBe(0);

            //recreate the slider for the other tests
            $el.slider();
        });
    });
});
