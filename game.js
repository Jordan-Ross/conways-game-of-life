var GRID_PIXEL_SIZE = 30;
var ALIVE_COLOR = "#0000FF";
var DEAD_COLOR = "#FFFFFF";
//	Time in ms between each tick 
var TICK_DELAY = 120;

var canvas;
var context;

var currentGen = [];
var successorGen = [];
var rowCount, colCount;

window.onload = function() {

canvas = document.getElementById("game");
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

context = canvas.getContext("2d");

drawGrid();
initArrays();

play();

//colorCell(5, 5);
//removeCell(5, 5);

}


function drawGrid() {
	rowCount = 0;
	colCount = 0;
	for (var row = 0; row < canvas.height; row += GRID_PIXEL_SIZE, rowCount++) {
		context.moveTo(0, row);
		context.lineTo(canvas.width, row);
	}	

	for (var col = 0; col < canvas.width; col += GRID_PIXEL_SIZE, colCount++) {
		context.moveTo(col, 0);
		context.lineTo(col, canvas.height);
	}
	context.strokeStyle = "black";
	context.stroke();

	console.log(rowCount);
	console.log(colCount);	
}

function initArrays() {
	for (var row = 0; row < rowCount; row++) {
		var colArray = [];
		for (var col = 0; col < colCount; col++) {
			// Random number between 0 and 1
			// TODO: allow for custom seed
			var rand = Math.floor(Math.random() * 6) == 0 ? 1 : 0;
			colArray.push(rand);
			if (rand) colorCell(row, col);
		}
		currentGen.push(colArray);
		// Only need this so the rows are defined and we can set columns later.
		successorGen.push([]);
	}
}

function play() {
	setInterval(nextTick, TICK_DELAY);	
}

//	Check each near cell for living status
//	TODO: What to do about wrap around?
var cellEvaluators = [
	function(r, c) {
		if (r == 0) return false;
		return currentGen[r-1][c] == 1;
	},
	function(r, c) {
		if (c == 0) return false;
		return currentGen[r][c-1] == 1;
	},
	function(r, c) {
		if (r >= currentGen.length - 1) return false;
		return currentGen[r + 1][c] == 1;
	},
	function(r, c) {
		if (c >= currentGen[r].length - 1) return false;
		return currentGen[r][c + 1] == 1;
	},
	function(r, c) {
		if (r >= currentGen.length - 1 || c >= currentGen[r].length - 1) return false;
		return currentGen[r + 1][c + 1] == 1;
	},
	function(r, c) {
		if (r == 0 || c == 0) return false;
		return currentGen[r - 1][c - 1] == 1;
	},
	function(r, c) {
		if (r >= currentGen.length - 1|| c == 0) return false;
		return currentGen[r + 1][c - 1] == 1;
	},
	function(r, c) {
		if (r == 0 || c >= currentGen[r].length - 1) return false;
		return currentGen[r - 1][c + 1] == 1;
	}
]

function nextTick() {
	var livingNeighbours;
	// TODO: Optimize
	for (var row = 0; row < rowCount; row++) {
		for (var col = 0; col < colCount; col++) {
			livingNeighbours = 0;
			var currentCellLiving = currentGen[row][col];
			for (var funcIndex = 0; funcIndex < cellEvaluators.length; funcIndex++) {
				if (cellEvaluators[funcIndex](row, col)) {
					livingNeighbours++;
				}
			}
			if (currentCellLiving) {
				//	Any live cell with fewer than two live neighbours dies
				if (livingNeighbours < 2) killCell(row, col);
				//	Any live cell with more than three live neighbours dies
				else if (livingNeighbours > 3) killCell(row, col);
				//	Any live cell with two or three live neighbours lives, 
				//		unchanged, to the next generation.
				else createCell(row, col);
			} else if (livingNeighbours == 3) {
				//	Any dead cell with exactly three live neighbours will come to life.
				createCell(row, col);
			} else {
				killCell(row, col);
			}
		}
	}
	// Copy successor array to current gen array
	for (var row = 0; row < rowCount; row++) {
		for (var col = 0; col < colCount; col++) {
			currentGen[row][col] = successorGen[row][col];
		}
	}
}

function createCell(row, col) {
	successorGen[row][col] = 1;
	colorCell(row,col);
}

function killCell(row, col) {
	successorGen[row][col] = 0;
	removeCell(row,col);
}

function colorCell(row, col) {
	context.fillStyle = ALIVE_COLOR;
	var startRow = row * GRID_PIXEL_SIZE + 1; 
	var startCol = col * GRID_PIXEL_SIZE + 1;
	context.fillRect(startCol, startRow, GRID_PIXEL_SIZE - 2, GRID_PIXEL_SIZE - 2);
}

function removeCell(row, col) {
	context.fillStyle = DEAD_COLOR;
	var startRow = row * GRID_PIXEL_SIZE + 1; 
	var startCol = col * GRID_PIXEL_SIZE + 1;
	context.fillRect(startCol, startRow, GRID_PIXEL_SIZE - 2, GRID_PIXEL_SIZE - 2);
}
