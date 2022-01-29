// https://createjs.com/Docs/TweenJS/modules/TweenJS.html
// view-source:https://createjs.com/Demos/EaselJS/Game.html COPY THIS
var stage, w, h, loader, pipe1height, pipe2height, pipe3height, startX, startY, wiggleDelta;
var background, bird, ground, pipe, bottomPipe, pipes, rotationDelta, counter, counterOutline;
var started = false; 
var startJump = false;
var title, tap, must, musts, play, pause, bgm;

var jumpAmount = 120;
var jumpTime = 266;

var dead = false;
var KEYCODE_SPACE = 32;
var gap = 250;
var masterPipeDelay = 88;
var pipeDelay = masterPipeDelay;
var masterPipeSec = 1000;

var counterShow = false;

var isFirst = false;

function init() {
    document.onkeydown = function(keyE) {
        if(keyE.keyCode == 123) {
            keyE.preventDefault(); 
            keyE.returnValue = false;
        }
    }
	
    toast("KONA HAWAIIANS");
    if (window.top != window) {
        //document.getElementById("header").style.display = "none";
    }

    // createjs.MotionGuidePlugin.install();

    stage = new createjs.Stage("testCanvas");

    createjs.Touch.enable(stage);
    // stage.canvas.width = document.body.clientWidth; //document.width is obsolete
    // stage.canvas.height = document.body.clientHeight; //document.height is obsolete
    
    w = stage.canvas.width;
    h = stage.canvas.height;

    manifest = [
        {src:"img/bird2.png", id:"bird"},
        {src:"img/background.png", id:"background"},
        {src:"img/ground.png", id:"ground"},
        {src:"img/pipe2.png", id:"pipe"},
        {src:"img/restart.png", id:"start"},
        {src:"img/share.png", id:"share"},
        {src:"img/title.png", id:"title"},
        {src:"img/must.png", id:"must"},
	{src:"img/cookie1.png", id:"must1"},
        {src:"img/cookie2.png", id:"must2"},
        {src:"img/cookie3.png", id:"must3"},
        {src:"img/cookie4.png", id:"must4"},
        {src:"img/cookie5.png", id:"must5"},
        {src:"img/cookie6.png", id:"must6"},
        {src:"img/tap.png", id:"tap"},
	{src:"img/play.png", id:"play"},
        {src:"img/pause.png", id:"pause"},
        {src:"https://ssl.pstatic.net/static/clova/service/clova_ai/event/handwriting/download/나눔손글씨 달의궤도.ttf"}
    ];

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("progress", handleProgress);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest);
    
    createjs.Sound.on("fileload", soundComplete);
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.registerSounds(
        [{id:"fail", src:"fail1.mp3"},
        {id:"bgm", src:"bgm.mp3"}
	]
    , "assets/");
}

function handleProgress(e) {
    document.getElementById('loading').innerHTML = 'Loading...' + (e.loaded * 100).toFixed(0) + '%';
}

