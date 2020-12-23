import "../css/styles.css";

let scores = [];

let player;
let start;
let gameOver;
let game;
let score;

let rightPressed = false;
let leftPressed = false;

let brickSound = document.getElementById("brick");
let hitSound = document.getElementById("hit");
let gameOverSound = document.getElementById("game-over");

document.querySelector("#initial-page button").addEventListener("click", () => {
    start = false;
    gameOver = false;
    game = false;
    score = 0;
    player = {};
    if (localStorage.getItem("scores") != null) {
        scores = JSON.parse(localStorage.getItem("scores"));
    }
    startGame();
    player.name = document.querySelector(".input-text").value;
});

document.querySelector(".back-to-main").addEventListener("click", () => {
    document.querySelector("#final-page").classList.toggle("hidden");
    document.querySelector("#initial-page").classList.toggle("hidden");
    document.querySelector("#final-page").classList.toggle("final-page");
});

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    }
    if (e.keyCode == 32) {
        if (!game && !gameOver) {
            start = true;
            game = setInterval(render, 16);
        }
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let canvas = document.querySelector("#game canvas");
let context = canvas.getContext("2d");

let ballRadius = 7;
let ballX = 0;
let ballY = 0;
let speedX = 5;
let speedY = 5;

let paddleHeight = 15;
let paddleWidth = 0;
let paddleX = 0;
let paddleSpeed = 7;

let bricks = [];
let brickRows = 4;
let brickColumns = 5;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickWidth = 0;

let canvasDimensions;

window.addEventListener("resize", onResizeCanvas, false);

function onResizeCanvas() {
    //calculate new positions on resize canvas
    const newCanvasDimensions = getCanvasDimensions();
    calculateSizes(canvasDimensions, newCanvasDimensions);
    recalculatePositions(canvasDimensions, newCanvasDimensions);
    canvasDimensions = newCanvasDimensions;
}

function getCanvasDimensions() {
    //get the dimensions of the canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return {
        width: canvas.width,
        height: canvas.height,
    };
}

function startGame() {
    //starts the game and load the first state
    document.querySelector("#initial-page").classList.toggle("hidden");
    document.querySelector("#game").classList.toggle("hidden");
    canvasDimensions = getCanvasDimensions();
    calculateSizes(canvasDimensions, canvasDimensions);
    prepareScene(canvasDimensions);
    render();
}

function calculateSizes(previousCanvas, currentCanvas) {
    //calculate sizes of the paddle width and the bricks
    paddleWidth = currentCanvas.width / 5;
    brickWidth =
        (currentCanvas.width - brickPadding) / brickColumns - brickPadding;
}

