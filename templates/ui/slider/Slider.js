import Sizer from '../sizer/Sizer.js';
import OnDragThumb from './OnDragThumb.js';
import OnTouchTrack from './OnTouchTrack.js';
import GetStartPoint from './GetStartPoint.js';
import GetEndPoint from './GetEndPoint.js';
import UpdateThumb from './UpdateThumb.js';
import UpdateIndicator from './UpdateIndicator.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const Clamp = Phaser.Math.Clamp;
const Linear = Phaser.Math.Linear;
const Percent = Phaser.Math.Percent;

class Slider extends Sizer {
    constructor(scene, config) {
        // Create sizer
        super(scene, config);
        this.type = 'rexSlider';

        // Add elements
        var background = GetValue(config, 'background', undefined);
        var track = GetValue(config, 'track', undefined);
        var indicator = GetValue(config, 'indicator', undefined);
        var thumb = GetValue(config, 'thumb', undefined);


        if (background) {
            this.addBackground(background);
        }

        if (track) {
            this.add(track, 0, undefined, 0, true);
        }
        if (indicator) {
            this.add(indicator, null); // Put into container but not layout it
        }

        if (thumb) {
            this.add(thumb, null); // Put into container but not layout it

        }

        // Input
        var inputMode = GetValue(config, 'input', 0);
        if (typeof (inputMode) === 'string') {
            inputMode = INPUTMODE[inputMode];
        }
        switch (inputMode) {
            case 0: // 'drag'
                if (thumb) {
                    thumb.setInteractive();
                    this.scene.input.setDraggable(thumb);
                    thumb.on('drag', OnDragThumb, this);
                }
                break;
            case 1: // 'click'
                this.setInteractive()
                    .on('pointerdown', OnTouchTrack, this)
                    .on('pointermove', OnTouchTrack, this);
                break;
        }

        this.childrenMap = {};
        this.childrenMap.background = background;
        this.childrenMap.track = track;
        this.childrenMap.indicator = indicator;
        this.childrenMap.thumb = thumb;

        var callback = GetValue(config, 'valuechangeCallback', null);
        if (callback !== null) {
            var scope = GetValue(config, 'valuechangeCallbackScope', undefined);
            this.on('valuechange', callback, scope);
        }
        this.setEnable(GetValue(config, 'enable', undefined));
        this.setValue(GetValue(config, 'value', 0));
    }

    setEnable(enable) {
        if (enable === undefined) {
            enable = true;
        }
        this.enable = enable;
        return this;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (!this.enable) {
            return;
        }
        var oldValue = this._value;
        this._value = Clamp(value, 0, 1);

        if (oldValue !== this._value) {
            this.updateThumb(this._value);
            this.updateIndicator(this._value);
            this.emit('valuechange', this._value, oldValue, this);
        }
    }

    setValue(value, min, max) {
        if (min !== undefined) {
            value = Percent(value, min, max);
        }
        this.value = value;
        return this;
    }

    addValue(inc, min, max) {
        if (min !== undefined) {
            inc = Percent(inc, min, max);
        }
        this.value += inc;
        return this;
    }

    getValue(min, max) {
        var value = this.value;
        if (min !== undefined) {
            value = Linear(min, max, value);
        }
        return value;
    }

    layout(parent) {
        super.layout(parent);
        this.updateThumb();
        this.updateIndicator();
        return this;
    }
}

const INPUTMODE = {
    drag: 0,
    click: 1,
    none: -1,
}

var methods = {
    getStartPoint: GetStartPoint,
    getEndPoint: GetEndPoint,
    updateThumb: UpdateThumb,
    updateIndicator: UpdateIndicator,
}
Object.assign(
    Slider.prototype,
    methods
);

const defaultConfig = {};

export default Slider;