function handleComplete() {
    document.getElementsByTagName('body')[0].removeChild(document.getElementById('loading'));
    background = new createjs.Shape();
    background.graphics.beginBitmapFill(loader.getResult("background")).drawRect(0,0,w,h);
    
    var groundImg = loader.getResult("ground");
    ground = new createjs.Shape();
    ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, w+groundImg.width, groundImg.height);
    ground.tileW = groundImg.width;
    ground.y = h-groundImg.height;
    
    var data = new createjs.SpriteSheet({
        "images": [loader.getResult("bird")],
        //set center and size of frames, center is important for later bird roation
        "frames": {"width": 66, "height": 80, "regX": 46, "regY": 32, "count": 3}, 
        // define two animations, run (loops, 0.21x speed) and dive (returns to dive and holds frame one static):
        "animations": {"fly": [0, 1, "fly", 0.21], "dive": [2, 2, "dive", 1]}
    });
    bird = new createjs.Sprite(data, "fly");

    startX = (w/2) - (92/2);
    startY = 512;
    wiggleDelta = 18;
	
    // Set initial position and scale 1 to 1
    //bird.setTransform(startX, startY, 1, 1);
    bird.setTransform(startX-60, startY-250, 1, 1);
    // Set framerate
    bird.framerate = 30;

    //338, 512
    // Use a tween to wiggle the bird up and down using a sineInOut Ease
    //createjs.Tween.get(bird, {loop:true}).to({y:startY + wiggleDelta}, 380, createjs.Ease.sineInOut).to({y:startY}, 380, createjs.Ease.sineInOut);
	
    stage.addChild(background);

    pipes = new createjs.Container(); 
    stage.addChild(pipes);

    
    stage.addEventListener("stagemousedown", handleJumpStart);
    
    counter = new createjs.Text(0, "96px 'Dal Font'", "#ffffff");
    counterOutline = new createjs.Text(0, "96px 'Dal Font'", "#000000");
    counterOutline.outline = 5;
    counterOutline.textAlign = 'center';
    counter.textAlign = 'center';
    counterOutline.x = w/2;
    counterOutline.y = 150;
    counter.x = w/2;
    counter.y = 150;
    counter.alpha = 1;
    counterOutline.alpha = 1;
    //stage.addChild(counter, counterOutline);
    
    title = new createjs.Bitmap(loader.getResult("title"));
    //title.alpha = 0;
    title.scaleX = 0.8;
    title.scaleY = 0.8;
    title.x = w/2 - title.image.width/2 * 0.8;
    title.y = h/2 - title.image.height/2 * 0.8 - 300;
	//createjs.Tween.get(title, {loop:true}).to({y:title.x + wiggleDelta}, 380, createjs.Ease.sineInOut).to({y:title.x}, 380, createjs.Ease.sineInOut);
    stage.addChild(title);
    
    tap = new createjs.Bitmap(loader.getResult("tap"));
    //title.alpha = 0;
    tap.scaleX = 0.1;
    tap.scaleY = 0.1;
    tap.x = w/2 - tap.image.width/2 * 0.1;
    tap.y = h/2 - tap.image.height/2 * 0.1 + 100;
	createjs.Tween.get(tap, {loop:true}).to({alpha:0, visible:false}, 580, createjs.Ease.sineInOut).to({alpha:100, visible:true}, 580, createjs.Ease.sineInOut);
    stage.addChild(tap);
    
    stage.addChild(bird, ground);
    
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
}

function soundComplete(event) {
    //if(event.id == "bgm") {
//	setTimeout(function() {
//		document.getElementById('sound').click();
 //       	document.getElementsByTagName('body')[0].removeChild(document.getElementById('sound'));
//	},1000);
 //   }
}

function playSound(){
    var props = new createjs.PlayPropsConfig().set({interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, volume: 0.5})
    bgm = createjs.Sound.play("bgm", props);
    pause = new createjs.Bitmap(loader.getResult("pause"));
    pause.x = 10;
    pause.y = 10;
    stage.addChild(pause);
    pause.addEventListener("click", addClickToPause);
}

function addClickToPause(e) {
    stage.removeChild(pause);
    play = new createjs.Bitmap(loader.getResult("play"));
    play.x = 10;
    play.y = 10;
    stage.addChild(play);
    play.addEventListener("click", addClickToPlay);
    bgm.volume = 0;
}

function addClickToPlay(e) {
    stage.removeChild(play);
    pause = new createjs.Bitmap(loader.getResult("pause"));
    pause.x = 10;
    pause.y = 10;
    stage.addChild(pause);
    pause.addEventListener("click", addClickToPause);
    bgm.volume = 1;
}

function handleFileLoad(event) {
    // A sound has been preloaded. This will fire TWICE
    console.log("Preloaded:", event.id, event.src);
}

