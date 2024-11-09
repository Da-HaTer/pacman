const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight
var show_grid = false
const fps = 60
var gameover=false
var score = 0;
var totalPellets = 0;

function playAudio(fileName) {
    var audio = new Audio(fileName);
    // Play the audio
    audio.play();
}

function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

function checkWin() {
    if (score === totalPellets) {
        gameover = true;
        alert('You win!');
    }
}

const keys = {
    z: { pressed: false },
    q: { pressed: false },
    d: { pressed: false },
    s: { pressed: false },
    p: { pressed: false },
    esc: { pressed: false }
}
let laskey = ''
//ghost house coordinates: x: 11 - 16 y: 14 - 16


class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}



class Player {
    constructor({ position, speed, radius }) {
        this.position = position
        this.speed = speed * tz / (10 * fps)
        this.velocity = { x: 0, y: 0 }
        this.radius = radius
        this.color = "yellow"
        this.vertical = false
        this.turn = 0 // 0 no turn 1: starboard -1 : port (wanna turn)
        // this.direction="right"
    }
    draw() {
        c.beginPath()
        let pacman_pos = { x: w / 2 + tz * this.position.x + tz / 2, y: tz * this.position.y + tz * 4 + tz / 2 }
        c.arc(pacman_pos.x, pacman_pos.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
    update(map) {
        var grid = map.routes
        this.draw()
        var x = this.position.x
        var y = this.position.y + 4
        let xc = ~~x
        let yc = ~~y
        let r = 0.5
        let v = this.velocity
        // console.log(this.turn)
        //collision detection
        if (grid[yc][xc] == 1) {
            grid[yc][xc] = 0
            score++;
            updateScore();
            checkWin();
        }
        //movement
        if (this.vertical) {
            if (laskey == 'z') {
                this.velocity.y = -this.speed
            }
            else if (laskey == 's') {
                this.velocity.y = this.speed
            }
            else if (laskey == 'd') {
                this.turn = 1
            }
            else if (laskey == 'q') {
                this.turn = -1
            }

            // this.position.x=xc
            if (Math.abs(y - yc) < 0.2) {// check for turn
                if (this.turn == 1 && grid[yc][xc + 1] >= 0) {// if wanna turn and can turn
                    this.vertical = false //change orientation
                    this.velocity.x = this.speed//stop current orientation speed
                    this.velocity.y = 0
                    this.turn = 0
                    laskey = 'd'
                }
                else if (this.turn == -1 && grid[yc][xc - 1] >= 0) {
                    this.vertical = false
                    this.velocity.x = -this.speed
                    this.velocity.y = 0
                    this.turn = 0
                    laskey = 'q'
                }
            }
            // if going to collide don't move anymore
            if (grid[~~(y + 0.7 + v.y)][xc] < 0 || grid[~~(y + v.y)][xc] < 0) {
                // this.velocity.x=0
                this.velocity.y = 0
                this.position.y = ~~this.position.y
                laskey = ''
            }
            this.position.y += this.velocity.y
        }


        else { //horizental
            if (laskey == 'q') {
                this.velocity.x = -this.speed
            }
            else if (laskey == 'd') {
                this.velocity.x = this.speed
            }
            else if (laskey == 'z') {
                this.turn = -1
            }
            else if (laskey == 's') {
                this.turn = 1
            }

            // this.position.y=yc
            // if going to collide stop

            if (Math.abs(x - xc) < 0.2) {
                if (this.turn == 1 && grid[yc + 1][xc] >= 0) {
                    this.vertical = true
                    this.velocity.y = this.speed
                    this.velocity.x = 0
                    this.turn = 0
                    laskey = 's'
                }
                else if (this.turn == -1 && grid[yc - 1][xc] >= 0) {
                    this.vertical = true
                    this.velocity.y = -this.speed
                    this.velocity.x = 0
                    this.turn = 0
                    laskey = 'z'
                }
            }

            if (grid[yc][~~(x + 0.5 + v.x)] < 0 || grid[yc][~~(x + v.x)] < 0) {//wall collision 
                this.velocity.x = 0
                this.velocity.y = 0
                this.position.x = ~~this.position.x
                laskey = ''
            }
            this.position.x += this.velocity.x
        }
        if (x < 0) {//tunnels
            this.position.x += 27
        }
        if (x > 27) {//tunnels
            this.position.x -= 27
        }
    }
}





class Ghost {
  constructor({ position, speed ,radius,player}) {
    this.position = position;
    this.speed = speed * tz / (10 * fps);
    this.velocity={x:0,y:0}
    this.target=player
    this.radius=radius
    this.color = "red";
    this.path = [];
    this.currentPathIndex = 0;
  }
  draw_rect(x,y,color="blue"){
    // Define the size and position of each square
    const squareSize = tz; // Assuming tz is the size of each square
    const squareX = w / 2 + tz * x + tz / 2; // Replace `x` with the actual x-coordinate of the square
    const squareY = tz * y + tz * 4 + tz / 2; // Replace `y` with the actual y-coordinate of the square

    // Set the color for the rectangle
    c.fillStyle = color; // Choose your desired color

    // Draw the rectangle on the square
    c.fillRect(squareX - squareSize / 2, squareY - squareSize / 2, squareSize, squareSize);
  }
  draw() {
    c.beginPath();
    let { x, y } = this.position;
    let ghostPos = { x: w / 2 + tz * x + tz / 2, y: tz * y + tz * 4 + tz / 2 };
    c.arc(ghostPos.x, ghostPos.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  findPath(grid, start, target) {
    // Helper function to calculate the heuristic (Manhattan distance)
    function calculateHeuristic(node, target) {
      return Math.abs(node.x - target.x) + Math.abs(node.y - target.y);
    }
  
    // Helper function to check if a node is in the open list
    function isInOpenList(node, openList) {
      return openList.hasOwnProperty(`${node.x},${node.y}`);
    }
  
    // Helper function to check if a node is in the closed list
    function isInClosedList(node, closedList) {
      return closedList.hasOwnProperty(`${node.x},${node.y}`);
    }
  
    // Create a priority queue to store nodes
    const openList = new PriorityQueue();
    const closedList = {};
    // Add the start node to the open list
    openList.enqueue(start, 0);
  
    // Create an object to store the path cost from the start node to each node
    const gScore = {};
    gScore[`${start.x},${start.y}`] = 0;
  
    // Create an object to store the estimated total cost for each node
    const fScore = {};
    fScore[`${start.x},${start.y}`] = calculateHeuristic(start, target);
  
    // Create an object to store the previous node in the optimal path
    const cameFrom = {};
  
    while (!openList.isEmpty()) {
      // Get the node with the lowest fScore from the open list
      const current = openList.dequeue();

      // Check if the current node is the target node
      if (current.x === target.x && current.y === target.y) {
        // Reconstruct the path from the start node to the target node
        const path = [];
        let currentNode = current;
        while (cameFrom.hasOwnProperty(`${currentNode.x},${currentNode.y}`)) {
          path.unshift(currentNode); 
          if (keys.p.pressed) this.draw_rect(currentNode.x,currentNode.y-4)
          currentNode = cameFrom[`${currentNode.x},${currentNode.y}`];
        }
        return path;
      }
  
      // Get the neighbors of the current node
      const neighbors = [
        { x: current.x - 1, y: current.y }, // Left
        { x: current.x + 1, y: current.y }, // Right
        { x: current.x, y: current.y - 1 }, // Up
        { x: current.x, y: current.y + 1 }, // Down
      ];
  
      for (const neighbor of neighbors) {
        // Skip if the neighbor is not a valid grid position or is a wall (-1)
        if (neighbor.x < 0) neighbor.x=27
        else if (neighbor.x > 27) neighbor.x=0
        if(
          neighbor.y < 0 ||
          neighbor.y >= grid.length ||
          grid[neighbor.y][neighbor.x] === -1
        ) {
          continue;
        }
  
        // Calculate the tentative gScore for the neighbor
        const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
  
        // Check if the neighbor is already in the closed list and has a lower gScore
        if (
          isInClosedList(neighbor, closedList) &&
          tentativeGScore >= gScore[`${neighbor.x},${neighbor.y}`]
        ) {
          continue;
        }
  
        // Check if the neighbor is not in the open list or has a lower gScore
        if (
          !isInOpenList(neighbor, openList) ||
          tentativeGScore < gScore[`${neighbor.x},${neighbor.y}`]
        ) {
          // Update the gScore and fScore for the neighbor
          gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
          fScore[`${neighbor.x},${neighbor.y}`] =
            tentativeGScore + calculateHeuristic(neighbor, target);
  
          // Set the previous node for the neighbor
          cameFrom[`${neighbor.x},${neighbor.y}`] = current;
  
          // Add the neighbor to the open list
          openList.enqueue(neighbor, fScore[`${neighbor.x},${neighbor.y}`]);
        }
      }
  
      // Add the current node to the closed list
      closedList[`${current.x},${current.y}`] = true;
    }
  
    // No path found
    return [];
  }

  update(map) {
    if (this.position.x < 1) this.position.x = 27;
    else if (this.position.x > 27) this.position.x = 1;
    var grid = map.routes;
    var x = this.position.x;
    var y = this.position.y + 4; // no need for 4 ?
    
    let xc= ~~x
    let yc= ~~y
    let pacman = {x:~~(this.target.position.x),y:~~(this.target.position.y+4)}
    
    let path = this.findPath(grid, {x:xc,y:yc}, pacman);
    if (keys.p.pressed && path.length>0) this.draw_rect(path[0].x,(path[0].y)-4,"red")
    
    let next=path[0]
    
    if (!next){
      gameover=true
      return gameover
    }
    
    if (next.y>y && ~~next.y!=~~y) this.position.y+=this.speed
    if (next.y<y && Math.abs(next.y - y)>0.1 ) this.position.y-=this.speed
    if (next.x>x && ~~next.x!=~~x) this.position.x+=this.speed
    if (next.x<x && Math.abs(next.x - x)>0.1) this.position.x-=this.speed
    // if (keys.p.pressed) this.draw_rect(currentNode.x,currentNode.y-4)
    //gotos adjacent square:
    //todo: ghost movement
    // if (this.path.length > 0) {
    //   var target = this.path[this.currentPathIndex];
    //   var dx = target.x - x;
    //   var dy = target.y - y;
    //   var angle = Math.atan2(dy, dx);
    //   var velocityX = Math.cos(angle) * this.speed;
    //   var velocityY = Math.sin(angle) * this.speed;

    //   this.position.x += velocityX;
    //   this.position.y += velocityY;

    //   if (Math.abs(this.position.x - target.x) < 0.1 && Math.abs(this.position.y - target.y) < 0.1) {
    //     this.currentPathIndex++;
    //     if (this.currentPathIndex >= this.path.length) {
    //       this.path = [];
    //       this.currentPathIndex = 0;
    //     }
    //   }
    // }

    this.draw();
  }
}


function init_map() {
    var map
    map = mapgen()
    tilesize = map.tileSize
    // map.getpathtiles()
    w = 28 * tilesize * 2
    h = 36 * tilesize
    // canvas.width = w
    // canvas.height = h
    totalPellets = 0;
    for (let row of map.routes) {
        for (let cell of row) {
            if (cell === 1) {
                totalPellets++;
            }
        }
    }
    return map;
}

// function to draw the map on screen
function draw_map(map, context) {
    map.drawmap(context, w / 2, 0)
    map.draw_pelets(context, w / 2, 0)
    if (show_grid) map.draw_grid(context, w / 2, 0);
}
// call init_map before starting the animation loop
var map = init_map();
var tz = map.tileSize
var coords = { x: 13, y: 22 } //init positon 11 , 22
// //offset: x=x+1 y=y+4
const player = new Player({
    position: coords, speed: 3, radius: map.tileSize / 2
})
const pinky = new Ghost({
    position: {x:1,y:0}, speed: 2, radius: map.tileSize / 2, player
})
function animate() {
    if (gameover ){
      return false 
    }
    if (keys.esc.pressed) {
      // Request animation frame to keep checking if animation should resume
      requestAnimationFrame(animate);
      return; // Exit the function without executing the animation logic
    }

    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);
    // requestAnimationFrame(animate);
    // clear the canvas at each frame
    c.clearRect(0, 0, canvas.width, canvas.height)
    
    // draw the map and update the player
    draw_map(map, c)
    player.update(map)
    pinky.update(map)
}

animate()




window.addEventListener('keydown', ({ key }) => {
    //code
    // console.log(key)
    switch (key) {
        case 'Escape':
            keys.esc.pressed= !keys.esc.pressed
        case 'z':
            keys.z.pressed = true
            keys.s.pressed = false
            laskey = "z"
            break
        case 'q':
            keys.q.pressed = true
            keys.d.pressed = false
            laskey = 'q'
            break
        case 's':
            keys.s.pressed = true
            keys.z.pressed = false
            laskey = 's'
            break
        case 'd':
            keys.d.pressed = true
            keys.q.pressed = false
            laskey = 'd'
            break
        case 'x':
            map.wallFillColor = randomColor();
            map.wallStrokeColor = rgbString(hslToRgb(Math.random(), Math.random(), Math.random() * 0.4 + 0.6));
            break
        case 'g':
            show_grid = !show_grid
            break
        case "p":
            keys.p.pressed=!keys.p.pressed
            break
    }
}
)


//todo: 
//pacman clip to rectangles -done
//ghost direction change and new path (shouldn't be able to 180 turn)