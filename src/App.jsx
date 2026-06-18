import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { solveGrid, generateRandomGrid } from './tromino';

function App() {
  const [grid, setGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [N, setN] = useState(2);
  const MAX_GRID_WIDTH = 6;

  useEffect(() => {
    setGrid(generateRandomGrid(N));
  }, [N]);

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
                  {/* {rowIndex}, {colIndex} */}
                </div>
              );
            });
          })}
        </div>
        
        <div className="grid-controls">
          <button className="default-button" onClick={() => {if (N>1) setN(N-1)}}><img src="src/assets/minus.svg" alt="" /></button>
          <button className="default-button" onClick={() => {if (N<MAX_GRID_WIDTH) setN(N+1)}}><img src="src/assets/plus.svg" alt="" /></button>
          <button className="default-button" onClick={() => {setGrid(generateRandomGrid(N))}}><img src="src/assets/refresh.svg" alt="" /></button>
          <button className="default-button" onClick={async () => {
            await solveGrid(grid, N, setGrid);
          }}><img src="src/assets/add.svg" alt="" />Solve Grid</button>
        </div>
      </section>
    </>
  )
}

export default App
