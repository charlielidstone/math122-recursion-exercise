import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [grid, setGrid] = useState([]);
  const [gridWidth, setGridWidth] = useState(2);

  const generateGrid = (n) => {
    const newGrid = []

    for (let i=0; i<n; i++) {
      const row = [];
      for (let j=0; j<n; j++) {
        row.push(0);
      }
      newGrid.push(row);
    }

    if (n > 0) {
      const randomIndex = Math.floor(Math.random() * (n * n));
      const randomRow = Math.floor(randomIndex / n);
      const randomCol = randomIndex % n;

      newGrid[randomRow][randomCol] = 1;
    }

    return newGrid;
  }

  useEffect(() => {
    setGrid(generateGrid(gridWidth));
  }, [gridWidth]);


  return (
    <>
      <section id="center">
        <div
          className="grid-container"
          style={{ '--grid-size': grid.length }}

        >
          {grid.map((row, rowIndex) => {
            return row.map((col, colIndex) => {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  is-the-square={col}
                  className="grid-sub-square"
                >
                </div>
              );
            });
          })}
        </div>
        
        <div className="grid-size-controls">
          Grid size:
          <button className="default-button" onClick={() => {setGridWidth(gridWidth-1)}}><img src="src/assets/minus.svg" alt="" /></button>
          <button className="default-button" onClick={() => {setGridWidth(gridWidth+1)}}><img src="src/assets/plus.svg" alt="" /></button>
        </div>
      </section>
    </>
  )
}

export default App