function prepareScene(canvasdimensions) {
    //preapre the first scene for initiate the game
    ballX = canvasdimensions.width / 2;
    ballY = canvasdimensions.height - 40 - paddleHeight - ballRadius * 2;

    paddleX = (canvasdimensions.width - paddleWidth) / 2;

    brickWidth =
        (canvasdimensions.width - brickPadding) / brickColumns - brickPadding;

    for (let c = 0; c < brickColumns; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRows; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function recalculatePositions(previousCanvas, currentCanvas) {
    // calculate positions for the elements when resize
    let widthRatio = currentCanvas.width / previousCanvas.width;
    let heightRatio = currentCanvas.height / previousCanvas.height;
    ballX = ballX * widthRatio;
    ballY = ballY * heightRatio;
    paddleX = paddleX * widthRatio;
    render();
}

function render() {
    //main loop for game
    if (!gameOver) {
        if (start) {
            context.fillStyle = "rgba(0,0,0,0.3)";
            context.fillRect(
                0,
                0,
                canvasDimensions.width,
                canvasDimensions.height
            );
            detectCollisions();
        }
        document.querySelector("#score").innerHTML = `score: ${score}`;
        drawBall();
        drawPaddle();
        drawWall();
    } else {
        clearInterval(game);
        gameOver = false;
        document.querySelector("#game").classList.toggle("hidden");
        player.score = score;
        scores.push(player);
        document.querySelector("#final-page").classList.toggle("hidden");
        document.querySelector("#final-page").classList.toggle("final-page");
        fillListScores();
        localStorage.setItem("scores", JSON.stringify(scores));
    }
    if (ballY + speedY > canvasDimensions.height - ballRadius) {
        speedY = -speedY;
        gameOverSound.play();
        gameOver = true;
    }
}

function fillListScores() {
    //fill the scores
    let scoreBoard = document.querySelector(".score-board");
    scoreBoard.innerHTML = "";
    for (score of scores) {
        let personalScore = createScore(score);
        scoreBoard.appendChild(personalScore);
    }
}

function createScore(obj) {
    //create each element on the list scores
    let container = document.createElement("div");
    let name = document.createElement("div");
    let points = document.createElement("div");

    name.innerHTML = obj.name;
    name.classList.toggle("name-score");
    points.innerHTML = obj.score;
    points.classList.toggle("points-score");

    container.classList.toggle("personal-score");
    container.appendChild(name);
    container.appendChild(points);
    return container;
}

function drawPaddle() {
    context.beginPath();
    context.rect(
        paddleX,
        canvasDimensions.height - (paddleHeight + 40),
        paddleWidth,
        paddleHeight
    );
    context.fillStyle = "red";
    context.fill();
    context.closePath();
}

function detectCollisions() {
    //hit ball -> paddle
    if (
        ballY + ballRadius >= canvasDimensions.height - (40 + paddleHeight) &&
        ballY - ballRadius <= canvasDimensions.height - 40
    ) {
        if (speedX < 0) {
            if (ballX - ballRadius > paddleX + paddleWidth) {
                if (ballX - ballRadius + speedX <= paddleX + paddleWidth) {
                    //right collision
                    hitSound.pause();
                    hitSound.currentTime = 0;
                    hitSound.play();
                    ballX = paddleX + paddleWidth + ballRadius + 1;
                    speedX = -speedX;
                }
            }
        } else {
            if (ballX + ballRadius < paddleX) {
                if (ballX + ballRadius + speedX >= paddleX) {
                    //left collision
                    hitSound.pause();
                    hitSound.currentTime = 0;
                    hitSound.play();
                    ballX = paddleX - ballRadius - 1;
                    speedX = -speedX;
                }
            }
        }
    } else if (
        ballX + ballRadius + speedX >= paddleX &&
        ballX - ballRadius + speedX <= paddleX + paddleWidth
    ) {
        if (speedY > 0) {
            if (
                ballY + ballRadius <
                canvasDimensions.height - (40 + paddleHeight)
            ) {
                if (
                    ballY + ballRadius + speedY >=
                    canvasDimensions.height - (40 + paddleHeight)
                ) {
                    //top collision
                    hitSound.pause();
                    hitSound.currentTime = 0;
                    hitSound.play();
                    ballY =
                        canvasDimensions.height -
                        (40 + paddleHeight) -
                        ballRadius -
                        1;
                    speedY = -speedY;
                }
            }
        } else {
            if (ballY - ballRadius > canvasDimensions.height - 40) {
                if (
                    ballY - ballRadius + speedY <=
                    canvasDimensions.height - 40
                ) {
                    //bottom collision
                    hitSound.pause();
                    hitSound.currentTime = 0;
                    hitSound.play();
                    ballY = canvasDimensions.height - 40 + ballRadius + 1;
                    speedY = -speedY;
                }
            }
        }
    }

    ballY += speedY;
    ballX += speedX;

    //hits paddle -> ball
    if (
        leftPressed &&
        paddleX + paddleWidth > ballX &&
        ballX + ballRadius > paddleX - paddleSpeed &&
        ballY + ballRadius > canvasDimensions.height - (paddleHeight + 40) &&
        ballY - ballRadius < canvasDimensions.height - 40
    ) {
        if (ballX - ballRadius - paddleSpeed - 1 < ballRadius) {
            hitSound.pause();
            hitSound.currentTime = 0;
            hitSound.play();
            ballX = ballRadius;
            paddleX = ballRadius * 2 + 1;
        } else {
            hitSound.pause();
            hitSound.currentTime = 0;
            hitSound.play();
            paddleX -= paddleSpeed;
            ballX = paddleX - ballRadius - 1;
        }
    } else {
        if (
            rightPressed &&
            paddleX < ballX &&
            ballX - ballRadius < paddleX + paddleWidth + paddleSpeed &&
            ballY + ballRadius >
                canvasDimensions.height - (paddleHeight + 40) &&
            ballY - ballRadius < canvasDimensions.height - 40
        ) {
            if (ballX + ballRadius + paddleSpeed + 1 > canvasDimensions.width) {
                hitSound.pause();
                hitSound.currentTime = 0;
                hitSound.play();
                ballX = canvasDimensions.width - ballRadius;
                paddleX =
                    canvasDimensions.width - paddleWidth - ballRadius * 2 - 1;
            } else {
                hitSound.pause();
                hitSound.currentTime = 0;
                hitSound.play();
                paddleX += paddleSpeed;
                ballX = paddleX + ballRadius + paddleWidth + 1;
            }
        } else {
            if (
                rightPressed &&
                !(paddleX > canvasDimensions.width - paddleWidth)
            ) {
                paddleX += paddleSpeed;
            } else if (leftPressed && !(paddleX < 1)) {
                paddleX -= paddleSpeed;
            }
        }
    }

    //hit ball -> limit
    if (
        ballX + speedX > canvasDimensions.width - ballRadius ||
        ballX + speedX < ballRadius
    ) {
        hitSound.pause();
        hitSound.currentTime = 0;
        hitSound.play();
        speedX = -speedX;
    }

    if (ballY + speedY < ballRadius) {
        hitSound.pause();
        hitSound.currentTime = 0;
        hitSound.play();
        speedY = -speedY;
    }

    //hit ball -> bricks
    for (let c = 0; c < brickColumns; c++) {
        for (let r = 0; r < brickRows; r++) {
            if (!bricks[c][r]) {
                continue;
            }
            let brick = bricks[c][r];
            if (brick.status > 0) {
                if (
                    ballY + ballRadius >= brick.y &&
                    ballY - ballRadius <= brick.y + brickHeight
                ) {
                    if (speedX < 0) {
                        if (ballX - ballRadius > brick.x + brickWidth) {
                            if (
                                ballX - ballRadius + speedX <=
                                brick.x + brickWidth
                            ) {
                                brickSound.pause();
                                brickSound.currentTime = 0;
                                brickSound.play();
                                brick.status = 0;
                                score += 1;
                                document.querySelector(
                                    "#score"
                                ).innerHTML = `score: ${score}`;
                                ballX = brick.x + brickWidth + ballRadius + 1;
                                speedX = -speedX;
                            }
                        }
                    } else {
                        if (ballX + ballRadius < brick.x) {
                            if (ballX + ballRadius + speedX >= brick.x) {
                                brickSound.pause();
                                brickSound.currentTime = 0;
                                brickSound.play();
                                brick.status = 0;
                                score += 1;
                                document.querySelector(
                                    "#score"
                                ).innerHTML = `score: ${score}`;
                                ballX = brick.x - ballRadius - 1;
                                speedX = -speedX;
                            }
                        }
                    }
                } else if (
                    ballX + ballRadius + speedX >= brick.x &&
                    ballX - ballRadius + speedX <= brick.x + brickWidth
                ) {
                    if (speedY > 0) {
                        if (ballY + ballRadius < brick.y) {
                            if (ballY + ballRadius + speedY >= brick.y) {
                                brickSound.pause();
                                brickSound.currentTime = 0;
                                brickSound.play();
                                brick.status = 0;
                                score += 1;
                                document.querySelector(
                                    "#score"
                                ).innerHTML = `score: ${score}`;
                                ballY = brick.y - ballRadius - 1;
                                speedY = -speedY;
                            }
                        }
                    } else {
                        if (ballY - ballRadius > brick.y + brickHeight) {
                            if (
                                ballY - ballRadius + speedY <=
                                brick.y + brickHeight
                            ) {
                                brickSound.pause();
                                brickSound.currentTime = 0;
                                brickSound.play();
                                brick.status = 0;
                                score += 1;
                                document.querySelector(
                                    "#score"
                                ).innerHTML = `score: ${score}`;
                                ballY = brick.y + brickHeight + ballRadius + 1;
                                speedY = -speedY;
                            }
                        }
                    }
                }
            }
        }
    }
}

function drawBall() {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#0095DD";
    context.fill();
    context.closePath();
}

function consoleCollision() {
    //checke for test things
    console.log(`
    canvas height: ${canvasDimensions.height}
    ball radius: ${ballRadius}
    speed X ${speedX}
    speed Y ${speedY}
    ball X ${ballX}
    ball y ${ballY}
    paddle x ${paddleX}
    paddle wdith ${paddleWidth}
    paddle height ${paddleHeight}
    paddle speed ${paddleSpeed}`);
}

function drawWall() {
    //draw the wall precalculated
    for (let c = 0; c < brickColumns; c++) {
        for (let r = 0; r < brickRows; r++) {
            if (!bricks[c][r]) {
                continue;
            }
            if (bricks[c][r].status == 1) {
                let brickX = c * (brickWidth + brickPadding) + brickPadding;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = "#0095DD";
                context.fill();
                context.closePath();
            }
        }
    }
}
