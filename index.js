const canvas=document.querySelector('canvas')
const c=canvas.getContext('2d')
canvas.width=innerWidth
canvas.height=innerHeight
var show_grid=false
const fps=60

const keys={
    z:{pressed: false},
    q:{pressed: false},
    d:{pressed: false},
    s:{pressed: false}
}
//ghost house coordinates: x: 11 - 16 y: 14 - 16
class Player{
    constructor({position,speed,radius}){
        this.position=position
        this.speed=speed*tz/(10*fps)
        this.velocity={x:0,y:0}
        this.radius=radius
        this.color="yellow"
        console.log(this.speed)
    }
    draw(){
        c.beginPath()
        let pacman_pos={x:w/2+tz*coords.x+tz/2,y:tz*coords.y+tz*4+tz/2}
        c.arc(pacman_pos.x,pacman_pos.y,this.radius,0,Math.PI*2)
        c.fillStyle=this.color
        c.fill()
        c.closePath()
    }
    update(map){
        var grid=map.routes
        this.draw()
        var x=this.position.x
        var y=this.position.y+4

        this.position.x+=this.velocity.x
        this.position.y+=this.velocity.y

        if (grid[y][x]==-1){//i'm stuck inside a wall ///maybe just reset my position
            this.color="red"
            setTimeout(null, 3000);
            this.position={x:13,y:22}
            this.velocity={x:0,y:0}
            this.color="yellow"
            //reset pos
        }
        else{   
            grid[y][x]=0 //i'm not inside a wall
            if (keys.q.pressed ){ //left && grid[y][x-1]>=0
                this.velocity.x= -this.speed
                // keys.q.pressed=false
            }
            if (keys.z.pressed && grid[y-1][x]>=0){//up
                this.velocity.y= -this.speed
                keys.z.pressed=false
            }
            if (keys.d.pressed && grid[y][x+1]>=0){//right
                // grid[y][x-1]=0
                this.velocity.x= this.speed
                keys.d.pressed=false
            }
            if (keys.s.pressed && grid[y+1][x]>=0){//down
                // grid[y][x-1]=0
                this.velocity.y= this.speed
                keys.s.pressed=false
            }
            if (keys.q.pressed && x==0){//tunnels
                this.position.x+=27
                keys.z.pressed=false
            }
            if (keys.d.pressed && x==27){//tunnels
                this.position.x-=27
                keys.z.pressed=false
            }
            // this.position.x+=this.veloocity.x
            // this.position.y+=this.veloocity.y
        }
    }
}

function init_map(){
    var map
    map=mapgen()    
    tilesize=map.tileSize
    // map.getpathtiles()
    w = 28*tilesize*2
    h = 36*tilesize
    // canvas.width = w
    // canvas.height = h
    return map;
}

// function to draw the map on screen
function draw_map(map, context){
    map.drawmap(context, w/2, 0)
    map.draw_pelets(context,w/2, 0)
    if (show_grid) map.draw_grid(context,w/2, 0);
}
// call init_map before starting the animation loop
var map = init_map();
var tz=map.tileSize
var coords={x:13,y:22} //init positon 11 , 22
// //offset: x=x+1 y=y+4
const player=new Player({
    position:coords,speed:1,radius: map.tileSize/2
})

function animate(){
    setTimeout(() => {
        requestAnimationFrame(animate);
      }, 1000 / fps);
    // requestAnimationFrame(animate);
    // clear the canvas at each frame
    c.clearRect(0,0,canvas.width,canvas.height)
    
    // draw the map and update the player
    draw_map(map, c)
    player.update(map)
}

animate()




window.addEventListener('keydown', ({key})=>{
    //code
    // console.log(key)
    switch(key){
        case 'z':
            keys.z.pressed=true
            keys.s.pressed=false
            break
        case 'q':
            keys.q.pressed=true
            keys.d.pressed=false
            break
        case 's':
            keys.s.pressed=true
            keys.z.pressed=false
            break
        case 'd':
            keys.d.pressed=true
            keys.q.pressed=false
            break
        case 'x':
            map.wallFillColor = randomColor();
            map.wallStrokeColor = rgbString(hslToRgb(Math.random(), Math.random(), Math.random() * 0.4 + 0.6));
            break
        case 'g':
            show_grid=!show_grid
            break
        case "p":
            let x=player.position.x
            let y=player.position.y+4 
            //actual map.route positions
            console.log(x, y , map.routes[y][x])
            break
    }   
}
)


//todo: pacman clip to rectangles