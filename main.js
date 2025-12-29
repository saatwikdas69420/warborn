const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
let selectedTerritoryId = null
fetch("indian_map.svg")
.then(res => res.text())
.then(loadMap)

const GRID_COLS = 2
const GRID_ROWS = 1
const CELL_SIZE = 200

function loadMap(svgText){
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, "image/svg+xml")

  const paths = doc.querySelectorAll("path")
  paths.forEach(path => {
    const id = path.id
    const d = path.getAttribute("d")

    const polygon = parsePathToPolygon(d)

    gameState.territories[id] = {
      id,
      owner: null,
      polygon,
      labelPos: centroid(polygon),
      neighbors: [],
      population: 1000,
      maxPop: 10000,
      units: 100,
      manpower: 100
    }
  })
}

function parsePathToPolygon(d){
  const tokens = d
  .replace(/,/g, " ")
  .split(/\s+/)

  const points = []
  let i = 0

  while (i < tokens.length){
    const token = tokens[i++]

    if (token === "M" || token === "L") {
      const x = parseFloat(tokens[i++])
      const y = parseFloat(tokens[i++])
      points.push({ x , y })
    }

    if (token === "Z") break
  }

  return points
}

function centroid(points) {
  let x = 0, y = 0
  for (const p of points) {
    x += p.x
    y += p.y
  }
  return {
    x: x / points.length,
    y: y / points.length
  }
}

function territoryToGrid(id) {
  const index = id - 1
  return {
    col: index % GRID_COLS,
    row: Math.floor(index / GRID_COLS)
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const t of Object.values(gameState.territories)) {
    const { col, row } = territoryToGrid(t.id)

    const x = col * CELL_SIZE
    const y = row * CELL_SIZE

    ctx.fillStyle = gameState.players[t.owner]?.color || "#888"
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

    if (t.id === selectedTerritoryId) {
      ctx.strokeStyle = "yellow"
      ctx.lineWidth = 4
      ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
    }

    ctx.fillStyle = "white"
    ctx.font = "16px sans-serif"
    ctx.fillText(`Territory ${t.id}`, x + 10, y + 20)
    ctx.fillText(`Units: ${Math.floor(t.units)}`, x + 10, y + 45)
    ctx.fillText(`Population: ${Math.floor(t.population)}`, x + 10, y + 65)
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas. getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const col = Math.floor(mouseX / CELL_SIZE)
  const row = Math.floor(mouseY / CELL_SIZE)

  const clickedId = row * GRID_COLS + col + 1

  const clickedTerritory = gameState.territories[clickedId]
  if (!clickedTerritory) return

  handleTerritoryClick(clickedTerritory)
})

function handleTerritoryClick(territory) {
  if (selectedTerritoryId === null){
    selectedTerritoryId = territory.id
    return
  }

  const selected = gameState.territories[selectedTerritoryId]

  // same territory -> deselect
  if (selected.id === territory.id){
    selectedTerritoryId = null
    return
  }

  // Only allow neighbor interactions
  if (selected.neighbors.includes(territory.id)) {
    // temporary test logging
    console.log(`Order: ${selected.id} attacks ${territory.id}`)
    
    // Later push to queue
  }
  selectedTerritoryId = null
}

const gameState = {
  time : 0,

  players : {
    // player is the player
    player : { color : "blue" },
    // other values are bots
    2 : { color : "red" },
    3 : { color : "green" }
},

territories : {
  1 : {
    id : 1,
    owner : "player",
    units : 100,
    manpower : 100,
    neighbors : [2],
    terrain : "plains",
    population : 1000,
    maxPop : 10000
  },
  2 : {
    id : 2,
    owner : "2",
    units : 50,
    manpower : 50,
    neighbors : [1], 
    population : 500,
    maxPop : 5000
  },
  3 : {
    id : 3,
    owner : "3",
    units : 50,
    manpower : 50,
    neighbors : [1], 
    population : 500,
    maxPop : 5000
  },
 },
}

let lastTime = 0

function gameLoop(timestamp) {
  const delta = timestamp - lastTime
  lastTime = timestamp

  update(delta)

  requestAnimationFrame(gameLoop)
}

function update(delta) {
  gameState.time += delta

  updateCombat(delta)
  updatePopulation(delta)
  
  render()
  
  if (Math.floor(gameState.time / 1000) !==
    Math.floor((gameState.time - delta) / 1000)) {
    // log
  }
}

requestAnimationFrame(gameLoop)

function updatePopulation(delta) {
  for (const t of Object.values(gameState.territories)) {
    if (t.population < t.maxPop) {
      t.population += delta *0.01
      if (t.population > t.maxPop) t.population = t.maxPop
    }
  }
}

function updateCombat(delta) {
  for (const t of Object.values(gameState.territories)) {
    t.manpower = t.population * 0.1
    if (!t.isUnderAttack && t.units < t.manpower) {
      t.units += t.manpower * 0.001
    }

    
    for (const nId of t.neighbors) {
      const neighbor = gameState.territories[nId]
      
      if (t.owner !== neighbor.owner) {
        /* const attackPower = t.units * 0.005 * delta 
        neighbor.units -= attackPower
        if (neighbor.units <= 0){
          neighbor.owner = t.owner
          neighbor.units = t.units * 0.2
          // temporary test logging
          console.log(`Territory ${neighbor.id} captured by ${t.owner}`)
        } */
      }
    }
  }
}
