import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  const [grid, setGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [gridWidth, setGridWidth] = useState(2);
  const [totalLPieces, setTotalLPieces] = useState(1);
  const MAX_GRID_WIDTH = 4;

  const generateGrid = (n) => {
    n = 2**n;
    
    const newGrid = []

    for (let i=0; i<n; i++) {
      const row = [];
      for (let j=0; j<n; j++) {
        row.push(0);
      }
      newGrid.push(row);
    }

    if (n > 0) {
      const randomIndex = Math.floor(Math.random() * (n*n));
      const randomRow = Math.floor(randomIndex / n);
      const randomCol = randomIndex % n;

      newGrid[randomRow][randomCol] = -1;
    }

    return newGrid;
  }

  
  const placeLShape = (grid, row, col, orientation) => {
    const newGrid = [...grid];

    const orientationOffsets = {
      0: [[0, 0], [1, 0], [1, 1]],
      1: [[0, 0], [0, 1], [1, 0]],
      2: [[0, 0], [0, 1], [1, 1]],
      3: [[0, 1], [1, 0], [1, 1]]
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
      console.error("Cannot place L-shape here!");
      return newGrid;
    }

    offsets.forEach(([rowOffset, colOffset]) => {
      newGrid[row + rowOffset][col + colOffset] = totalLPieces;
    });

    setTotalLPieces((prev) => prev + 1);
        
    return newGrid;
  }

  const populateGridWithLPieces = (grid) => {
    const newGrid = [...grid];
    let lPiecesPlaced = 0;

    for (let row=0; row<newGrid.length; row++) {
      for (let col=0; col<newGrid[row].length; col++) {
        if (newGrid[row][col] === 0) {
          const canPlaceLShape = row+1 < newGrid.length && col+1 < newGrid[row].length &&
            newGrid[row][col] === 0 &&
            newGrid[row][col+1] === 0 &&
            newGrid[row+1][col] === 0;

          if (canPlaceLShape) {
            placeLShape(newGrid, row, col, Math.floor(Math.random() * 4));
            lPiecesPlaced++;
          }
        }
      }
    }

    console.log(`Total L-pieces placed: ${lPiecesPlaced}`);
    
    return newGrid;
  }
  
  useEffect(() => {
    setGrid(generateGrid(gridWidth));
  }, [gridWidth]);

  const renderedLPieces = useMemo(() => {
    const piecesById = new Map();

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cellValue = grid[row][col];

        if (cellValue > 0) {
          if (!piecesById.has(cellValue)) {
            piecesById.set(cellValue, []);
          }

          piecesById.get(cellValue).push({ row, col });
        }
      }
    }

    return [...piecesById.entries()]
      .filter(([, cells]) => cells.length === 3)
      .map(([id, cells]) => {
        const rowStart = Math.min(...cells.map((cell) => cell.row)) + 1;
        const colStart = Math.min(...cells.map((cell) => cell.col)) + 1;

        const localCells = new Set(
          cells.map((cell) => `${cell.row - (rowStart - 1)}-${cell.col - (colStart - 1)}`)
        );

        const hasTopLeft = localCells.has('0-0');
        const hasTopRight = localCells.has('0-1');
        const hasBottomLeft = localCells.has('1-0');
        const hasBottomRight = localCells.has('1-1');

        let rotationDeg = 0;

        if (!hasBottomRight && hasTopLeft && hasTopRight && hasBottomLeft) {
          rotationDeg = 0;
        } else if (!hasBottomLeft && hasTopLeft && hasTopRight && hasBottomRight) {
          rotationDeg = 90;
        } else if (!hasTopLeft && hasTopRight && hasBottomLeft && hasBottomRight) {
          rotationDeg = 180;
        } else if (!hasTopRight && hasTopLeft && hasBottomLeft && hasBottomRight) {
          rotationDeg = 270;
        }

        return { id, rowStart, colStart, rotationDeg };
      });
  }, [grid]);

  return (
    <>
      <section id="center">
        <div
          className="grid grid-container"
          style={{ '--grid-size': grid.length }}
        >
          <div className="grid grid-overlay">
            {renderedLPieces.map((piece) => {
              return <div 
                key={piece.id}
                className="grid-L-piece"
                style={{
                  gridColumn: `${piece.colStart} / span 2`,
                  gridRow: `${piece.rowStart} / span 2`,
                  rotate: `${piece.rotationDeg}deg`
                }}
              ></div>
            })}
          </div>
          {grid.map((row, rowIndex) => {
            return row.map((col, colIndex) => {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  is-the-square={col}
                  className="grid-sub-square"
                >
                  {/* <div className="L-piece-centre"></div> */}
                </div>
              );
            });
          })}
        </div>
        
        <div className="grid-controls">
          <button className="default-button" onClick={() => {if (gridWidth>1) setGridWidth(gridWidth-1)}}><img src="src/assets/minus.svg" alt="" /></button>
          <button className="default-button" onClick={() => {if (gridWidth<MAX_GRID_WIDTH) setGridWidth(gridWidth+1)}}><img src="src/assets/plus.svg" alt="" /></button>
          <button className="default-button" onClick={() => {setGrid(generateGrid(gridWidth))}}><img src="src/assets/refresh.svg" alt="" /></button>
          <button className="default-button" onClick={() => {
            setGrid(placeLShape(grid, 0, 0, 3));
            console.log(grid);
          }}><img src="src/assets/add.svg" alt="" /></button>
        </div>
      </section>
    </>
  )
}

export default App
