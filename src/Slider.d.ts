/// <reference path="../typings/jquery/jquery.d.ts" />

interface Colors {
    lower: string;
    upper: string;
}

interface SliderOptions {
    slider?: JQuery;
    colors?: Colors;
    labels?: string[];
    value?: number;
    max?: number;
    min?: number;
}

interface JQuery {
    slider(opts?: SliderOptions|number): JQuery;
}
