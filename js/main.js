'use strict'
console.log('mine sweeper game! ');

var gBoard = [];
var gLevel = { size: 4, mines: 2 }
var gState = null
var MINE = '💣'
var EMPTY_CELL = '&nbsp;'
var gTimeInterval = null;

function initGame() {
    //get last played level
    var level = +localStorage.mineSweeperLevel
    if (level) setLevel(level);
    gBoard = createBoard()
    gState = { isGameOn: true, shownCount: 0, markedCount: 0, time: 0 }
    addMines(gBoard);
    countNegs(gBoard);
    gTimeInterval = setInterval(addSecs, 1000);
    renderBoard(gBoard)
}

function createBoard() {
    var mat = []
    var matLength = gLevel.size;
    for (var i = 0; i < matLength; i++) {
        mat.push([]);
        var row = mat[i]
        for (var j = 0; j < matLength; j++) {
            row.push({ negsCount: 0, isClicked: false });
        }
    }
    return mat
}

// CR: while loop os better solution for this problem.
// you will allways get a random number of bombs becuase you dont have a solution for the case that the new mine place is already have a bomb inside it.
function addMines(mat) {
    var rndIdxs = []
    for (var i = 0; i < mat.length; i++) {
        rndIdxs.push(i);
    }
    for (var i = 0; i < gLevel.mines; i++) {
        var rndI = Math.floor(Math.random() * rndIdxs.length)
        var rndJ = Math.floor(Math.random() * rndIdxs.length)
        mat[rndI][rndJ] = MINE
    }
    var mineCounter = 0;
    // CR: not realy needed. can count on the first loop.
    for (var i = 0; i < mat.length; i++) {
        for (var j = 0; j < mat.length; j++) {
            var cell = mat[i][j];
            if (cell === MINE) mineCounter++
        }
    }
    gState.minesCount = mineCounter;
}

function countNegs(mat) {
    for (var i = 0; i < mat.length; i++) {
        var row = mat[i];
        for (var j = 0; j < mat.length; j++) {
            var cell = row[j];
            if (cell === MINE || cell === EMPTY_CELL) continue;
            cell.negsCount = countCellNegs(mat, i, j);
        }
    }
}

function countCellNegs(board, cellI, cellJ) {
    var count = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j] === MINE) count++;
        }
    }
    return count;
}

function renderBoard(mat) {
    var elBoard = document.querySelector('.board');
    var strHTML = ''
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat.length; j++) {
            var cellContent = null;
            (mat[i][j] === MINE) ? cellContent = MINE : cellContent = mat[i][j].negsCount
            if (cellContent === 0) cellContent = EMPTY_CELL
            strHTML +=
                '<td onmousedown ="cellClicked(event,this)" cellI ="' + i + '" cellJ ="' + j + '" class="cell">' +
                cellContent + '</td>'
        }
        strHTML += '</tr>'
    }
    elBoard.innerHTML = strHTML;
}

function cellClicked(event, elCell) {
    var cellI = +elCell.attributes.cellI.value
    var cellJ = +elCell.attributes.cellJ.value
    //left click
    if (event.which === 1) checkCell(cellI, cellJ);
    //right click
    if (event.which === 3) {
        elCell.classList.toggle('flagged');
        gState.markedCount++;
    }
    gState.shownCount = document.querySelectorAll('.clicked').length;
    gState.isGameOn = isCompleted()
}

function isCompleted() {
    if ((gLevel.size * gLevel.size) - gState.shownCount === gState.minesCount) {
        alert('YOU WON!!!');
        return true
    }
}

// CR: cellClicked?
function checkCell(cellI, cellJ) {
    var cellContent = gBoard[cellI][cellJ]
    var elCell = document.querySelector('.cell[celli = "' + cellI + '"][cellj = "' + cellJ + '"]')
    // CR: better to have this kind of information on your model. 
    if (elCell.classList.contains('flagged')) {
        return
    }
    // CR : not necceserry else if.
    //CR : elCell.classList.add('clicked'); can be writtem only once.
    else if (elCell.innerText === MINE) {
        elCell.classList.add('clicked');
        gameover();
        setTimeout(function () {
            alert('game over');
        }, 300)
    }
    else if (cellContent.negsCount > 0) {
        elCell.classList.add('clicked')
        gBoard[cellI][cellJ].isClicked = true;
        gState.shownCount++;
    }
    else if (elCell.innerHTML === EMPTY_CELL) {
        elCell.classList.add('clicked')
        gBoard[cellI][cellJ].isClicked = true;
        revealEmptyCells(cellI, cellJ);
        gState.shownCount++;
    }
}

// CR: Not very good name. you dont reval only emty cell. you reveal the neigbhors of emty cell also. 
function revealEmptyCells(cellI, cellJ) {
    var coordsToReveal = [];
    coordsToReveal = getNeighbours(cellI, cellJ);
    //creating a list of els to reveal 
    for (var i = 0; i < coordsToReveal.length; i++) {
        var elCoord = coordsToReveal[i];
        var el = document.querySelector('.cell[celli = "' + elCoord.i + '"][cellj = "' + elCoord.j + '"]');
        if (addClickedClass(el, elCoord)) gState.shownCount++
        if (el.innerHTML === EMPTY_CELL) {
            revealEmptyCells(elCoord.i, elCoord.j)
        }
    }
}

function addClickedClass(el, coord) {
    if (el.classList.contains('clicked')) {
        return false;
    }
    el.classList.add('clicked');
    gBoard[coord.i][coord.j].isClicked = true;
    return true
}

function getNeighbours(cellI, cellJ) {
    var negs = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].negsCount >= 0 && !gBoard[i][j].isClicked) negs.push({ i: i, j: j })
        }
    }
    return negs
}

function gameover() {
    var cells = document.querySelectorAll('.cell');
    clearInterval(gTimeInterval);
    for (var i = 0; i < cells.length; i++) {
        cells[i].classList.add('clicked');
    }
}

//CR : you can use init game (with little changes), almost indentical to initGame().
function setLevel(levelIdx) {
    var levels = [
        { size: 4, mines: 2 },
        { size: 6, mines: 5 },
        { size: 8, mines: 15 }
    ]
    gLevel.size = levels[levelIdx].size;
    gLevel.mines = levels[levelIdx].mines;
    localStorage.mineSweeperLevel = levelIdx;
    gBoard = createBoard()
    gState = { isGameOn: true, shownCount: 0, markedCount: 0, time: 0 }
    addMines(gBoard)
    countNegs(gBoard);
    renderBoard(gBoard);
}

function addSecs() {
    gState.time++;
    document.querySelector('.time').innerText = gState.time;
}