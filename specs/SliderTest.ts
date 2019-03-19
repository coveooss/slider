/// <reference path="../dist/js/Slider.d.ts" />

describe('Coveo Slider', () => {
    const inputSelector = `input[type="range"].${Slider.InputClass}`;
    const styleSelector = `style.${Slider.StyleClass}`;
    const tickContainerSelector = `div.${Slider.TickContainerClass}`;
    const labelContainerSelector = `div.${Slider.LabelContainerClass}`;

    it('should exists on JQuery elements', () => {
        expect($('body').slider).toBeDefined();
    });

    it('should not throw', () => {
        expect(() => $('#nonExistingElement').slider()).not.toThrow();
    });

    it('should return the same JQuery elements', () => {
        const element = $('#nonExistingElement');
        expect(element.slider()).toEqual(jasmine.objectContaining(element));
    });

    describe('Initialized on a JQuery element', () => {
        let $input: JQuery;
        const min = 100;
        const max = 1000;
        const initialValue = 500;
        beforeEach(() => {
            $input = $(`<input type="range" class="coveo-input-slider" min="${min}" max="${max}" value="${initialValue}">`);
            $('body').append($input);
        });

        afterEach(() => {
            $('body').empty();
        });

        it('should be possible to initialize in disabled state', () => {
            expect(() => $input.slider({disabled: true})).not.toThrow();
            expect($input.prop('disabled')).toBe(true);
        });

        it('should be possible to chain calls', () => {
            expect(() => $input.slider().slider('destroy').slider()).not.toThrow();
            expect($input.data().slider instanceof Slider).toBe(true);
        });

        it('should put the slider instance in the element data', () => {
            expect($input.data()).toEqual({}, 'precondition failed');

            $input.slider();

            expect($input.data().slider).toBeDefined();
            expect($input.data().slider instanceof Slider).toBe(true);
        });

        it('should add a style tag if the previous element is not one', () => {
            const selector = `style.${Slider.StyleClass}`;
            expect($input.prevAll(selector).length).toBe(0);

            $input.slider();

            expect($input.prevAll(selector).length).toBe(1);
        });

        it('should not add a style tag if the previous element is one', () => {
            const $el = $('<style />', {type: 'text/css', class: Slider.StyleClass});
            $input.before($el);

            expect($input.prevAll(styleSelector).length).toBe(1);

            $input.slider();

            expect($input.prevAll(styleSelector).length).toBe(1);
        });

        it('should use the element min/max/value', () => {
            $input.slider();
            const slider = $input.data().slider;
            expect(slider.min).toEqual(min);
            expect(slider.max).toEqual(max);
            expect(slider.value).toEqual(initialValue);
        });

        it('should correclty set the percentage', () => {
            $input.slider();
            const expectedPercentage = (initialValue - min) / (max - min) * 100;
            expect($input.prevAll(styleSelector).html()).toContain(expectedPercentage + '%');
        });

        it('should be updatable', () => {
            $input.slider();
            const percentage = (initialValue - min) / (max - min) * 100;

            $input.attr('min', min + 5);
            $input.attr('max', max - 5);

            expect($input.prevAll(styleSelector).html()).toContain(percentage + '%', 'Precondition failed');

            expect(() => $input.slider('update')).not.toThrow();

            expect($input.prevAll(styleSelector).html()).not.toContain(percentage + '%');
        });

        it('should be possible to disable and enable', () => {
            $input.slider();

            expect($input.prop('disabled')).toBe(false);

            expect(() => $input.slider('disable')).not.toThrow();
            expect($input.prop('disabled')).toBe(true);

            expect(() => $input.slider('disable')).not.toThrow();
            expect($input.prop('disabled')).toBe(true);

            expect(() => $input.slider('enable')).not.toThrow();
            expect($input.prop('disabled')).toBe(false);

            expect(() => $input.slider('enable')).not.toThrow();
            expect($input.prop('disabled')).toBe(false);
        });

        it('should be destroyable', () => {
            $input.slider();

            expect($input.prevAll(styleSelector).length).toBe(1);
            expect(() => $input.slider('destroy')).not.toThrow();
            expect($input.prevAll(styleSelector).length).toBe(0);
        });

        it('should not throw when the slider is destroyed', () => {
            $input.slider().slider('destroy');
            expect(() => $input.slider('destroy')).not.toThrow();
        });

        it('should call onSlide when the slider slide', () => {
            const expected = {cb: (slider) => {}};
            const spy = spyOn(expected, 'cb');
            $input.slider({onSlide: expected.cb});

            expect(spy.calls.count()).toBe(0);
            $input.trigger(jQuery.Event('input'), 50);
            expect(spy.calls.count()).toBe(1);
        });

        describe('Ticks', () => {
            it('should be possible to initialize with "ticks: true"', () => {
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({ticks: true})).not.toThrow();
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(1);
            });

            it('should not build ticks when "ticks: false"', () => {
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({ticks: false})).not.toThrow();
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0);
            });

            it('should be possible to initialize with some ticks index', () => {
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({ticks: [min, min + 100, min + 200]})).not.toThrow();
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(1);
                expect($input.nextAll('.' + Slider.TickContainerClass).children().length).toBe(3);
            });

            it('should not create ticks when the list is empty', () => {
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({ticks: []})).not.toThrow();
                expect($input.nextAll('.' + Slider.TickContainerClass).length).toBe(0);
            });

            it('should not add the tick container if one of the next element is one', () => {
                const $el = $('<div />', {class: Slider.TickContainerClass});
                $input.after($el);

                expect($input.nextAll(tickContainerSelector).length).toBe(1);

                $input.slider({ticks: true});

                expect($input.nextAll(tickContainerSelector).length).toBe(1);
            });
        });

        describe('Labels', () => {
            it('should be possible to initialize with "labels: true"', () => {
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({labels: true})).not.toThrow();
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(1);
            });

            it('should not build labels when "labels: false"', () => {
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({labels: false})).not.toThrow();
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0);
            });

            it('should be possible to initialize with some labels index', () => {
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({labels: [min, min + 100, min + 200]})).not.toThrow();
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(1);
                expect($input.nextAll('.' + Slider.LabelContainerClass).children().length).toBe(3);
            });

            it('should be possible to initialize with label objects', () => {
                const expected = 'test';
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({labels: [{index: 0, label: expected}, 50, 100]})).not.toThrow();
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(1);
                expect($input.nextAll('.' + Slider.LabelContainerClass).children().length).toBe(3);
                expect($input.nextAll('.' + Slider.LabelContainerClass).children().first().text()).toEqual(expected);
            });

            it('should not create labels when the list is empty', () => {
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $input.slider({labels: []})).not.toThrow();
                expect($input.nextAll('.' + Slider.LabelContainerClass).length).toBe(0);
            });

            it('should not add the label container if one of the next element is one', () => {
                const $el = $('<div />', {class: Slider.LabelContainerClass});
                $input.after($el);

                expect($input.nextAll(labelContainerSelector).length).toBe(1);

                $input.slider({labels: true});

                expect($input.nextAll(labelContainerSelector).length).toBe(1);
            });
        });
    });

    describe('With empty element', () => {
        let $el: JQuery;

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
            const $style = $('<style />', {type: 'text/css', class: Slider.StyleClass});
            $el.append($style);

            expect($el.children(styleSelector).length).toBe(1);

            $el.slider();

            expect($el.children(styleSelector).length).toBe(1);
        });

        it('should not add an input tag if it contains one', () => {
            const $input = $('<input />', {type: 'range', class: Slider.InputClass, value: Slider.DefaultValue});
            $el.append($input);

            expect($el.children(inputSelector).length).toBe(1);

            $el.slider();

            expect($el.children(inputSelector).length).toBe(1);
        });

        describe('Ticks', () => {
            it('should be possible to initialize with "ticks: true"', () => {
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({ticks: true})).not.toThrow();
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(1);
            });

            it('should not build ticks when "ticks: false"', () => {
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({ticks: false})).not.toThrow();
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0);
            });

            it('should be possible to initialize with some ticks index', () => {
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({ticks: [0, 50, 100]})).not.toThrow();
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(1);
                expect($el.children('.' + Slider.TickContainerClass).children().length).toBe(3);
            });

            it('should not create ticks when the list is empty', () => {
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({ticks: []})).not.toThrow();
                expect($el.children('.' + Slider.TickContainerClass).length).toBe(0);
            });

            it('should not add the tick container if one of the next element is one', () => {
                const $container = $('<div />', {class: Slider.TickContainerClass});
                $el.append($container);

                expect($el.children(tickContainerSelector).length).toBe(1);

                $el.slider({ticks: true});

                expect($el.children(tickContainerSelector).length).toBe(1);
            });

            it('should not throw if the ticks container is removed', () => {
                $el.slider({ticks: true});

                expect($el.children(tickContainerSelector).length).toBe(1);

                $el.children(tickContainerSelector).remove();

                expect(() => $el.slider('update')).not.toThrow();
            });

            it('should not throw if a tick is removed', () => {
                $el.slider({ticks: true});

                expect($el.children(tickContainerSelector).length).toBe(1);

                $el.children(tickContainerSelector).children().first().remove();

                expect(() => $el.slider('update')).not.toThrow();
            });
        });

        describe('Labels', () => {
            it('should be possible to initialize with "labels: true"', () => {
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({labels: true})).not.toThrow();
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(1);
            });

            it('should not build labels when "labels: false"', () => {
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({labels: false})).not.toThrow();
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0);
            });

            it('should be possible to initialize with some labels index', () => {
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({labels: [0, 50, 100]})).not.toThrow();
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(1);
                expect($el.children('.' + Slider.LabelContainerClass).children().length).toBe(3);
            });

            it('should be possible to initialize with label objects', () => {
                const expected = 'test';
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({labels: [{index: 0, label: expected}, 50, 100]})).not.toThrow();
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(1);
                expect($el.children('.' + Slider.LabelContainerClass).children().length).toBe(3);
                expect($el.children('.' + Slider.LabelContainerClass).children().first().text()).toEqual(expected);
            });

            it('should not create labels when the list is empty', () => {
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0, 'Precondition failed');

                expect(() => $el.slider({labels: []})).not.toThrow();
                expect($el.children('.' + Slider.LabelContainerClass).length).toBe(0);
            });

            it('should not add the label container if one of the next element is one', () => {
                const $container = $('<div />', {class: Slider.LabelContainerClass});
                $el.append($container);

                expect($el.children(labelContainerSelector).length).toBe(1);

                $el.slider({labels: true});

                expect($el.children(labelContainerSelector).length).toBe(1);
            });

            it('should not throw if the labels container is removed', () => {
                $el.slider({labels: true});

                expect($el.children(labelContainerSelector).length).toBe(1);

                $el.children(labelContainerSelector).remove();

                expect(() => $el.slider('update')).not.toThrow();
            });

            it('should not throw if a label is removed', () => {
                $el.slider({labels: true});

                expect($el.children(labelContainerSelector).length).toBe(1);

                $el.children(labelContainerSelector).children().first().remove();

                expect(() => $el.slider('update')).not.toThrow();
            });
        });
    });

    describe('With an existing slider', () => {
        let $el: JQuery;
        const min = 0;
        const max = 50;
        const initialValue = 25;
        beforeAll(() => {
            $el = $('<div />');
            $('body').append($el);
            $el.slider({
                value: initialValue,
                min: min,
                max: max,
            });
        });

        it('should not throw if we call it again', () => {
            $el.slider();
            $el.slider({slider: $el});
        });

        it('should be possible to update the value', () => {
            const originalValue = $el.data('slider').value;

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
            const notExpected = $el.children(styleSelector).html();

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
            const expected = $el.data('slider');

            expect(() => $el.slider('this is not a method')).not.toThrow();
            expect($el.data('slider')).toEqual(expected);
        });
    });
});
