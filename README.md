## PIR sensor library for the Raspberry Pi

[![Build Status](https://travis-ci.org/opedromiranda/pi-pir-sensor.svg)](https://travis-ci.org/opedromiranda/pi-pir-sensor)

### Usage
```javascript
var Sensor = require('pi-pir-sensor');
var sensor = new Sensor({
    // pin number must be specified
    pin: 12,

    // loop time to check PIR sensor, defaults to 1.5 seconds
    loop: 1500
});

sensor.on('movement', function () {
    // who's there?
});

sensor.start();
```

### Methods

#### start()
Starts reading sensor

#### stop()
Stops reading sensor


### Properties

#### pin
Pin number

#### loop
Loop interval

#### lastMovement
Date of last registered movement
