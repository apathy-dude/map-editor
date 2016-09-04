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
    ],
    base: { color: 'rgb(255, 255, 255)', border: { width: 4, display: 'solid', color: 'rgb(120, 120, 120)' } }
};

let options = {
    cellSize: 100,
    defaultCellSize: 100,
    wallMultiplier: 1,
    refreshRate: 1000/30,
    grid: { display: 'solid', color: 'rgba(0, 0, 0, 0.35)', lineWidth: 1 },
    gui: {
        mainColor: 'rgba(0, 255, 0, 0.35)',
        mainColorBorder: 'rgb(0, 255, 0)',
        mainLineWidth: 1
    },
    background: 'rgb(0, 0, 0)',
    cameraOffset: null,
    zoomAmount: 0,
    zoomIdx: 5,
    zooms: [10, 15, 25, 40, 60, 100, 150, 225, 340, 510]
};

let gui = {
    currentMode: 'cellSelect',
    visible: true,
    size: null,
    mousedown: null,
    mouse: null,
    selected: null,
    mousebutton: null,
};

let canvas = document.getElementById('map');

((canvas, map, options, gui) => {
    let ctx = canvas.getContext('2d');

    setInterval(draw, options.refreshRate, ctx, map, options, gui, drawFloor, drawWall, drawGrid, drawGui);

    canvas.addEventListener('mousedown', (e) => {
        if(gui.mousedown || e.button === 2)
            return false;

        const mouse = getMousePos(map, options, gui, e);

        gui.mousebutton = e.buttons;
        gui.mousedown = mouse.cell;
    });

    canvas.addEventListener('mousemove', (e) => {
        const mouse = getMousePos(map, options, gui, e);

        if(!mouse.cell) {
            if(!gui.mousedown)
                gui.mouse = null;
        }
        else
            gui.mouse = mouse.cell;

        if(e.buttons === 2) {
            options.cameraOffset[0] += e.movementX;
            options.cameraOffset[1] += e.movementY;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if(!gui.mousedown)
            return;

        // TODO: Determine selected

        gui.mousedown = null;
    });

    canvas.addEventListener('wheel', (e) => {
        // Handle touch screen zoom.  TODO: imporove touch screen support
        if((e.deltaY > 0 && options.zoomAmount > 0) || e.deltaY < 0 && options.zoomAmount < 0)
            options.zoomAmount = 0;
        else
            options.zoomAmount += e.deltaY;

        const deltaIdx = options.zoomAmount > 1 ? -1 : options.zoomAmount < -1 ? 1 : 0;
        const zoom = options.zoomIdx + deltaIdx;
        const zoomMax = options.zooms.length;
        const mouse = getMousePos(map, options, gui, e);

        if(deltaIdx !== 0)
            options.zoomAmount = 0;

        if(zoom >= 0 && zoom < zoomMax && mouse.onMap) {
            options.zoomIdx = zoom;
            options.cellSize = options.zooms[options.zoomIdx];
            options.wallMultiplier = options.cellSize / options.defaultCellSize;

            options.cameraOffset[0] += mouse.pos[0] - (mouse.deciCell[0] * options.cellSize);
            options.cameraOffset[1] += mouse.pos[1] - (mouse.deciCell[1] * options.cellSize);
        }
    });

    function getMousePos(map, options, gui, e) {
        const mouse = [e.layerX, e.layerY];
        const offsetPos = [mouse[0] - options.cameraOffset[0], mouse[1] - options.cameraOffset[1]];
        const width = map.width * options.cellSize;
        const height = map.height * options.cellSize;
        const decimalCell = offsetPos[0] < 0 || offsetPos[1] < 0 || offsetPos[0] > width || offsetPos[1] > height
            ? null
            : [offsetPos[0] / options.cellSize, offsetPos[1] / options.cellSize]

        return {
            onMap: decimalCell !== null,
            onGui: false,
            screen: mouse,
            pos: offsetPos,
            deciCell: decimalCell,
            cell: decimalCell
                ? [Math.floor(decimalCell[0]), Math.floor(decimalCell[1])]
                : null,
            wall: null
        };
    }

    function drawFloor(ctx, map, options, def, start, end) {
        let width = (end[0] - start[0]) * options.cellSize;
        ctx.fillRect(start[0] * options.cellSize + options.cameraOffset[0], start[1] * options.cellSize + options.cameraOffset[1], width, options.cellSize);
    };
    function drawWall(ctx, map, options, def, start, end) {
        let x1 = start[0] * options.cellSize - Math.floor(def.width / 2 * options.wallMultiplier) + options.cameraOffset[0];
        let y1 = start[1] * options.cellSize - Math.floor(def.width / 2 * options.wallMultiplier) + options.cameraOffset[1];
        let width = (end[0] - start[0]) * options.cellSize + def.width * options.wallMultiplier;
        let height = (end[1] - start[1]) * options.cellSize + def.width * options.wallMultiplier;

        ctx.fillRect(x1, y1, width, height);
    };
    function drawGrid(ctx, map, options) {
        ctx.lineWidth = options.grid.lineWidth;
        ctx.strokeStyle = options.grid.color;

        for(let line = 1; line < map.width || line < map.height; line++) {
            if(line < map.width) {
                ctx.beginPath();
                ctx.moveTo(line * options.cellSize + options.cameraOffset[0], options.cameraOffset[1]);
                ctx.lineTo(line * options.cellSize + options.cameraOffset[0], map.height * options.cellSize + options.cameraOffset[1]);
                ctx.stroke();
            }

            if(line < map.height) {
                ctx.beginPath();
                ctx.moveTo(options.cameraOffset[0], line * options.cellSize + options.cameraOffset[1]);
                ctx.lineTo(map.width * options.cellSize + options.cameraOffset[0], line * options.cellSize + options.cameraOffset[1]);
                ctx.stroke();
            }
        }
    };
    function drawGui(ctx, map, options, gui) {
        ctx.lineWidth = options.gui.mainLineWidth;
        ctx.strokeStyle = options.gui.mainColorBorder;
        ctx.fillStyle = options.gui.mainColor;

        if(gui.mouse && gui.mousedown) {
            let xStart, yStart, xEnd, yEnd;

            if(gui.mousedown[0] < gui.mouse[0]) {
                xStart = gui.mousedown[0];
                xEnd = gui.mouse[0] + 1;
            }
            else {
                xStart = gui.mouse[0];
                xEnd = gui.mousedown[0] + 1;
            }

            if(gui.mousedown[1] < gui.mouse[1]) {
                yStart = gui.mousedown[1];
                yEnd = gui.mouse[1] + 1;
            }
            else {
                yStart = gui.mouse[1];
                yEnd = gui.mousedown[1] + 1;
            }

            let rect = [
                xStart * options.cellSize + options.cameraOffset[0],
                yStart * options.cellSize + options.cameraOffset[1],
                (xEnd - xStart) * options.cellSize,
                (yEnd - yStart) * options.cellSize
            ];

            ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
            ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
        }
        else if(gui.mouse) {
            let rect = [
                gui.mouse[0] * options.cellSize + options.cameraOffset[0],
                gui.mouse[1] * options.cellSize + options.cameraOffset[1],
                options.cellSize,
                options.cellSize
            ];

            ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
            ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
        }
        else if(gui.selected) {
        }
    };

    function draw(ctx, map, options, gui, drawFloor, drawWall, drawGrid, drawGui) {
        (function handleCanvas () {
            if(ctx.canvas.width !== window.innerWidth || ctx.canvas.height !== window.innerHeight) { // Resize screen to match that of page size
                if(options.cameraOffset) { // Keep center of page in center of page
                    const deltaW = ctx.canvas.width - window.innerWidth;
                    const deltaH = ctx.canvas.height - window.innerHeight;

                    options.cameraOffset[0] -= deltaW / 2;
                    options.cameraOffset[1] -= deltaH / 2;
                }

                ctx.canvas.width = window.innerWidth;
                ctx.canvas.height = window.innerHeight;
            }

            if(options.cameraOffset === null) { // Move center of map to center of screen
                const ctxWidth = ctx.canvas.width;
                const ctxHeight = ctx.canvas.height;
                const mapWidth = options.cellSize * map.width;
                const mapHeight = options.cellSize * map.height;

                options.cameraOffset = [ ctxWidth / 2 - mapWidth / 2, ctxHeight / 2 - mapHeight / 2];
            }
        })();

        (function drawBackground() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = options.background;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.fillStyle = map.base.border.color;
            ctx.fillRect(
                options.cameraOffset[0] - map.base.border.width,
                options.cameraOffset[1] - map.base.border.width,
                map.width * options.cellSize + map.base.border.width * 2,
                map.height * options.cellSize + map.base.border.width * 2
            );

            ctx.fillStyle = map.base.color;
            ctx.fillRect(
                options.cameraOffset[0],
                options.cameraOffset[1],
                map.width * options.cellSize,
                map.height * options.cellSize);
        })();

        (function drawFloors() {
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
        })();

        (function drawWalls() {
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
        })();

        (function drawOverlays() {
            if(options.grid.display !== 'none')
                drawGrid(ctx, map, options);

            if(drawGui && typeof(drawGui) === 'function')
                drawGui(ctx, map, options, gui);
        })();
    }
})(canvas, map, options, gui);

