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
    id : 0,
    owner : "player",
    units : 100,
    neighbors : [2],
    terrain : "plains",
    population : 1000,
    maxPop : 10000
  },
  2 : {
    id : 2,
    owner : "2",
    units : 50,
    neighbors : [1], 
    population : 500,
    maxPop : 5000
  },
  3 : {
    id : 3,
    owner : "3",
    units : 50,
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
  
  // temporary test logging
  for (const t of Object.values(gameState.territories)) {
    console.log(`T${t.id} Owner:${t.owner} Units:${t.units.toFixed(1)} Pop:${Math.floor(t.population)}`)
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
    t.units = t.population * 0.1
    
    for (const nId of t.neighbors) {
      const neighbor = gameState.territories[nId]
      
      if (t.owner !== neighbor.owner) {
        const attackPower = t.units * 0.001 * delta 
        neighbor.units -= attackPower
        if (neighbor.units <= 0){
          neighbor.owner = t.owner
          neighbor.units = t.units * 0.2
          // temporary test logging
          console.log(`Territory ${neighbor.id} captured by ${t.owner}`)
        }
      }
    }
  }
}
