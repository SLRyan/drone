var Cylon = require('cylon');
var utils = require('./utils/droneUtils.js');
var bot;

// Initialise the robot
Cylon.robot()
    .connection("ardrone", {
        adaptor: 'ardrone',
        port: '192.168.1.1'
    })
    .device("drone", {
        driver: "ardrone",
        connection: "ardrone"
    })
    .device("nav", {
        driver: "ardrone-nav",      // Combine with a second device to have more information
        connection: "ardrone"
    })
    .on("ready", fly);

// Fly the bot
function fly(robot) {
    // Only retrieve a limited amount of navigation data
    // As recommended by Parrot AR Drone developer's guide
    bot = robot;
    bot.drone.config('general:navdata_demo', 'TRUE');

    bot.nav.on("navdata", function(data) {
        //console.log(data);
    });

    bot.nav.on("altitudeChange", function(data) {
        //console.log("Altitude:", data);
    });

    bot.nav.on("batteryChange", function(data) {
        console.log("Battery level:", data);
    });

    // Get the stream of images from the drone
    bot.drone.getPngStream().on("data", utils.sendFrame);
    utils.instructionListener.on('move', moveDrone);

    // Disable emergency setting if there was any
    bot.drone.disableEmergency();
    // Tell the drone it is lying horizontally
    bot.drone.ftrim();

    // Take off
    bot.drone.takeoff();

    after(5*1000, function() {
        bot.drone.forward(0.05);
    });

    after(30*1000, function() {
        bot.drone.land();
    });
    after(35*1000, function() {
        bot.drone.stop();
    });
}

function moveDrone(move) {
    console.log("received", move);
    if (move.left) {
        console.log("Moving left");
        bot.drone.left(0.2);
        bot.drone.forward(0);
        after(0.5*1000, function() {
            bot.drone.left(0);
            bot.drone.forward(0.05);
        });
    }

    if (move.right) {
        console.log("Moving right");
        bot.drone.right(0.2);
        bot.drone.forward(0);
        after(0.5*1000, function() {
            bot.drone.right(0);
            bot.drone.forward(0.05);
        });
    }
}

Cylon.start();