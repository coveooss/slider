/// <reference path="../typings/jquery/jquery.d.ts" />

interface Colors {
    lower: string;
    upper: string;
}

interface Label {
    index: number,
    label?: string,
    align?: string;
}

interface SliderOptions {
    slider?: JQuery;
    colors?: Colors;
    labels?: boolean|Array<Label|number>;
    value?: number;
    max?: number;
    min?: number;
    step?: number;
    ticks?: number[]|boolean;
    title?: boolean;
    thumbWidth?: number;
    onInit?: (slider: Slider) => void;
    onSlide?: (slider: Slider) => void;
    onChange?: (slider: Slider) => void;
    onDestroy?: () => void;
    disabled?: boolean;
}

interface ParsedSliderOptions {
    colors: Colors;
    labels: Label[];
    value: number;
    max: number;
    min: number;
    step: number;
    ticks: number[];
    thumbWidth: number;
    onInit: (slider: Slider) => void;
    onSlide: (slider: Slider) => void;
    onChange: (slider: Slider) => void;
    onDestroy: () => void;
}

interface JQuery {
    slider(opts?: SliderOptions|number): JQuery;
}
