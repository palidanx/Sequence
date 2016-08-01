var exports = module.exports = {};

exports.convertBoardInto2DArray = function(board, playerColor){
	console.log(board.length);
	var tdboard = [];
	var row = [];
	var counter = 0;
	for (var i = 0 ; i < 10; i ++){
		tdboard[i] = board.splice(0,10);
	}
	console.log(tdboard);
	tdboard[0][0] = playerColor;
	tdboard[9][9] = playerColor;
	tdboard[0][9] = playerColor;
	tdboard[9][0] = playerColor;
	console.log(tdboard);
	return tdboard;
}
exports.renderLineArray = function(lineArray){
	console.log(lineArray);
}

exports.checkForLines = function(board, _row, _col){
	var tdboard = convertBoardInto2DArray(board);
	var splicedBoard = [];
	var row = parseInt(_row);
	var col = parseInt(_col);
	var r1 = Math.max(0, row - 4);
	var r2 = Math.min(10, row + 4);
	var c1 = Math.max(0, col - 4);
	var c2 = Math.min(10, col + 4);

	var horizontal = checkHorizontal([r1,r2], [c1,c2], row, col, board);
	var vertical = checkVertical([r1,r2], [c1,c2], row, col, board);
	var ndiagonal = checkNDiagonal([r1,r2], [c1,c2], row, col, board);
	var pdiagonal = checkPDiagonal([r1,r2], [c1,c2], row, col, board);

	if (horizontal != null){
		if (horizontal[0] == 2){
			renderLineArray(horizontal[1]);
			madeLine();
			madeLine();
		}
		else if (horizontal[2] == true){
			var lineArray = makeUserChooseLine(horizontal[1]);
			renderLineArray(lineArray);
			madeLine()
		}
		else{
			renderLineArray(horizontal[1]);
			madeLine();

		}
	}
	if (vertical != null){
		if (vertical[0] == 2){
			renderLineArray(vertical[1]);
		}
		else if (vertical[2] == true){
			var lineArray = makeUserChooseLine(vertical[1]);
			renderLineArray(lineArray);
		}
		else{
			renderLineArray(vertical[1]);
		}
	}
	if (ndiagonal != null){
		if (ndiagonal[0] == 2){
			renderLineArray(ndiagonal[1]);
		}
		else if (ndiagonal[2] == true){
			var lineArray = makeUserChooseLine(ndiagonal[1]);
			renderLineArray(lineArray);
		}
		else{
			renderLineArray(ndiagonal[1]);
		}
	}
	if (pdiagonal != null){
		if (pdiagonal[0] == 2){
			renderLineArray(pdiagonal[1]);
		}
		else if (pdiagonal[2] == true){
			var lineArray = makeUserChooseLine(pdiagonal[1]);
			renderLineArray(lineArray);
		}
		else{
			renderLineArray(pdiagonal[1]);
		}
	}

}

exports.checkHorizontal = function(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	for (var i = col - 1; i >= c1; i--){
		if (board[row][i] == playerColor){
			bArray.push([row, i]);
			bscore ++;
		}
		else
			break;
	}
	for (var i = col + 1; i <= c2; i++){
		if (board[row][i] == playerColor){
			fArray.push([row, i]);
			fscore ++;
		}
		else
			break;
	}
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
exports.checkVertical = function(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	for (var i = row - 1; i >= r1; i--){
		if (board[i][col] == playerColor){
			bArray.push([i, col]);
			bscore ++;
		}
		else
			break;
	}
	for (var i = row + 1; i <= r2; i++){
		if (board[i][col] == playerColor){
			fArray.push([i, col]);
			fscore ++;
		}
		else
			break;
	}
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
exports.checkNDiagonal = function(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	var i = row - 1, j = col - 1;
	for ( ;i >= r1 && j >=c1; ){
		if (board[i][j] == playerColor){
			bArray.push([i, j]);
			bscore ++;
			i--, j--;
		}
		else
			break;
	}
	var i = row + 1; j = col + 1;
	for ( ;i <= r2 && j <= c2; ){
		if (board[i][j] == playerColor){
			fArray.push([i, j]);
			fscore ++;
			i++, j++;
		}
		else
			break;
	}	
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
exports.checkFDiagonal = function(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	var i = row + 1, j = col - 1;
	for ( ;i <= r2 && j >=c1; ){
		if (board[i][j] == playerColor){
			bArray.push([i, j]);
			bscore ++;
			i++, j--;
		}
		else
			break;
	}
	var i = row - 1; j = col + 1;
	for ( ;i >= r1 && j <= c2; ){
		if (board[i][j] == playerColor){
			fArray.push([i, j]);
			fscore ++;
			i--, j++;
		}
		else
			break;
	}	
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
