var gpio = require('rpi-gpio');
var omapper = require('o-mapper');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var OPTIONS_SCHEMA = {
    pin: {
        // pin number is mandatory
        required: true
    },
    loop: {
        // defaulting to loop time of 1.5 seconds
        default: 1500
    }
};

function Sensor(options) {
    EventEmitter.call(this);

    options = omapper(options, OPTIONS_SCHEMA);
    this.pin = options.pin;
    this.loop = options.loop;
    this.movement = false;
    this.lastMovement = undefined;
    this.interval = undefined;
}

util.inherits(Sensor, EventEmitter)

Sensor.prototype.start = function (cb) {
    function startMovementDetection(err) {
        if (err) {
            console.error(err);
        } else {
            this.interval = setInterval(this.readPir.bind(this), this.loop);
        }
        if (cb) {
            cb(err);
        }

        return this.interval;
    }

    gpio.setMode(gpio.MODE_RPI);

    gpio.setup(this.pin, gpio.DIR_IN, startMovementDetection.bind(this));
};

Sensor.prototype.stop = function () {
    if (!this.interval) {
        return false;
    }

    clearInterval(this.interval);
    this.interval = undefined;

    return true;
};


Sensor.prototype.readPir = function () {
    gpio.read(this.pin, function (err, value) {

        if (value === this.movement) {
            return;
        }

        this.movement = value;
        if (this.movement) {
            this.lastMovement = new Date();
            this.emit('movement');
        }
    }.bind(this));
}

module.exports = Sensor;
