let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

let gameTime = 0;
let gameScore = 0;
let gameBounces = 0;
let gameHorizontal = 0;
let gameVertical = 0;
let gameHighScore = 0;
let gameActive = false;
let gamePaused = false;
let pauseUsingEscape = false;
let pauseOnLostFocus = true;
let pauseOnReturn = true;

let paddle = document.getElementById("paddle");
let paddle_front = document.getElementById("paddle_front");
let paddle_centre = document.getElementById("paddle_centre");
let paddle_back = document.getElementById("paddle_back");

let ball = document.getElementById("ball");
let ballVX = 0;
let ballVY = -15;

let mouseX, mouseY, prevMouseX = document.clientY, prevMouseY = document.clientX;

let timeTrigger;
let gameTrigger;
window.onload = function(){
    // startGame();
    // console.log("onload");
    // startGameLoop();
}

let title = document.getElementById("title");
let score = document.getElementById("score");
let pause = document.getElementById("pause");
let final = document.getElementById("final");
let information = document.getElementById("information");
let startGameTrigger = true;
function startGame(){
    if(startGameTrigger){
        startGameTrigger = false;

        title.classList = "hidden";
        final.classList = "hidden";
        gameTime = 0;
        gameScore = 0;
        gameHighScore = getCookie("highscore");
        if(!isFinite(gameHighScore)){
            gameHighScore = 0;
        }
        gameBounces = 0;
        gameHorizontal = 0;
        gameVertical = 0;
        ballVX = 0;
        ballVY = -15;
        setTimeout(() => {
            gameActive = true;
            gamePaused = false;
            startGameLoop();
            score.classList = "visible";
        }, 500);

        ball.style = "position: absolute; left: calc(50dvw - 50px); top: calc(25dvh - 50px);";
        paddle.style = "position: absolute; left: calc(50dvw - 100px); top: calc(75dvh - 50px);";
        paddle_back.style.rotate = "0deg";
        paddle_front.style.rotate = "0deg";
        ball.classList = "visible";
        paddle.classList = "visible";

        setTimeout(() => {
            startGameTrigger = true;
        }, 750);
    }
}

function startGameLoop(){
    // reset scores
    gameTime = 0;
    timeTrigger = setInterval(timeLoop, 10);
    gameTrigger = setInterval(gameLoop, 10);
}
function resumeGameLoop(){
    score.classList = "visible";
    pause.classList = "hidden";
    gamePaused = false;
    gameTrigger = setInterval(gameLoop, 10);
}
function pauseGameLoop(){
    score.classList = "hidden";
    pause.classList = "visible";
    gamePaused = true;
    clearInterval(gameTrigger);
}
function endGameLoop(){
    // save scores and display end screen
    final.classList = "visible";
    score.classList = "hidden"
    clearInterval(gameTime);
    clearInterval(gameTrigger);
    ball.classList = "hidden";
    paddle.classList = "hidden";
    if(gameScore > gameHighScore){
        gameHighScore = Math.ceil(gameScore);
        setCookie("highscore", gameHighScore, 365);
    }
}

function returnToBeginning(){
    final.classList = "hidden";
    information.classList = "hidden";
    title.classList = "visible";
    ball.style = "position: absolute; left: calc(50dvw - 50px); top: calc(25dvh - 50px);";
    paddle.style = "position: absolute; left: calc(50dvw - 100px); top: calc(75dvh - 50px);";
    paddle_back.style.rotate = "0deg";
    paddle_front.style.rotate = "0deg";
    ball.classList = "visible";
    paddle.classList = "visible";
}

function openInformation(){
    title.classList = "hidden";
    ball.classList = "hidden";
    paddle.classList = "hidden";
    information.classList = "visible";
}

function updateScore(){
    gameScore = 2*gameBounces + 0.005*gameHorizontal + 0.001*gameVertical;
    score.firstElementChild.innerHTML = Math.ceil(gameScore);
    pause.children[1].innerHTML = Math.ceil(gameScore);
    if(gameScore > gameHighScore){
        final.children[2].innerHTML = Math.ceil(gameScore)+"★";
    }else{
        final.children[1].innerHTML = "Final Score (Highest: "+gameHighScore+")"
        final.children[2].innerHTML = Math.ceil(gameScore);
    }
    final.children[3].innerHTML = "{B:"+2*gameBounces+" H:"+0.005*Math.floor(gameHorizontal)+" V:"+0.001*Math.floor(gameVertical)+"}";
}

function timeLoop(){
    if(gameActive && !gamePaused){
        gameTime++;
        // minute
        let string = Math.floor(gameTime/100/60)%60+":";
        // second
        if(Math.floor(gameTime/100)%60 < 10){
            string = string+"0"+Math.floor(gameTime/100)%60+".";
        }else{
            string = string+Math.floor(gameTime/100)%60+".";
        }
        // milliseconds
        if(gameTime%100 < 10){
            string = string+"0"+(gameTime)%100;
        }else{
            string = string+(gameTime)%100;
        }
        score.lastElementChild.innerHTML = string;
        pause.children[2].innerHTML = string;
        final.children[4].innerHTML = string;
    }
}

