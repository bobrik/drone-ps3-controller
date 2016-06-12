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

    var flying   = false,
        hovering = false,
        mode = 3, // RC mode : http://blog.milleniumrc.fr/wp-content/uploads/2011/02/Nl30689.jpg
        selectedValue = 0;

    /**
    * Toggle RC mode between 3 and 2
    */
    function toggleMode(){
        if(mode == 3){
            mode = 2;
            console.log("RC mode : 2");
        }else{
            mode = 3;
            console.log("RC mode : 3");
        }
    }

    /**
    * Set RC mode
    */ 
    function setRcMode(){
        if(rdata[2] == 1 && rdata[2] != selectedValue){
            //'select' pushed
            toggleMode();
            selectedValue = 1;
        }
        else if(rdata[2] == 0){
            selectedValue = 0;   
        }
    }

    setInterval(function() {
        setRcMode();

        on("x", rdata[24]);
        on("o", rdata[23]);

        if(mode == 3){
            on("left", {x: rdata[6], y: rdata[7]});
            on("right", {x: rdata[8], y: rdata[9]});    
        }else{
            on("left", {x: rdata[8], y: rdata[9]});
            on("right", {x: rdata[6], y: rdata[7]});    
        }
        
    }, 50);

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
