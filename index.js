(function() {
    require("ps3.js");

    var arDrone  = require("ar-drone"),
        client   = arDrone.createClient(),
        angle    = 128,
        speed    = 0.15;

    client.config('control:altitude_max', 200000)
    client.config('control:control_vz_max', 2000)
    client.config('control:control_yaw', 6.0)
    client.config('control:euler_angle_max', 0.52)

    client.config('control:outdoor', false)
    client.config('control:flight_without_shell', false)

    console.log("Feel free to play with configuration.");
    console.log("Controls:")
    console.log("  Left stick: front/back, left/right");
    console.log("  Right stick: up/down, counterclockwise/clockwise");
    console.log("  O: Takeoff");
    console.log("  X: Land");

    setInterval(function() {
        on("x", rdata[24]);
        on("o", rdata[23]);
        on("left", {x: rdata[6], y: rdata[7]});
        on("right", {x: rdata[8], y: rdata[9]});
    }, 50);
    
    var flying   = false,
        hovering = false;

    function on(type, value) {
        if (type == "x" && value > 50) {
            if (!flying) {
                console.log("takeoff");
                flying = true;
                client.takeoff(function() {
                    hovering = true;
                    console.log("flying");
                });
            }
        }
        
        if (type == "o" && value) {
            if (flying) {
                console.log("land");
                flying   = false;
                hovering = false;
                client.land(function() {
                    console.log("landed");
                    client.stop();
                });
            }
        }
        
        if (hovering) {
            if (type == "left" && value.y <= 128) {
                console.log("front:", (128 - value.y) / angle * speed);
                client.front((128 - value.y) / angle * speed);
            } else if (type == "left" && value.y > 128) {
                console.log("back:", (value.y - 128) / angle * speed);
                client.back((value.y - 128) / angle * speed);
            }

            if (type == "left" && value.x <= 128) {
                console.log("left:", (128 - value.x) / angle * speed);
                client.left((128 - value.x) / angle * speed);
            } else if (type == "left" && value.x > 128) {
                console.log("right:", (value.x - 128) / angle * speed);
                client.right((value.x - 128) / angle * speed);
            }

            if (type == "right" && value.x <= 128) {
                console.log("counterclockwise:", (128 - value.x) / angle * speed);
                client.counterClockwise((128 - value.x) / angle * speed);
            } else if (type == "right" && value.x > 128) {
                console.log("clockwise:", (value.x - 128) / angle * speed);
                client.clockwise((value.x - 128) / angle * speed);
            }

            if (type == "right" && value.y <= 128) {
                console.log("up:", (128 - value.y) / angle * speed);
                client.up((128 - value.y) / angle * speed);
            } else if (type == "right" && value.y > 128) {
                console.log("down:", (value.y - 128) / angle * speed);
                client.down((value.y - 128) / angle * speed);
            }
        }
    }
})();
