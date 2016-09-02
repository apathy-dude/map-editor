let map = {
    floor: [
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
           0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 1, 1, 1, 2, 2, 1, 1, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
    wallsH: [
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 1, 1, 3, 3, 1, 1, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 1, 1, 3, 3, 1, 1, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
    wallsV: [
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
           0, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0,
           0, 3, 0, 0, 4, 0, 4, 0, 0, 3, 0,
           0, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0,
           0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0,
           0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0,
           0, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0,
           0, 3, 0, 0, 4, 0, 4, 0, 0, 3, 0,
           0, 1, 0, 0, 2, 0, 2, 0, 0, 1, 0,
           0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    width: 10,
    height: 10,
    wallWidth: 3,
    wallDefinitions: [
        { width: 16, blocksVision: 1, blocksMovement: 1, display: 'solid', color: 'rgb(0, 0, 0)' },
        { width: 8, blocksVision: 1, blocksMovement: 1, display: 'solid', color: 'rgb(0, 0, 0)' },
        { width: 2, blocksVision: 0.1, blocksMovement: 1, display: 'solid', color: 'rgb(0, 160, 200)' },
        { width: 4, blocksVision: 1, blocksMovement: 1, display: 'solid', color: 'rgb(100, 60, 50)' },
    ],
    floorDefinitions: [
        { display: 'solid', color: 'rgb(0, 60, 60)', movement: 1, vision: 1 },
        { display: 'solid', color: 'rgb(120, 120, 120)', movement: 1, vision: 1 },
    ]
};

let options = {
    cellSize: 100,
    refreshRate: 1000/30,
    grid: { display: 'solid', color: 'rgba(0, 0, 0, 0.35)', lineWidth: 1 },
    gui: {
        mainColor: 'rgba(0, 255, 0, 0.35)',
        mainColorBorder: 'rgb(0, 255, 0)',
        mainLineWidth: 1
    }
};

let canvas = document.getElementById('map');
canvas.width = map.width * options.cellSize;
canvas.height = map.height * options.cellSize;

((canvas, map, options) => {
    let ctx = canvas.getContext('2d');

    let mousedownCell = null;
    let mouseCell = null;
    let selectedCells = null;

    let drawFloor =  (ctx, map, options, def, start, end) => {
        let width = (end[0] - start[0]) * options.cellSize;
        ctx.fillRect(start[0] * options.cellSize, start[1] * options.cellSize, width, options.cellSize);
    };
    let drawWall = (ctx, map, options, def, start, end) => {
        let width = (end[0] - start[0]) * options.cellSize + def.width;
        let height = (end[1] - start[1]) * options.cellSize + def.width;
        ctx.fillRect(start[0] * options.cellSize - Math.floor(def.width / 2), start[1] * options.cellSize - Math.floor(def.width / 2), width, height);
    };
    let drawGrid = (ctx, map, options) => {
        ctx.lineWidth = options.grid.lineWidth;
        ctx.strokeStyle = options.grid.color;

        for(let line = 1; line < map.width || line < map.height; line++) {
            if(line < map.width) {
                ctx.beginPath();
                ctx.moveTo(line * options.cellSize, 0);
                ctx.lineTo(line * options.cellSize, map.height * options.cellSize);
                ctx.stroke();
            }

            if(line < map.height) {
                ctx.beginPath();
                ctx.moveTo(0, line * options.cellSize);
                ctx.lineTo(map.width * options.cellSize, line * options.cellSize);
                ctx.stroke();
            }
        }
    };
    let drawGui = (ctx, map, options) => {
        ctx.lineWidth = options.gui.mainLineWidth;
        ctx.strokeStyle = options.gui.mainColorBorder;
        ctx.fillStyle = options.gui.mainColor;

        if(mouseCell && mousedownCell) {
            let xStart, yStart, xEnd, yEnd;

            if(mousedownCell[0] < mouseCell[0]) {
                xStart = mousedownCell[0];
                xEnd = mouseCell[0] + 1;
            }
            else {
                xStart = mouseCell[0];
                xEnd = mousedownCell[0] + 1;
            }

            if(mousedownCell[1] < mouseCell[1]) {
                yStart = mousedownCell[1];
                yEnd = mouseCell[1] + 1;
            }
            else {
                yStart = mouseCell[1];
                yEnd = mousedownCell[1] + 1;
            }

            let rect = [xStart * options.cellSize, yStart * options.cellSize, (xEnd - xStart) * options.cellSize, (yEnd - yStart) * options.cellSize];

            ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
            ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
        }
        else if(mouseCell) {
            let rect = [mouseCell[0] * options.cellSize, mouseCell[1] * options.cellSize, options.cellSize, options.cellSize];

            ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
            ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
        }
        else if(selectedCells) {
        }
    };

    canvas.addEventListener('mousedown', (e) => {
        mousedownCell = [Math.floor(e.layerX / options.cellSize), Math.floor(e.layerY / options.cellSize)];
    });

    canvas.addEventListener('mousemove', (e) => {
        mouseCell = [Math.floor(e.layerX / options.cellSize), Math.floor(e.layerY / options.cellSize)];
    });

    canvas.addEventListener('mouseup', (e) => {
        if(!mousedownCell)
            return;

        // TODO: Determine selectedCells

        mousedownCell = null;
    });

    setInterval(draw, options.refreshRate, ctx, map, options, drawFloor, drawWall, drawGrid, drawGui);

    function draw(ctx, map, options, drawFloor, drawWall, drawGrid, drawGui) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for(let fc = map.floorDefinitions.length - 1; fc >= 0; fc--) {
            let def = map.floorDefinitions[fc];
            if(def.display === 'none')
                continue;

            ctx.fillStyle = def.color;
            let id = parseInt(fc) + 1;
            let start = null;

            for(let y = 0; y < map.height; y++) {
                let yOff = y * map.width;
                for(let x = 0; x < map.width; x++) {
                    if(start) {
                        if(map.floor[yOff + x] !== id) {
                            drawFloor(ctx, map, options, def, start, [x, y]);
                            start = null;
                        }
                    }
                    else if(map.floor[yOff + x] === id)
                        start = [x, y];
                }

                if(start !== null) {
                    drawFloor(ctx, map, options, def, start, [map.width, y]);
                    start = null;
                }
            }
        }

        for(let wc = map.wallDefinitions.length - 1; wc >= 0; wc--) {
            let def = map.wallDefinitions[wc];
            if(def.display === 'none')
                continue;

            ctx.fillStyle = def.color;
            let id = parseInt(wc) + 1;
            let start = null;

            for(let y = 0; y < map.height + 1; y++) {
                let yOff = y * map.width;
                for(let x = 0; x < map.width; x++) {
                    if(start) {
                        if(map.wallsH[yOff + x] !== id) {
                            drawWall(ctx, map, options, def, start, [x, y]);
                            start = null;
                        }
                    }
                    else if(map.wallsH[yOff + x] === id)
                        start = [x, y];
                }

                if(start !== null) {
                    drawWall(ctx, map, options, def, start, [map.width, y]);
                    start = null;
                }
            }

            for(let x = 0; x < map.width + 1; x++) {
                for(let y = 0; y < map.height; y++) {
                    let yOff = y * (map.width + 1);
                    if(start) {
                        if(map.wallsV[yOff + x] !== id) {
                            drawWall(ctx, map, options, def, start, [x, y]);
                            start = null;
                        }
                    }
                    else if(map.wallsV[yOff + x] === id)
                        start = [x, y];
                }

                if(start !== null) {
                    drawWall(ctx, map, options, def, start, [x, map.height]);
                    start = null;
                }
            }
        }

        if(options.grid.display !== 'none')
            drawGrid(ctx, map, options);

        if(drawGui && typeof(drawGui) === 'function')
            drawGui(ctx, map, options);
    }
}
)(canvas, map, options);

