let numPolygons = 8          // 8  // 12
let numCorner = 6                                   // good sounds
let pitchModifier1 = 0.2     // 0.4 // 0.2
let pitchModifier2 = 1.0    // 1.5 // 1.4 // 1.0
let cycleTime = 30
let rythm = false   
let paused = false 
let firstPlayed = false
let step = 0 
let iconPause  
let iconPlay
let myDeltaTime = 0

let noteDestination = "assets/gong.wav"



let dropdown;
let numPolygonsSlider;
let numCornerSlider;
let pitchModifier1Slider;
let pitchModifier2Slider;
let cycleTimeSlider;
let rythmToggle;


let existingDots = [];
 
function toggleRythm() {
  rythm = !rythm;
}


function changeNoteDestination() {
  let selectedOption = dropdown.value();
  noteDestination = selectedOption;
  dropdown.style("background-color", color(0));
  dropdown.style("color", color(255));
}

function preload() {
  iconPause = loadImage("assets/pause.png");
  iconPlay = loadImage("assets/play.png");

  dropdown = createSelect();
  dropdown.option("assets/gong.wav");
  dropdown.option("assets/CLN_CB.wav");
  dropdown.option("assets/34FPiano.wav");
  dropdown.option("assets/DiscoverMarimba.wav");
  dropdown.option("assets/StopMarimba.wav");
  // Add more options as needed
  dropdown.changed(changeNoteDestination);
  dropdown.style("background-color", color(0));
  dropdown.style("color", color(255));

  

}

function setup() {  
  let canvas = createCanvas(1400, 800);
  canvas.parent("canvas-container")
  

  rythmToggle = createCheckbox('Rythm', rythm);
  rythmToggle.changed(updateParameters);


  numPolygonsSlider = createSlider(3, 20, 8); // Adjust the range and default value accordingly
  numCornerSlider = createSlider(3, 10, 6); // Adjust the range and default value accordingly
  pitchModifier1Slider = createSlider(0.1, 1.0, 0.2, 0.01); // Adjust the range and default value accordingly
  pitchModifier2Slider = createSlider(0.5, 2.0, 1.0, 0.01); // Adjust the range and default value accordingly
  cycleTimeSlider = createSlider(10, 60, 30); // Adjust the range and default value accordingly

  // Create rythm toggle
  

  // Add input event listeners for slider changes
  numPolygonsSlider.input(updateParameters);
  numCornerSlider.input(updateParameters);
  pitchModifier1Slider.input(updateParameters);
  pitchModifier2Slider.input(updateParameters);
  cycleTimeSlider.input(updateParameters);


  updateParameters();


  for (let index = 0; index < numPolygons; index++) {
    createPolygon(index, numPolygons);
  }

  iconPause.loadPixels();
  iconPlay.loadPixels();

  // start paused
  pauseToggle();
}


function updateParameters() {

  
  // Update values from sliders and toggle
  numPolygons = numPolygonsSlider.value();
  numCorner = numCornerSlider.value();
  pitchModifier1 = pitchModifier1Slider.value();
  pitchModifier2 = pitchModifier2Slider.value();
  cycleTime = cycleTimeSlider.value();
  rythm = rythmToggle.checked();

  existingDots = Polygon.all.map(polygon => ({
    position: polygon.dotActualVertex.copy(),
    color: polygon.color
  }));

  // Clear existing polygons
  Polygon.all = [];
  VertexImpactAnimation.allAnimations = [];

  // Create new polygons with updated parameters
  for (let index = 0; index < numPolygons; index++) {
    createPolygon(index, numPolygons);
  }

  redraw();
}



function createPolygon(index, numPolygons) {
  let x = width / 2; 
  let y = height / 2;
  let radius = (index  + 1) * 30;
  if (rythm) {
    var numSides = numCorner 
  } else {
    var numSides = index + numCorner
  };
   
  push(); 
  colorMode(HSB, numPolygons);
  let _color = color(index, numPolygons / 1.2, 100)
  pop();

  let soundRate = map(index, 0, numPolygons, pitchModifier1, pitchModifier2); 
  let sound = new Dong(soundRate);

  
  let dotTime =  ((index + 1) / numPolygons) * cycleTime;

  new Polygon(x, y, radius, numSides, _color, sound, dotTime);
}

function draw() {
  if (paused == true) {
    step = step
  } else {
    step += deltaTime;
  }
  
  background(0);

  Polygon.drawAll(step);
  VertexImpactAnimation.draAll();

  drawPlayButton();

}

function drawPlayButton() {
  let speaker = speakerImage();
  tint(255, 255, 255, 100);
  image(speaker, width - 706, height - 407, speaker.width / 3, speaker.height / 3);
  dropdown.position(width - 575, height - 0);
}

function pauseToggle() {
  paused = !paused;
  if(paused) {
    noLoop();
  } else {
    loop();
    deltaTime = 0;
  }
}

function keyPressed() {
  if (keyCode === 32) {
    pauseToggle();
  }
}

function mouseClicked() {
  let buttonX = width - 705;
  let buttonY = height - 405;
  let buttonSize = 20;

  if (mouseX > buttonX && mouseX < buttonX + buttonSize && mouseY > buttonY && mouseY < buttonY + buttonSize) {
    pauseToggle();
  }
}



