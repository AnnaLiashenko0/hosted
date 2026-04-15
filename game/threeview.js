function open3D(){

const container=document.getElementById("threeContainer")

container.innerHTML=""

const scene=new THREE.Scene()

const camera=new THREE.PerspectiveCamera(75,600/400,0.1,1000)

const renderer=new THREE.WebGLRenderer()

renderer.setSize(600,400)

container.appendChild(renderer.domElement)

const geometry=new THREE.CylinderGeometry(2,2,1,32)

const material=new THREE.MeshBasicMaterial({color:0xff9ecf})

const cake=new THREE.Mesh(geometry,material)

scene.add(cake)

camera.position.z=5

function animate(){

requestAnimationFrame(animate)

cake.rotation.y+=0.01

renderer.render(scene,camera)

}

animate()

}