function handleJumpStart() {
    if (!dead) {
        createjs.Tween.removeTweens ( bird );
        bird.gotoAndPlay("jump");
        startJump = true;
        if (!started) {
            started = true;
            counterShow = true ;                       
        }
        
//        for(var i = 0; i < 3 + Math.floor( Math.random() * 5); i++) {
//	    	var mustd = new createjs.Bitmap(loader.getResult("must" + Math.floor( Math.random()* 6)));
//	       	mustd.setTransform(bird.x - 70 - Math.floor( Math.random()* 20), bird.y-10 - Math.floor( Math.random()* 20), 1, 1);
//			stage.addChild(mustd);
//			createjs.Tween.get(mustd).to({alpha:1*Math.random(), scale:1*Math.random(), rotation: 0, visible:true}, 80, createjs.Ease.sineInOut).to({alpha:0, scale:0, rotation: 360, visible:false}, 580, createjs.Ease.sineInOut).call(function(){
//				stage.removeChild(mustd);
//			});
//		}
        var must = new createjs.Bitmap(loader.getResult("must"));
        must.setTransform(bird.x - 70 - Math.floor( Math.random()* 20), bird.y-10 - Math.floor( Math.random()* 20), 1, 1);
        stage.addChild(must);
        createjs.Tween.get(must).to({alpha:1*Math.random(), scale:1*Math.random(), rotation: 0, visible:true}, 80, createjs.Ease.sineInOut).to({alpha:0, scale:0, rotation: 360, visible:false}, 580, createjs.Ease.sineInOut).call(function(){
            stage.removeChild(must);
        });
    }
}

function diveBird() {
    bird.gotoAndPlay("dive");
}

function restart() {
    pipes.removeAllChildren();
    //musts.removeAllChildren();
    createjs.Tween.get(start).to({y:start.y + 10}, 50).call(removeStart);
    counter.text = 0;
    counterOutline.text = 0;
    counterOutline.alpha = 0;
    counter.alpha = 0;
    counterShow = false;
   // stage.addChild(counter, counterOutline);
    pipeDelay = masterPipeDelay;
    dead = false;
    started = false;
    startJump = false;
    createjs.Tween.removeTweens ( bird );
    bird.x = startX;
    bird.y = startY;
    bird.rotation = 0;
    bird.gotoAndPlay("fly");
    createjs.Tween.get(bird, {loop:true}).to({y:startY + wiggleDelta}, 380, createjs.Ease.sineInOut).to({y:startY}, 380, createjs.Ease.sineInOut);
}

function die() {
    createjs.Sound.play("fail");
    dead = true;
    masterPipeDelay=88;
    masterPipeSec=1000;
    bird.gotoAndPlay("dive");
    createjs.Tween.removeTweens ( bird );
    createjs.Tween.get(bird).wait(0).to({y:bird.y + 200, rotation: 90}, (380)/1.5, createjs.Ease.linear) //rotate back
            .call(diveBird) // change bird to diving position
            .to({y:ground.y+200}, (h - (bird.y+300))/1.5, createjs.Ease.linear); //drop to the bedrock
    createjs.Tween.get(stage).to({alpha:0}, 100).to({alpha:1}, 100);
    start = new createjs.Bitmap(loader.getResult("start"));
    start.alpha = 0;
    start.x = w/2 - start.image.width/2;
    start.y = h/2 - start.image.height/2 - 150;
    share = new createjs.Bitmap(loader.getResult("share"));
    share.alpha = 0;
    share.x = w/2 - share.image.width/2;
    share.y = h/2 - share.image.height/2 - 50;

    stage.addChild(start);
    stage.addChild(share);
    createjs.Tween.get(start).to({alpha:1, y: start.y + 50}, 400, createjs.Ease.sineIn).call(addClickToStart);
    createjs.Tween.get(share).to({alpha:1, y: share.y + 50}, 400, createjs.Ease.sineIn).call(addClickToStart);
    
}
function removeStart() {
    stage.removeChild(start);
    stage.removeChild(share);
}
function addClickToStart() {
    start.addEventListener("click", restart);
    share.addEventListener("click", goShare);
}

function goShare() {
    var countText;
    if (counter.text == 1) {
        countText = "1";
    } else {
        countText = counter.text;
    }
    window.open("https://twitter.com/share?url=https://address.com&text=[BREAKING] " + countText +  "点です");
}

