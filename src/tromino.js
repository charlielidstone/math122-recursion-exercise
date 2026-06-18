function placeLShape(grid, row, col, orientation, pieceId) {
    const newGrid = [...grid];

    const orientationOffsets = {
        0: [[0, 1], [1, 0], [1, 1]],
        1: [[0, 0], [1, 0], [1, 1]],
        2: [[0, 0], [0, 1], [1, 0]],
        3: [[0, 0], [0, 1], [1, 1]],
    };

    const offsets = orientationOffsets[orientation];

    if (!offsets) {
        console.error(`Invalid L-shape orientation: ${orientation}`);
        return newGrid;
    }

    const canPlace = offsets.every(([rowOffset, colOffset]) => {
        const targetRow = row + rowOffset;
        const targetCol = col + colOffset;

        if (targetRow < 0 || targetRow >= newGrid.length || targetCol < 0 || targetCol >= newGrid[targetRow].length) {
            return false;
        }

        return newGrid[targetRow][targetCol] === 0;
    });

    if (!canPlace) {
        console.error("Error: Space already occupied");
        return newGrid;
    }

    offsets.forEach(([rowOffset, colOffset]) => {
        newGrid[row + rowOffset][col + colOffset] = pieceId;
    });

    return newGrid;
}

function generateGrid(N) {
    N = 2**N;
    
    const newGrid = []

    for (let i=0; i<N; i++) {
      const row = [];
      for (let j=0; j<N; j++) {
        row.push(0);
      }
      newGrid.push(row);
    }

    return newGrid;
}

function generateRandomGrid(N) {
    const newGrid = generateGrid(N);
    const randomRow = Math.floor(Math.random() * newGrid.length);
    const randomCol = Math.floor(Math.random() * newGrid.length);

    newGrid[randomRow][randomCol] = -1;

    return newGrid;
}

// The Magic -----------------------------------------------------------------------------------
function solveGrid(grid, N) {
    return fillGrid(N, ...findMissingSquare(grid));
}

function fillGrid(N, missingRow, missingCol, pieceCounter = { current: 1 }, missingValue = -1) {
    var grid = generateGrid(N);
    grid[missingRow][missingCol] = missingValue;

    if (N == 1) {
        const orientation = pairToQuadrant(missingRow, missingCol);
        console.log("orientation: ", orientation);
        grid = placeLShape(grid, 0, 0, orientation, pieceCounter.current++);
    } else {
        const subSize = 2**(N-1);
        const missingSquareSubRow = Math.floor(missingRow/subSize);
        const missingSquareSubCol = Math.floor(missingCol/subSize);
        const missingSquareQuadrant = pairToQuadrant(missingSquareSubRow, missingSquareSubCol);

        console.log("missingSquareQuadrant: ", missingSquareQuadrant);
        console.log("subSize: ", subSize);

        const missingSquareSubGrid = fillGrid(N-1, (missingRow % subSize), (missingCol % subSize), pieceCounter, missingValue);
        mergeGrids(grid, missingSquareSubGrid, missingSquareQuadrant);

        const centreId = pieceCounter.current++;
        placeLShape(grid, subSize-1, subSize-1, missingSquareQuadrant, centreId);

        for (var i=0; i<4; i++) {
            if (i !== missingSquareQuadrant) {
                const [qRow, qCol] = quadrantToPair(i);
                const innerRow = qRow === 0 ? subSize - 1 : 0;
                const innerCol = qCol === 0 ? subSize - 1 : 0;
                const subGrid = fillGrid(N-1, innerRow, innerCol, pieceCounter, centreId);
                mergeGrids(grid, subGrid, i);
            }
        }


    }

    return grid;
}

function mergeGrids(grid, subGrid, quadrant) {
    const subSize = subGrid.length;
    const quadrantOffsets = [
        [0,       0      ],  // 0: top-left
        [0,       subSize],  // 1: top-right
        [subSize, subSize],  // 2: bottom-right
        [subSize, 0      ],  // 3: bottom-left
    ];
    const [rowOffset, colOffset] = quadrantOffsets[quadrant];

    for (let r = 0; r < subSize; r++) {
        for (let c = 0; c < subSize; c++) {
            grid[rowOffset + r][colOffset + c] = subGrid[r][c];
        }
    }

    return grid;
}

function pairToQuadrant(row, col) {
    if (row === 0) return col;
    return 3 - col;
}

function quadrantToPair(quadrant) {
    const row = quadrant < 2 ? 0 : 1;
    const col = row === 0 ? quadrant : 3 - quadrant;
    return [row, col];
}

function findMissingSquare(grid) {
    for (var row=0; row<grid.length; row++) {
        for (var col=0; col<grid[row].length; col++) {
            if (grid[row][col] === -1) {
                return [row, col];
            }
        }
    }
    return null;
}


export { solveGrid, placeLShape, generateGrid, generateRandomGrid };