function speakerImage() {
  if(paused)
    return iconPlay;
  else
    return iconPause;
}


class Dong {
  constructor(pitch) {
    this.pitch = pitch;
  }

  play() {
    let s = new Audio(noteDestination);
    s.mozPreservesPitch = false;
    s.preservesPitch = false;
    s.volume = 0.2;    // Reduced volume to avoid clipping
    s.playbackRate = this.pitch
    s.play();
  }

}

class Polygon {
  static all = [];
  static dotRadius = 8;

  constructor(x, y, radius, num_sides, color, sound, dotTime) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.num_sides = num_sides;
    this.color = color;
    this.sound = sound;
    this.dotTime = dotTime;
    this.dotActualVertex = this.getStoredDotPosition();
    

    this.vertexes = this.calculateVertexes();
    this.sideLength = this.calculateSideLength();
    this.perimeterLength = this.sideLength * this.num_sides;

    this.dotActualVertex = this.vertexes[0];
    this.dotSpeed = this.perimeterLength / this.dotTime;

    Polygon.all.push(this);

    // console.log("perimeterLength: " + this.perimeterLength);
    // console.log("dotSpeed: " + this.dotSpeed);
    // console.log("sideLength", this.sideLength);
  }

  getStoredDotPosition() {
    // Retrieve the stored dot position or use the center if not available
    const storedDot = existingDots.shift();
    return storedDot ? storedDot.position : createVector(width / 2, height / 2);
  }

  static drawAll(step) {
    Polygon.all.forEach(polygon => {
      polygon.draw(step);
    });
  }

  calculateVertexes(){
    push();
    angleMode(RADIANS);
    let vertexes = [];
    let angle = (TWO_PI / this.num_sides);
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = this.x + (cos(a) * this.radius);
      let sy = this.y + (sin(a) * this.radius);
      vertexes.push(createVector(sx, sy, 0))
    }
    pop();

    return vertexes;
  }

  // From here: https://www.mathopenref.com/polygonsides.html
  calculateSideLength() {
    push();
    angleMode(DEGREES);
    let sideLength = this.radius * 2 * sin(180 / this.num_sides);;
    pop();

    return sideLength;
  }

  drawDotAt(step) {
    // Messy stuff to calculate the position of the Dot
    // Basically is figuring out in which side of the Polygon the dot should be
    // and lerping among the both vertexes
    step = (step / 1000) * this.dotSpeed;
    let truncatedStep = step % this.perimeterLength;
    let actualSideIndex = floor(truncatedStep / this.sideLength);
    let stepOnSide = step % this.sideLength;
    let normalizedStepOnSide = map(stepOnSide, 0, this.sideLength, 0, 1);
    let vertexA = this.vertexes[actualSideIndex];
    let vertexB = this.vertexes[(actualSideIndex + 1) % this.vertexes.length];
    let dotPosition = p5.Vector.lerp(vertexA, vertexB, normalizedStepOnSide);

    // Draw the Dot
    push();
    fill(this.color);
    noStroke();
    circle(dotPosition.x, dotPosition.y, Polygon.dotRadius);
    pop();

    // When origin Vertex changed we trigger a VertexImpactAnimation
    if(vertexA != this.dotActualVertex){
      this.vertexImpact(dotPosition.x, dotPosition.y);
      this.dotActualVertex = vertexA;
    }
  }

  drawPolygon() {
    push();
    noFill();
    stroke(this.color);
    beginShape();
    this.vertexes.forEach(actual_vertex => {
      vertex(actual_vertex.x, actual_vertex.y);
    });
    endShape(CLOSE);
    pop();
  }

  draw(step) {
    this.drawPolygon();
    this.drawDotAt(step)
  }

  vertexImpact(x, y){
    if (paused == true) {
      return
    } else {
      this.sound.play();

      new VertexImpactAnimation(x, y, color(this.color.toString())); // duplicate the color
    }
    
  }
}

class VertexImpactAnimation {
  static numSteps = 10;
  static maxSize = 20;
  static allAnimations = [];
  static speed = 0.3;

  static draAll() {
    VertexImpactAnimation.allAnimations.forEach(VertexImpactAnimation => {
      VertexImpactAnimation.draw();
    });
  }

  constructor(x, y, color){
    this.x = x;
    this.y = y;
    this.color = color;

    this.step = 0;

    VertexImpactAnimation.allAnimations.push(this);
  }

  draw() {
    push();
    let alpha = map(this.step, 0, VertexImpactAnimation.numSteps, 255, 100);
    this.color.setAlpha(alpha);
    fill(this.color);
    noStroke();
    let radius = map(this.step, 0, VertexImpactAnimation.numSteps, VertexImpactAnimation.maxSize, 0);
    circle(this.x, this. y, radius);
    this.step += VertexImpactAnimation.speed;

    // Remove the Animation if finished
    if(this.isFinished() ) {
      VertexImpactAnimation.allAnimations = VertexImpactAnimation.allAnimations.filter(e => e !== this);
    }

    // console.log("draw(), step: " + this.step + ", radius: " + radius + ", alpha: " + alpha + ", this.color: " + this.color);
    pop();
  }

  isFinished() {
    return this.step >= VertexImpactAnimation.numSteps
  }
}