function tick(event) {
    var deltaS = event.delta/masterPipeSec;

    var l = pipes._getNumChildren();

    if (bird.y > (ground.y - 40) || bird.y < 0) {
        if (!dead) {
            die();
        }
        if (bird.y > (ground.y - 30)) {
            createjs.Tween.removeTweens ( bird );
        }
    }
    
    if (!dead) {
        ground.x = (ground.x-deltaS*300) % ground.tileW;
    }


    if (started && !dead) {
        if (pipeDelay == 0) {

            pipe = new createjs.Bitmap(loader.getResult("pipe"));
            pipe.x = w+600;
            pipe.y = (ground.y - gap*2) * Math.random() + gap*1.5;
            pipes.addChild(pipe);
            // createjs.Tween.get(pipe).to({x:0 - pipe.image.width}, 5100)

            pipe2 = new createjs.Bitmap(loader.getResult("pipe"));
            pipe2.scaleX = -1;
            pipe2.rotation = 180;
            pipe2.x = pipe.x; //+ pipe.image.width
            pipe2.y = pipe.y - gap;
            // createjs.Tween.get(pipe2).to({x:0 - pipe.image.width}, 5100)

            pipes.addChild(pipe2);

            pipeDelay = masterPipeDelay;

        } else {
            pipeDelay = pipeDelay - 1;
        }
        for(var i = 0; i < l; i++) {
            pipe = pipes.getChildAt(i);
            if (pipe) {
                if (true) { // pipe.x < bird.x + 92 && pipe.x > bird.x 
                    var collision = ndgmr.checkRectCollision(pipe,bird,1,true);
                    if (collision) {
                        if (collision.width > 15 && collision.height > 40) {
                            die();
                        }
                    }
                }
                pipe.x = (pipe.x - deltaS*300);
                if (pipe.x <= 80 && pipe.rotation == 0 && pipe.name != "counted") {
                    pipe.name = "counted";
                    counter.text = counter.text + 1;
                    counterOutline.text = counterOutline.text + 1;
                }
                if (pipe.x + pipe.image.width <= -pipe.w) { 
                    pipes.removeChild(pipe);
                }
            }
        }
        if (counterShow) {
            counter.alpha = 1;
            counterOutline.alpha = 1;
            counterShow = false;
        }
		// over 50
		//if(counter.text == 50) {
		//	masterPipeDelay = 38;
		//	masterPipeSec = 500;
		//}
    }



    if (startJump == true) {
	if(!isFirst) {
		isFirst = true;
		playSound();
	}
        startJump = false;
        stage.removeChild(title);
        stage.removeChild(tap);
        stage.addChild(counter, counterOutline);
        bird.framerate = 60;
        bird.gotoAndPlay("fly");
        if (bird.roation < 0) {
            rotationDelta = (-bird.rotation - 20)/5;
        } else {
            rotationDelta = (bird.rotation + 20)/5;
        }
        if (bird.y < -200) {
            bird.y = -200;
        }
        createjs
            .Tween
            .get(bird)
            .to({y:bird.y - rotationDelta, rotation: -20}, rotationDelta, createjs.Ease.linear)
            .to({y:bird.y - jumpAmount, rotation: -20}, jumpTime - rotationDelta, createjs.Ease.quadOut) //rotate to jump
            .to({y:bird.y}, jumpTime, createjs.Ease.quadIn) //reverse jump for smooth arch
            .to({y:bird.y + 200, rotation: 90}, (380)/1.5, createjs.Ease.linear) //rotate back
            //.call(diveBird) // change bird to diving position
            .to({y:ground.y - 30}, (h - (bird.y+200))/1.5, createjs.Ease.linear); //drop to the bedrock
    }
    stage.update(event);
}
var removeToast;

function toast(string) {
    var toast = document.getElementById("toast");

	if(toast) {
	toast.classList.contains("reveal") ?
        (clearTimeout(removeToast), removeToast = setTimeout(function () {
            document.getElementById("toast").classList.remove("reveal")
        }, 2000)) :
        removeToast = setTimeout(function () {
            document.getElementById("toast").classList.remove("reveal")
        }, 2000)
    toast.classList.add("reveal"),
        toast.innerText = string
	}
}