function gameLoop(){
    if(!gameActive){
        endGameLoop();
    }
    // console.log("gameLoop");
    physics(mouseX, mouseY);
    updateScore();
}

document.onmousemove = function(event){
    mouseX = event.clientX;
    mouseY = event.clientY;
}
document.ontouchmove = function(event){
    // solution by AndersDaniel
    // https://stackoverflow.com/questions/8050644/how-do-i-get-real-time-position-of-finger-as-it-moves-from-left-to-right
    event.preventDefault();
    event.stopPropagation();
    mouseX = event.clientX;
    mouseY = event.clientY;
}

document.onmouseover = function(){
    if(gameActive && !pauseUsingEscape && pauseOnReturn && gamePaused){
        resumeGameLoop();
    }
}
document.onmouseout = function(){
    if(gameActive && pauseOnLostFocus && !gamePaused){
        pauseGameLoop();
    }
}

document.addEventListener('keydown',
(event) => {
    log(event);
    if(event.key == "Escape"){
        if(gameActive && !gamePaused){
            pauseUsingEscape = true;
            pauseGameLoop();
        }else if(gameActive && gamePaused){
            pauseUsingEscape = false;
            resumeGameLoop();
        }
    }
});

function setPaddle(x, y, rot){
    if(!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)){
        let paddleStyle = "position: absolute; left: "+x+"px; top: "+y+"px;";
        paddle.style = paddleStyle;
        // console.log("set paddle style to \""+paddleStyle+"\"");
    }
    if(!isNaN(rot) && isFinite(rot)){
        paddle_back.style.rotate = rot+"deg";
        paddle_front.style.rotate = rot+"deg";
    }
}

function setBall(x, y){
    if(!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)){
        let ballStyle = "position: absolute; left: "+x+"px; top: "+y+"px;";
        ball.style = ballStyle;
    }
}

function physics(x, y){
    // contrain x and y to have padding round the edge of the window
    x = constrain(50, x, width-50);
    y = constrain(50, y, height-50);

    let paddleX = parseInt(paddle.style.left)+100;
    if(isNaN(paddleX)){ paddleX = width/2; }
    let paddleFX = paddleX;
    let diffX = x-paddleX;
    let paddleRot = parseInt(paddle.style.rotate);
    if(isNaN(paddleRot)){ paddleRot = 0; }
    let rot;
    if(diffX < 2 && diffX > -2){
        paddleFX = x;
        rot = 0;
    }else{
        paddleFX = 0.3*diffX + paddleX;
        if(diffX > 0){
            rot = Math.min(0.5*diffX, 30);
        }else{
            rot = Math.max(0.5*diffX, -30);
        }
    }
    let paddleY = parseInt(paddle.style.top)+50;
    if(isNaN(paddleY)){ paddleY = height*3/4; }
    let paddleFY = paddleY;
    let diffY = y-paddleY;
    if(diffY < 5 && diffY > -5){
        paddleFY = y;
    }else{
        paddleFY = 0.3*diffY + paddleY;
    }

    // calculate ball interactions
    let ballX = parseInt(ball.style.left) + 50;
    if(isNaN(ballX)){ ballX = width/2; }
    let ballY = parseInt(ball.style.top) + 50;
    if(isNaN(ballY)){ ballY = height/4; }
    // calculate next frame ball position
    if(ballVX>0.05){
        ballVX-=0.05;
    }else if(ballVX<0.05){
        ballVX+=0.05;
    }
    ballVY += 0.5;
    if(ballVY < -25){
        ballVY = -25;
    }else if(ballVY > 25) {
        ballVY = 25;
    }
    let ballFX = ballX + ballVX;
    let ballFY = ballY + ballVY;
    if(ballFX<10){
        ballFX = 20-ballFX;
        ballVX = Math.abs(ballVX);
        gameBounces += 1;
    }else if(ballFX>width-10){
        ballFX = 2*width-20-ballFX;
        ballVX = -Math.abs(ballVX);
        gameBounces += 1;
    }
    if(ballY>height+10){
        gameActive = false;
        endGameLoop();
    }
    // see if ball and paddle lines intersect
    if(lineIntersection(paddleX+50*Math.cos(rot/180*Math.PI), paddleY+50*Math.sin(rot/180*Math.PI),
    paddleX-50*Math.cos(rot/180*Math.PI), paddleY-50*Math.sin(rot/180*Math.PI),
    ballX, ballY, ballFX, ballFY) ||
    lineIntersection(paddleFX+50*Math.cos(rot/180*Math.PI), paddleFY+50*Math.sin(rot/180*Math.PI),
    paddleFX-50*Math.cos(rot/180*Math.PI), paddleFY-50*Math.sin(rot/180*Math.PI),
    ballX, ballY, ballFX, ballFY) ||
    pointInQuad(paddleX-50*Math.cos(rot/180*Math.PI), paddleY-50*Math.sin(rot/180*Math.PI),
    paddleX+50*Math.cos(rot/180*Math.PI), paddleY+50*Math.sin(rot/180*Math.PI),
    paddleFX+50*Math.cos(rot/180*Math.PI), paddleFY+50*Math.sin(rot/180*Math.PI),
    paddleFX-50*Math.cos(rot/180*Math.PI), paddleFY-50*Math.sin(rot/180*Math.PI))){
        console.log("hit");
        if(paddleFY-paddleY<=0){
            ballVY = 5*(paddleFY - paddleY) - 0.9*Math.abs(ballVY);
        }
        if(rot==0){
            if(ballX>paddleX){
                ballVX = 2;
            }else{
                ballVX = -2;
            }
        }else{
            ballVX = rot;
        }
        gameBounces += 1;
    }
    // update ball next frame if needed
    if(ballVX!=0 || ballVY!=0){
        setBall(ballFX-50, ballFY-50);
        gameHorizontal += Math.abs(ballVX);
        gameVertical += Math.abs(ballVY);
    }

    //update paddle position
    if(diffX!=0 || diffY!=0 || paddleRot!=0){
        setPaddle(paddleFX-100, paddleFY-50, rot);
    }
}

