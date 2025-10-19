
//Inizializ var
let table;
let outerPadding, padding, itemSize;
let cols, rows;
let card;

function preload() {
  table = loadTable("assets/dataset.csv", "csv", "header");
}




//SETUP
function setup() {
  card = document.querySelector('.canvas-card');

  // --- dim quadro ---
  outerPadding = card.clientWidth * 0.05;
  padding = card.clientWidth * 0.025;
  itemSize = card.clientWidth * 0.10;

  // --- calcoli x grid ---
  cols = floor((card.clientWidth - outerPadding * 2) / (itemSize + padding));
  if (cols < 1) cols = 1;
  rows = ceil(table.getRowCount() / cols);

  // --- calcoli x h canv ---
  let totalHeight = outerPadding * 2 + rows * itemSize + (rows - 1) * padding;

  // --- canvas in una card ---
  let canvas = createCanvas(card.clientWidth, totalHeight);
  canvas.parent('canvas-container');
  background("black");
  noStroke();



  // --- ciclo main ---
  let colCount = 0;
  let rowCount = 0;

  for (let rowNumber = 0; rowNumber < table.getRowCount(); rowNumber++) {
    let data = table.getRow(rowNumber).obj;

    let myValue = Number(data["column0"]);       // dim hex
    let valueLine1 = Number(data["column1"]);    // l linea 1
    let valueAngle1 = Number(data["column2"]);   // α° linea 1
    let valueLine2 = Number(data["column3"]);    // l linea figlia
    let valueMirror = Number(data["column4"]);   // specularità x vs y

    let scaledValue = map(myValue, 0, 100, 1, itemSize);

    let xPos = outerPadding + colCount * (itemSize + padding);
    let yPos = outerPadding + rowCount * (itemSize + padding);
    let centerX = xPos + itemSize / 2;
    let centerY = yPos + itemSize / 2;

    drawHexagonDots(centerX, centerY, scaledValue / 2, valueLine1, valueAngle1, valueLine2, valueMirror);

    colCount++;
    if (colCount == cols) {
      colCount = 0;
      rowCount++;
    }
  }
}

function draw() {

}

// --- hex e costellazioni con glow ---
function drawHexagonDots(x, y, r, valueLine1, valueAngle1, valueLine2, valueMirror) {
  push();

  let dotColor = color(255);
  let glowColor = color(255);

  fill(dotColor);
  stroke(dotColor);
  strokeWeight(2);


  // --- calcolo vert hex ---
  let vertices = [];
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i - PI / 6;
    let vx = x + cos(angle) * r;
    let vy = y + sin(angle) * r;
    vertices.push(createVector(vx, vy));
  }

  let steps = floor(map(r, 1, 50, 1, 5));
  steps = constrain(steps, 1, 8);

  if (steps <= 1) {
    ellipse(x, y, 4);
    pop();
    return;
  }



  // diagonali 
  for (let i = 0; i < 3; i++) {
    let v1 = vertices[i];
    let v2 = vertices[i + 3];
    for (let t = 0; t <= 1; t += 1 / steps) {
      let px = lerp(v1.x, v2.x, t);
      let py = lerp(v1.y, v2.y, t);
      fill(dotColor);
      noStroke();
      ellipse(px, py, 1);
    }
  }

  stroke(dotColor);
  fill(dotColor);



  // --- LINEA MADRE ---
  let stepLength1;

if (valueLine1 < -10) {
  stepLength1 = r / 2;
} else if (valueLine1 <= 10) {
  stepLength1 = r * 2 / 3;
} else {
  stepLength1 = r;
}

  // --- α° Libea ---
  let vertexIndexMother;
  if (valueAngle1 < -10) vertexIndexMother = 0;
  else if (valueAngle1 < 0) vertexIndexMother = 1;
  else if (valueAngle1 <= 10) vertexIndexMother = 2;
  else if (valueAngle1 <= 40) vertexIndexMother = 3;
  else vertexIndexMother = 4;

  let targetVertex = vertices[vertexIndexMother];
  let dx = (targetVertex.x - x) * (stepLength1 / r);
  let dy = (targetVertex.y - y) * (stepLength1 / r);

  glowLine(x, y, x + dx, y + dy, glowColor);



  // --- LINEA FIGLIA ---
  let startX = x + dx;
  let startY = y + dy;

  let vertexIndexChild;
  if (valueLine1 < 0) vertexIndexChild = (vertexIndexMother + 5) % 6;
  else vertexIndexChild = (vertexIndexMother + 1) % 6;
  let targetVertex2 = vertices[vertexIndexChild];
  let stepLength2;
  if (valueLine2 < -10) {
    stepLength2 = r / 2;
  } else if (valueLine2 <= 10) {
    stepLength2 = r * 2 / 3;
  } else {
    stepLength2 = r;
  }
  let dx2 = (targetVertex2.x - startX) * (stepLength2 / r);
  let dy2 = (targetVertex2.y - startY) * (stepLength2 / r);

  glowLine(startX, startY, startX + dx2, startY + dy2, glowColor);

  // --- SPECULARITÀ ---
  if (valueMirror !== 0) {
    let mirrorDX1 = dx;
    let mirrorDY1 = dy;
    let mirrorDX2 = dx2;
    let mirrorDY2 = dy2;

    if (valueMirror > 0) { // specchio X
      mirrorDX1 = -dx;
      mirrorDX2 = -dx2;
    } else { // specchio Y
      mirrorDY1 = -dy;
      mirrorDY2 = -dy2;
    }

    glowLine(x, y, x + mirrorDX1, y + mirrorDY1, glowColor);
    glowLine(
      x + mirrorDX1,
      y + mirrorDY1,
      x + mirrorDX1 + mirrorDX2,
      y + mirrorDY1 + mirrorDY2,
      glowColor
    );
  }

  // ---  glow ---
function glowLine(x1, y1, x2, y2, glowColor, glowLayers = 6) {
  push();
  for (let g = glowLayers; g >= 1; g--) {
    stroke(red(glowColor), green(glowColor), blue(glowColor), 255 / (g * 1.5));
    strokeWeight(g * 2);
    line(x1, y1, x2, y2);
  }
  stroke(glowColor);
  strokeWeight(1.5);
  line(x1, y1, x2, y2);
  pop();
}

  pop();
}

