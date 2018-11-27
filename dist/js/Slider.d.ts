/// <reference path="../../src/Slider.d.ts" />
declare var CoveoSliderMethods: {
    Destroy: string;
    Disable: string;
    Enable: string;
    Update: string;
};
declare class Slider {
    private colors;
    private options;
    private $el;
    private _uid;
    static LowerDefaultColor: string;
    static UpperDefaultColor: string;
    static StyleClass: string;
    static InputClass: string;
    static LabelContainerClass: string;
    static LabelClass: string;
    static TickContainerClass: string;
    static TickClass: string;
    static DefaultValue: number;
    static _uid: number;
    constructor(options: SliderOptions);
    private onInput;
    private onChange;
    defaults(colors?: Colors): ParsedSliderOptions;
    update(): void;
    private positionElements;
    private updateSliderColors;
    value: number;
    readonly min: number;
    readonly max: number;
    disable(): void;
    enable(): void;
    destroy(elem: JQuery): void;
}