function constrain(lowerBound, val, upperBound){
    if(val>upperBound){
        return upperBound;
    }else if(val<lowerBound){
        return lowerBound;
    }else{
        return val;
    }
}

//have multiple paddles and balls simulate motion blur

function pointInQuad(x1, y1, x2, y2, x3, y3, x4, y4, x, y){
    // x4,y4 -3- x3,y3
    //   |        |
    //   4        2
    //   |        |
    // x1,y1 -1- x2,y2
    let l1 = lineSide(x1, y1, x2, y2, x, y) > 0;
    let l2 = lineSide(x2, y2, x3, y3, x, y) < 0;
    let l3 = lineSide(x3, y3, x4, y4, x, y) < 0;
    let l4 = lineSide(x4, y4, x1, y1, x, y) > 0;
    return (l1 && l2 && l3 && l4) || (!l1 && l2 && !l3 && l4);
}

function lineSide(x1, y1, x2, y2, x, y){
    // returns positive if above the line, negative if below the line
    // if the line is vertical, right side is positive and left is negative
    // 0 indicates intersection to line
    if(x2-x1!=0){
        return y-(y2-y1)*(x-x1)/(x2-x1)-y1;
    }else{
        return x-x1;
    }
}

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){
    let line1vertical = true;
    let line2vertical = true;
    let m1 = 0;
    let m2 = 0;
    if(x2-x1!=0){
        m1 = (y2-y1)/(x2-x1);
        line1vertical = false;
    }
    if(x4-x3!=0){
        m2 = (y4-y3)/(x4-x3);
        line2vertical = false;
    }
    if(line1vertical && line2vertical){
        // parallel lines
        log("parallel");
        if(inBound(x1, x3, x4) || inBound(x3, x1, x2)){
            // potentially overlapping lines
            return inBound(y3, y1, y2) || inBound(y4, y1, y2) || inBound(y1, y3, y4) || inBound(y2, y3, y4);
        }else{
            // just parallel, but not overlapping
            return false;
        }
    }else if(line1vertical){
        log("line 1 vertical");
        // line 1 is vertical
        if(inBound(x1, x3, x4)){
            // x value is in bound, next check if y values are intersecting
            return inBound(y3, y1, y2) || inBound(y4, y1, y2) || inBound(y1, y3, y4) || inBound(y2, y3, y4);
        }else{
            // x value is out of range
            return false;
        }
    }else if(line2vertical){
        log("line 2 vertical");
        // line 2 is vertical
        if(inBound(x3, x1, x2)){
            // x value is in bound, next check if y values are intersecting
            return inBound(y3, y1, y2) || inBound(y4, y1, y2) || inBound(y1, y3, y4) || inBound(y2, y3, y4);
        }else{
            // x value is out of range
            return false;
        }
    }else{
        log("angled");
        // angled lines
        // find intersection
        let x = (m1*x1-m2*x3+y3-y1)/(m1-m2);
        // if the intersection x value is in bound, check if it lies on both lines
        return inBound(x, x1, x2) && inBound(x, x3, x4);
    }
}

function inBound(val, bound1, bound2){
    // if val is within or on bound 1 and 2, return true
    return (bound1-val)*(bound2-val) <= 0;
}

function log(val){
    console.log(val);
}

// following cookie functions are from w3schools.com
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}