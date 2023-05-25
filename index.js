const canvas=document.querySelector('canvas')
const c=canvas.getContext('2d')
canvas.width=innerWidth
canvas.height=innerHeight
var show_grid=false
const fps=30

function beep(){
    var audio = new Audio('sound.wav');
    audio.play();
}

const keys={
    z:{pressed: false},
    q:{pressed: false},
    d:{pressed: false},
    s:{pressed: false},
}
let laskey=''
//ghost house coordinates: x: 11 - 16 y: 14 - 16
class Player{
    constructor({position,speed,radius}){
        this.position=position
        this.speed=speed*tz/(10*fps)
        this.velocity={x:0,y:0}
        this.radius=radius
        this.color="yellow"
        console.log(this.radius)
    }
    draw(){
        c.beginPath()
        let pacman_pos={x:w/2+tz*this.position.x+tz/2,y:tz*this.position.y+tz*4+tz/2}
        c.arc(pacman_pos.x,pacman_pos.y,this.radius,0,Math.PI*2)
        c.fillStyle=this.color
        c.fill()
        c.closePath()
    }
    update(map){
        var grid=map.routes
        this.draw()
        var can_turn_y=true
        var can_turn_x=true
        var x=this.position.x
        var y=this.position.y+4
        let xc=~~x
        let yc=~~y
        let r=0.5
        let v=this.velocity
        //collision detection ?
 
        if (grid[yc][(~~(x+v.x))]<0){ //left
            can_turn_x=false
            // this.velocity.x=0
            // keys.q.pressed=false
            this.color="orange"
        }
        if (grid[yc][~~(x+r+v.x)]<0){ //left
            // this.velocity.x=0
            can_turn_x=false
            // keys.q.pressed=false
            this.color="orange"
        }
        if (grid[~~(y+v.y)][xc]<0){//up
            this.color="orange"
            can_turn_y=false
            // this.velocity.y= 0
        }
        if (grid[~~(y+r+v.y)][xc]<0){//up
            this.color="orange"
            // this.velocity.y= 0
            can_turn_y=false
        }
        if (can_turn_x){this.position.x+=this.velocity.x
        }
        if (can_turn_y){this.position.y+=this.velocity.y}
        if ((~~this.position.x)!=xc){
            this.velocity.y=0
        }
        if ((~~this.position.y+4)!=yc){
            this.velocity.x=0
        }
        if (grid[yc][xc]==-1){//i'm stuck inside a wall ///maybe just reset my position
            this.color="red"
            this.velocity={x:0,y:0}
            //reset pos
        }
        else{   
            this.color="yellow"
            grid[yc][xc]=0 //i'm not inside a wall
            if (keys.q.pressed && laskey=='q'){ //left && grid[y][x-1]>=0
                this.velocity.x= -this.speed
                // this.velocity.y=0
                keys.q.pressed=false
            }
            else if (keys.z.pressed && laskey=='z'){//up && grid[y-1][x]>=0
                this.velocity.y= -this.speed
                // this.velocity.x=0
                keys.z.pressed=false
            }
            else if (keys.d.pressed && laskey=='d'){//right && grid[y][x+1]>=0
                // grid[y][x-1]=0
                this.velocity.x= this.speed
                // this.velocity.y=0
                keys.d.pressed=false
            }
            else if (keys.s.pressed && laskey=='s'){//down && grid[y+1][x]>=0
                // grid[y][x-1]=0
                this.velocity.y= this.speed
                // this.velocity.x=0
                keys.s.pressed=false
            }
            if (x<0){//tunnels
                this.position.x+=27
            }
            if (x>27){//tunnels
                this.position.x-=27
            }

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
    position:coords,speed:3,radius: map.tileSize/2
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
            laskey="z"
            break
        case 'q':
            keys.q.pressed=true
            keys.d.pressed=false
            laskey='q'
            break
        case 's':
            keys.s.pressed=true
            keys.z.pressed=false
            laskey='s'
            break
        case 'd':
            keys.d.pressed=true
            keys.q.pressed=false
            laskey='d'
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