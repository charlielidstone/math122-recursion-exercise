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

function generateGrid(N, missingRow = null, missingCol = null) {
    N = 2**N;
    
    const newGrid = []

    for (let i=0; i<N; i++) {
      const row = [];
      for (let j=0; j<N; j++) {
        row.push(0);
      }
      newGrid.push(row);
    }

    if (missingRow !== null && missingCol !== null) {
        newGrid[missingRow][missingCol] = -1;
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
const DELAY_MS = 100;

function sleep(ms, signal = null) {
    return new Promise(resolve => {
        const timeout = setTimeout(resolve, ms);
        if (signal) {
            signal._abortCurrentSleep = () => {
                clearTimeout(timeout);
                resolve();
            };
        }
    });
}

async function solveGrid(grid, N, setGrid = null, signal = null) {
    return fillGrid(N, ...findMissingSquare(grid), { current: 1 }, -1, null, 0, 0, setGrid, signal);
}

async function fillGrid(N, missingRow, missingCol, pieceCounter = { current: 1 }, missingValue = -1, rootGrid = null, rowOffset = 0, colOffset = 0, setGrid = null, signal = null) {
    if (signal?.cancelled) return rootGrid;

    if (rootGrid === null) {
        rootGrid = generateGrid(N);
    }

    rootGrid[rowOffset + missingRow][colOffset + missingCol] = missingValue;

    if (N == 1) {
        const orientation = pairToQuadrant(missingRow, missingCol);
        placeLShape(rootGrid, rowOffset, colOffset, orientation, pieceCounter.current++);
        if (setGrid) {
            setGrid(rootGrid.map(r => [...r]));
            await sleep(DELAY_MS, signal);
        }
    } else {
        const subSize = 2**(N-1);
        const missingSquareSubRow = Math.floor(missingRow/subSize);
        const missingSquareSubCol = Math.floor(missingCol/subSize);
        const missingSquareQuadrant = pairToQuadrant(missingSquareSubRow, missingSquareSubCol);

        const [mQRow, mQCol] = quadrantToPair(missingSquareQuadrant);
        await fillGrid(N-1, missingRow % subSize, missingCol % subSize, pieceCounter, missingValue, rootGrid, rowOffset + mQRow * subSize, colOffset + mQCol * subSize, setGrid, signal);

        if (signal?.cancelled) return rootGrid;

        const centreId = pieceCounter.current++;
        placeLShape(rootGrid, rowOffset + subSize - 1, colOffset + subSize - 1, missingSquareQuadrant, centreId);
        if (setGrid) {
            setGrid(rootGrid.map(r => [...r]));
            await sleep(DELAY_MS, signal);
        }

        for (var i = 0; i < 4; i++) {
            if (i !== missingSquareQuadrant) {
                if (signal?.cancelled) return rootGrid;
                const [qRow, qCol] = quadrantToPair(i);
                const innerRow = qRow === 0 ? subSize - 1 : 0;
                const innerCol = qCol === 0 ? subSize - 1 : 0;
                await fillGrid(N-1, innerRow, innerCol, pieceCounter, centreId, rootGrid, rowOffset + qRow * subSize, colOffset + qCol * subSize, setGrid, signal);
            }
        }
    }

    return rootGrid;
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