const config = {

type: Phaser.AUTO,
width: 600,
height: 400,
parent: "game",

scene: {

preload: preload,
create: create

}

}

let cakeParts=[]
let gameCanvas

new Phaser.Game(config)

function preload(){

this.load.image("base","assets/base.png")
this.load.image("cream","assets/cream.png")
this.load.image("strawberry","assets/strawberry.png")
this.load.image("sprinkle","assets/sprinkle.png")

}

function create(){

gameCanvas=this.sys.game.canvas

this.add.image(300,320,"base")

createItem(this,"cream",80,100)
createItem(this,"strawberry",80,200)
createItem(this,"sprinkle",80,300)

}

function createItem(scene,key,x,y){

let item=scene.add.image(x,y,key).setInteractive()

scene.input.setDraggable(item)

scene.input.on("drag",(pointer,obj,dragX,dragY)=>{

obj.x=dragX
obj.y=dragY

})

scene.input.on("dragend",(pointer,obj)=>{

if(obj.x>200){

cakeParts.push(obj.texture.key)

if(obj.texture.key==="sprinkle") sprinkleAnimation(scene,obj.x,obj.y)

if(obj.texture.key==="cream") creamAnimation(scene,obj.x,obj.y)

}

})

}

function sprinkleAnimation(scene,x,y){

for(let i=0;i<15;i++){

let s=scene.add.image(x,y,"sprinkle")

scene.tweens.add({

targets:s,
y:y+60,
x:x+Phaser.Math.Between(-30,30),
duration:600

})

}

}

function creamAnimation(scene,x,y){

let c=scene.add.image(x,y,"cream")

scene.tweens.add({

targets:c,
scaleY:1.5,
duration:500

})

}

function saveCake(){

let canvas=gameCanvas

let preview=document.getElementById("previewCanvas")

let ctx=preview.getContext("2d")

ctx.drawImage(canvas,0,0)

}

function orderCake(){

fetch("http://localhost:3000/order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

cake:cakeParts

})

})

alert("Замовлення відправлено пекарям!")

}