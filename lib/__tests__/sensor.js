var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var gpio = require('rpi-gpio');
var Sensor = require('../sensor.js');

describe('Sensor', function () {
    sinon.useFakeTimers();
    beforeEach(function () {
        sinon.spy(gpio, 'setup');
        sinon.spy(gpio, 'setMode');
        sinon.stub(gpio, 'read');
    });

    afterEach(function () {
        gpio.setup.restore();
        gpio.setMode.restore();
        gpio.read.restore();
    });

    describe('constructor', function () {

        it('should instantiate sensor with given pin number and default loop value', function () {
            var sensor = new Sensor({
                pin: 12
            });

            expect(sensor.pin).to.equal(12);
            expect(sensor.loop).to.equal(1500);
        });

        it('should instantiate sensor with given pin number and given loop value', function () {
            var sensor = new Sensor({
                pin: 12,
                loop: 1000
            });

            expect(sensor.pin).to.equal(12);
            expect(sensor.loop).to.equal(1000);
        });

        it('should throw an exception if pin number is missing', function () {
            expect(function () {
                new Sensor({});
            }).to.throw('field pin is required and missing');

            expect(function () {
                new Sensor();
            }).to.throw('Cannot read property \'pin\' of undefined');
        });
    });

    describe('start', function () {


        it('should start movement detection and call callback if existing', function () {
            var sensor = new Sensor({
                pin: 12
            });
            var cbSpy = sinon.spy();
            var startMovementDetectionFn;

            sensor.start(cbSpy);

            expect(gpio.setup.withArgs(12).calledOnce).to.equal(true);

            startMovementDetectionFn = gpio.setup.getCall(0).args[2];
            startMovementDetectionFn(false);

            expect(sensor.interval).to.not.equal(undefined);
            expect(cbSpy.withArgs(false).calledOnce).to.equal(true);
        });

        it('should not start movement detection if an error occurs', function () {
            var sensor = new Sensor({
                pin: 12
            });
            var cbSpy = sinon.spy();
            var startMovementDetectionFn;

            sensor.start();

            startMovementDetectionFn = gpio.setup.getCall(0).args[2];
            startMovementDetectionFn(true);

            expect(sensor.interval).to.equal(undefined);
        });
    });

    describe('stop', function () {

        it('should do nothing if sensor wasn\'t started', function () {
            var sensor = new Sensor({
                pin: 12
            });
            expect(sensor.stop()).to.equal(false);
        });

        it('should clear an active interval', function () {
            var sensor = new Sensor({
                pin: 12
            });

            sensor.start(function () {
                expect(sensor.stop()).to.equal(true);
                expect(sensor.interval).to.equal(undefined);
            });

            startMovementDetectionFn = gpio.setup.getCall(0).args[2];
            startMovementDetectionFn(false);
        });
    });

    describe('readPir', function () {

        it('should emit an event if movement is detected', function () {
            var sensor = new Sensor({
                pin: 12
            });
            var processPirSignalFn;
            var onMovement = sinon.spy();

            sensor.on('movement', onMovement);

            sensor.readPir();

            expect(gpio.read.withArgs(12).calledOnce).to.equal(true);

            processPirSignalFn = gpio.read.getCall(0).args[1];
            processPirSignalFn(false, true);

            expect(onMovement.calledOnce).to.equal(true);
        });

        it('should not emit an event if movement goes from true to false', function () {
            var sensor = new Sensor({
                pin: 12
            });
            sensor.movement = true;

            var processPirSignalFn;
            var onMovement = sinon.spy();

            sensor.on('movement', onMovement);

            sensor.readPir();

            expect(gpio.read.withArgs(12).calledOnce).to.equal(true);

            processPirSignalFn = gpio.read.getCall(0).args[1];
            processPirSignalFn(false, false);

            expect(onMovement.calledOnce).to.equal(false);
        });

        it('should do nothing if movement didn\'t change', function () {
            var sensor = new Sensor({
                pin: 12
            });
            var processPirSignalFn;
            var onMovement = sinon.spy();

            sensor.on('movement', onMovement);

            sensor.readPir();

            processPirSignalFn = gpio.read.getCall(0).args[1];
            processPirSignalFn(false, false);

            expect(onMovement.calledOnce).to.equal(false);
        });

    });
});
