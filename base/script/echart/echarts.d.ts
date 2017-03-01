/**
 * echart typedefinition
 */

interface ECharts {
    init(dom: HTMLDivElement | HTMLCanvasElement, theme?: Object | string, opts?: {
        devicePixelRatio?: number,
        renderer?: string,
        width?: number | string,
        height?: number | string,
    }): EChartsInstance;

    connect(group: string | Array<any>): void;
    disConnect(group: string): void;
    dispose(target: EChartsInstance | HTMLDivElement | HTMLCanvasElement): void;
}

interface EChartsInstance {
    group: string | number;

    setOption(option: Object, notMerge?: boolean, lazyUpdate?: boolean): void;

    getWidth: Function;

    getHeight: Function;

    getDom: Function;

    getOption: Function;

    resize: Function;

    dispatchAction: Function;

    on: Function;

    off: Function;

    convertToPixel: Function;

    convertFromPixel: Function;

    containPixel: Function;

    showLoading: Function;

    hideLoading: Function;

    getDataURL: Function
}

declare module "echarts" {
    var echartobj: ECharts;
    export = echartobj;
}