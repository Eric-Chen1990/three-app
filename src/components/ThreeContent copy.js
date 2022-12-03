import { useLayoutEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";

class DiceGame {
	constructor(container) {
		this.canvasContainer = container;

		this.isDiceCreated = false;

		this.boardWidth = 24;
		this.boardHeight = 24; // 40 meter
		this.borderWidth = 1;

		this.diceArr = [];
		this.boxes = [];
		this.diceSize = 0.9; // meters
		this.boxSize = (this.boardWidth / 10) * 0.6; // meters

		this.dragging = false;
		this.isDraggingAvailable = true;
		this.mouse = new THREE.Vector2();
		this.prevMouse = new THREE.Vector2();
		this.raycaster = new THREE.Raycaster();
		this.selectedBoxIndex = null;

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
		});

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor(0xdddddd, 1);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.canvasContainer.appendChild(this.renderer.domElement);

		this.fav = 40;
		this.camera = new THREE.PerspectiveCamera(this.fav, 1, 5, 100);
		this.camera.position.set(0, 0, 5);
		this.camera.lookAt(0, 0, 0);
		this.scene.add(this.camera);

		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.world = new CANNON.World();
		this.world.gravity.set(0, 0, -9.82 * 20);
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.solver.iterations = 20;

		this.diceBodyMaterial = new CANNON.Material();
		this.floorBodyMaterial = new CANNON.Material();

		this.world.addContactMaterial(
			new CANNON.ContactMaterial(
				this.floorBodyMaterial,
				this.diceBodyMaterial,
				{ friction: 0.01, restitution: 0.4 }
			)
		);

		this.world.addContactMaterial(
			new CANNON.ContactMaterial(this.diceBodyMaterial, this.diceBodyMaterial, {
				friction: 0.01,
				restitution: 0.4,
			})
		);

		this._loadResources(() => {
			this._createBoard();
			this._createBoxes();
			this._addLight();
			this._resize();

			window.addEventListener("resize", () => {
				this._resize();
			});

			this._animate();

			this.renderer.domElement.addEventListener(
				"pointerdown",
				this._onMouseDown.bind(this),
				false
			);
			this.renderer.domElement.addEventListener(
				"pointermove",
				this._onMouseMove.bind(this),
				false
			);
			this.renderer.domElement.addEventListener(
				"pointerup",
				this._onMouseUp.bind(this),
				false
			);
		});

		// this.cannonDebugger = new CannonDebugger(this.scene, this.world, {
		//     color: 0xff0000
		// });
	}

	_loadResources(callback) {
		let resourcesCount = 0;

		this.boxTexture = new THREE.TextureLoader().load("/img/cement.jpg", () => {
			resourcesCount++;

			if (resourcesCount === 3) {
				callback();
			}
		});

		this.boardTexture = new THREE.TextureLoader().load(
			"/img/wood-texture.jpg",
			() => {
				resourcesCount++;

				if (resourcesCount === 3) {
					callback();
				}
			}
		);

		const loader = new GLTFLoader();

		loader.load("./model/dice.glb", (gltf) => {
			this.diceGltf = gltf;

			resourcesCount++;

			if (resourcesCount === 3) {
				callback();
			}
		});
	}

	_getMouse(event) {
		let rect = event.target.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;

		this.mouse.x = (x / window.innerWidth) * 2 - 1;
		this.mouse.y = -(y / window.innerHeight) * 2 + 1;
	}

	_onMouseDown(event) {
		if (!this.isDraggingAvailable) {
			return;
		}

		this._getMouse(event);
		this.raycaster.setFromCamera(this.mouse, this.camera);

		let intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length === 0 || intersects[0].object.type !== "box") {
			this.selectedBoxIndex = null;
			return;
		}

		this.selectedBoxIndex = intersects[0].object.index;

		this.boxes[this.selectedBoxIndex].mesh.position.setZ(
			this.boxes[this.selectedBoxIndex].originalPos.z + 0.01
		);

		this.prevPoint = intersects[0].point;

		this.dragging = true;
	}

	_onMouseMove(event) {
		if (!this.dragging || this.selectedBoxIndex === null) {
			return;
		}

		this._getMouse(event);

		this.raycaster.setFromCamera(this.mouse, this.camera);

		let intersects = this.raycaster.intersectObject(this.invisiblePlane);

		if (intersects.length === 0) {
			return;
		}

		this.boxes[this.selectedBoxIndex].mesh.position.x +=
			intersects[0].point.x - this.prevPoint.x;
		this.boxes[this.selectedBoxIndex].mesh.position.y +=
			intersects[0].point.y - this.prevPoint.y;

		this.prevPoint = intersects[0].point;
	}

	_onMouseUp() {
		this.dragging = false;

		if (this.selectedBoxIndex !== null) {
			let box = this.boxes[this.selectedBoxIndex];
			this.selectedBoxIndex = null;

			if (
				box.mesh.position.x + this.boxSize / 2 >= this.boardWidth / 2 ||
				box.mesh.position.x - this.boxSize / 2 <= -this.boardWidth / 2 ||
				box.mesh.position.y + this.boxSize / 2 >= this.boardWidth / 2 ||
				box.mesh.position.y - this.boxSize / 2 <= -this.boardWidth / 2
			) {
				box.mesh.position.copy(box.originalPos);
				box.mesh.body.position.copy(box.originalPos);
				return;
			}

			box.mesh.position.setZ(box.originalPos.z);

			box.mesh.body.position.copy(box.mesh.position);
		}
	}

	_addLight() {
		let ambientLight = new THREE.AmbientLight("#707070", 1.3);
		this.scene.add(ambientLight);

		this.light = new THREE.SpotLight(0xefdfd5, 4.3);
		this.light.target.position.set(0, 0, 0);
		this.light.castShadow = true;
		this.light.shadow.camera.near = 1;
		this.light.shadow.camera.far = 100;
		this.light.shadow.mapSize.width = 2024;
		this.light.shadow.mapSize.height = 2024;
		this.scene.add(this.light);
	}

	_createBoxes() {
		let boxGeometry = new THREE.BoxGeometry(
			this.boxSize,
			this.boxSize,
			this.boxSize
		);
		let boxMaterial = new THREE.MeshStandardMaterial({
			map: this.boxTexture,
		});

		const boxSpacing = (this.boardWidth / 10) * 0.4;

		for (let i = 0; i < 10; i++) {
			let mesh = new THREE.Mesh(boxGeometry, boxMaterial);

			mesh.castShadow = true;

			mesh.position.set(
				this.boardWidth / 2 + this.borderWidth + this.boxSize,
				this.boardWidth / 2 - (this.boxSize + boxSpacing) * i,
				this.boxSize / 2
			);

			mesh.type = "box";
			mesh.index = i;

			mesh.body = new CANNON.Body({
				mass: 0,
				shape: new CANNON.Box(
					new CANNON.Vec3(this.boxSize / 2, this.boxSize / 2, this.boxSize / 2)
				),
				material: this.floorBodyMaterial,
			});

			mesh.body.position.copy(mesh.position);

			this.world.addBody(mesh.body);

			this.scene.add(mesh);

			this.boxes.push({
				mesh: mesh,
				originalPos: mesh.position.clone(),
			});
		}
	}

	_isThrowFinished() {
		if (!this.isDiceCreated) {
			return;
		}

		let threshold = 0.02;

		let finishCount = 0;

		this.diceArr.forEach((dice, i) => {
			let angularVelocity = dice.body.angularVelocity;
			let velocity = dice.body.velocity;

			if (
				Math.abs(angularVelocity.x) < threshold &&
				Math.abs(angularVelocity.y) < threshold &&
				Math.abs(angularVelocity.z) < threshold &&
				Math.abs(velocity.x) < threshold &&
				Math.abs(velocity.y) < threshold &&
				Math.abs(velocity.z) < threshold
			) {
				finishCount++;
			}
		});

		if (finishCount === 3) {
			return true;
		}

		return false;
	}

	_createDice() {
		this.diceGltf.scene.traverse((node) => {
			if (node.isMesh) {
				node.castShadow = true;
			}
		});

		let dice1 = this.diceGltf.scene.clone();
		let dice2 = this.diceGltf.scene.clone();
		let dice3 = this.diceGltf.scene.clone();

		dice1.position.set(1, 0, 1);
		dice2.position.set(1, 0, 1);
		dice3.position.set(1, 0, 1);

		dice1.scale.set(this.diceSize, this.diceSize, this.diceSize);
		dice2.scale.set(this.diceSize, this.diceSize, this.diceSize);
		dice3.scale.set(this.diceSize, this.diceSize, this.diceSize);

		let size = this.diceSize / 2;

		dice1.body = new CANNON.Body({
			mass: 1,
			shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
			material: this.diceBodyMaterial,
		});
		dice1.body.sleepSpeedLimit = 0.01;
		dice1.body.linearDamping = 0.1;
		dice1.body.angularDamping = 0.1;
		dice1.body.position.set(1, 0, 1);
		this.world.addBody(dice1.body);

		dice2.body = new CANNON.Body({
			mass: 1,
			shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
			material: this.diceBodyMaterial,
		});
		dice2.body.sleepSpeedLimit = 0.01;
		dice2.body.linearDamping = 0.1;
		dice2.body.angularDamping = 0.1;
		dice2.body.position.set(1, 0, 1);
		this.world.addBody(dice2.body);

		dice3.body = new CANNON.Body({
			mass: 1,
			shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
			material: this.diceBodyMaterial,
		});
		dice3.body.sleepSpeedLimit = 0.01;
		dice3.body.linearDamping = 0.1;
		dice3.body.angularDamping = 0.1;
		dice3.body.position.set(1, 0, 1);
		this.world.addBody(dice3.body);

		this.scene.add(dice1);
		this.scene.add(dice2);
		this.scene.add(dice3);

		this.diceArr.push(dice1, dice2, dice3);

		this.isDiceCreated = true;
	}

	_updateDiceMeshes() {
		if (!this.isDiceCreated) {
			return;
		}

		this.diceArr.forEach((dice, i) => {
			dice.position.copy(dice.body.position);
			dice.quaternion.copy(dice.body.quaternion);
		});
	}

	_createBoard() {
		//Invisible plane for raycasting
		let material = new THREE.MeshPhongMaterial();
		let geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
		this.invisiblePlane = new THREE.Mesh(geometry, material);
		this.invisiblePlane.visible = false;
		this.invisiblePlane.type = "invisible plane";
		this.scene.add(this.invisiblePlane);

		//Floor body
		this.floor = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Plane(),
			material: this.floorBodyMaterial,
		});
		this.floor.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), 0);
		this.world.addBody(this.floor);

		//Wall bodies
		this.topWall = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Box(
				new CANNON.Vec3(this.boardWidth / 2, (this.boardWidth / 2) * 0.8, 1)
			),
			material: this.floorBodyMaterial,
		});
		this.topWall.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			Math.PI / 2
		);
		this.world.addBody(this.topWall);

		this.bottomWall = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Box(
				new CANNON.Vec3(this.boardWidth / 2, (this.boardWidth / 2) * 0.8, 1)
			),
			material: this.floorBodyMaterial,
		});
		this.bottomWall.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		);
		this.world.addBody(this.bottomWall);

		this.leftWall = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Box(
				new CANNON.Vec3(this.boardWidth / 2, 1, (this.boardWidth / 2) * 0.8)
			),
			material: this.floorBodyMaterial,
		});
		this.leftWall.quaternion.setFromAxisAngle(
			new CANNON.Vec3(0, 0, 1),
			Math.PI / 2
		);
		this.world.addBody(this.leftWall);

		this.rightWall = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Box(
				new CANNON.Vec3(this.boardWidth / 2, 1, (this.boardWidth / 2) * 0.8)
			),
			material: this.floorBodyMaterial,
		});
		this.rightWall.quaternion.setFromAxisAngle(
			new CANNON.Vec3(0, 0, 1),
			-Math.PI / 2
		);
		this.world.addBody(this.rightWall);

		this.topWall.position.set(0, this.boardHeight / 2 + 1, 0);
		this.bottomWall.position.set(0, -this.boardHeight / 2 - 1, 0);
		this.leftWall.position.set(-this.boardWidth / 2 - 1, 0, 0);
		this.rightWall.position.set(this.boardWidth / 2 + 1, 0, 0);

		//Floor mesh
		let boardMaterial = new THREE.MeshStandardMaterial({
			map: this.boardTexture,
		});

		let boardGeometry = new THREE.PlaneGeometry(
			this.boardWidth,
			this.boardWidth,
			1,
			1
		);

		this.board = new THREE.Mesh(boardGeometry, boardMaterial);
		this.board.receiveShadow = true;
		this.scene.add(this.board);

		let leftBorderGeometry = new THREE.BoxGeometry(
			this.borderWidth,
			this.borderWidth,
			this.boardWidth + 2 * this.borderWidth
		);
		this.leftBorder = new THREE.Mesh(leftBorderGeometry, boardMaterial);
		this.leftBorder.rotation.x = Math.PI / 2;
		this.leftBorder.position.x = -(this.boardWidth + this.borderWidth) / 2;
		this.leftBorder.receiveShadow = true;
		this.scene.add(this.leftBorder);

		let rightBorderGeometry = new THREE.BoxGeometry(
			this.borderWidth,
			this.borderWidth,
			this.boardWidth + 2 * this.borderWidth
		);
		this.rightBorder = new THREE.Mesh(rightBorderGeometry, boardMaterial);
		this.rightBorder.rotation.x = Math.PI / 2;
		this.rightBorder.position.x = (this.boardWidth + this.borderWidth) / 2;
		this.rightBorder.receiveShadow = true;
		this.scene.add(this.rightBorder);

		let topBorderGeometry = new THREE.BoxGeometry(
			this.borderWidth,
			this.borderWidth,
			this.boardWidth
		);
		this.topBorder = new THREE.Mesh(topBorderGeometry, boardMaterial);
		this.topBorder.rotation.y = Math.PI / 2;
		this.topBorder.position.y = (this.boardWidth + this.borderWidth) / 2;
		this.topBorder.receiveShadow = true;
		this.scene.add(this.topBorder);

		let bottomBorderGeometry = new THREE.BoxGeometry(
			this.borderWidth,
			this.borderWidth,
			this.boardWidth
		);
		this.bottomBorder = new THREE.Mesh(bottomBorderGeometry, boardMaterial);
		this.bottomBorder.rotation.y = Math.PI / 2;
		this.bottomBorder.position.y = -(this.boardWidth + this.borderWidth) / 2;
		this.bottomBorder.receiveShadow = true;
		this.scene.add(this.bottomBorder);
	}

	_resize() {
		this.canvasWidth = this.canvasContainer.clientWidth;
		this.canvasHeight = this.canvasContainer.clientHeight;

		this.renderer.setSize(this.canvasWidth, this.canvasHeight);

		let cameraZ =
			(this.boardHeight * 1.1 + 2 * this.borderWidth) /
			2 /
			Math.tan((this.fav * Math.PI) / 180 / 2);
		this.camera.position.set(0, 0, cameraZ);

		this.camera.aspect = this.canvasWidth / this.canvasHeight;
		this.camera.updateProjectionMatrix();

		this.light.position.x = -this.boardWidth / 3;
		this.light.position.y = this.boardWidth * 3;
		this.light.position.z = this.boardWidth * 3;
		this.light.distance = this.boardWidth * 5;

		this.renderer.render(this.scene, this.camera);
	}

	_animate() {
		requestAnimationFrame(this._animate.bind(this));

		this.world.fixedStep();

		this._updateDiceMeshes();
		// this.cannonDebugger.update();

		this.renderer.render(this.scene, this.camera);
	}

	_calcDiceResult() {
		let indexToResult = {
			1: [0, 2, 1, 2, 3, 1],
			3: [4, 6, 5, 6, 7, 5],
			2: [8, 9, 10, 10, 9, 11],
			4: [12, 13, 14, 14, 13, 15],
			5: [16, 17, 18, 18, 17, 19],
			6: [20, 21, 22, 22, 21, 23],
		};

		let tempMesh = new THREE.Mesh(
			new THREE.BoxGeometry(this.diceSize, this.diceSize, this.diceSize),
			new THREE.MeshPhongMaterial()
		);

		let result = [];

		this.diceArr.forEach((dice, i) => {
			tempMesh.position.copy(dice.body.position);
			tempMesh.quaternion.copy(dice.body.quaternion);

			let vector = new THREE.Vector3(0, 0, 1);
			let closestIndex;
			let closestAngle = Math.PI * 2;

			let normals = tempMesh.geometry.getAttribute("normal").array;

			let length = normals.length;
			let normal = new THREE.Vector3();

			for (let i = 0; i < length; i += 3) {
				let index = i / 3;

				normal.set(normals[i], normals[i + 1], normals[i + 2]);

				let angle = normal
					.clone()
					.applyQuaternion(dice.body.quaternion)
					.angleTo(vector);

				if (angle < closestAngle) {
					closestAngle = angle;
					closestIndex = index;
				}
			}

			for (let number in indexToResult) {
				if (indexToResult[number].indexOf(closestIndex) !== -1) {
					result.push(number);
					break;
				}
			}
		});

		return result;
	}

	freezeBoard() {
		this.isDraggingAvailable = false;
	}

	throwDice(x, y, velocity, callback) {
		if (this.isDiceCreated && !this._isThrowFinished()) {
			return false;
		}

		if (!this.isDiceCreated) {
			this._createDice();
		}

		let boardX = (this.boardWidth / 2) * x * 0.95;
		let boardY = (this.boardWidth / 2) * y * 0.95;

		this.diceArr.forEach((dice, i) => {
			let pos = new CANNON.Vec3(boardX, boardY, this.boardWidth * 0.45);

			if (i === 0) {
				pos.z += this.diceSize * 1.1;
			}

			if (i === 1) {
				pos.x -= this.diceSize * 1.2;
				pos.z -= this.diceSize * 0.3;
			}

			if (i === 2) {
				pos.y += this.diceSize * 1.1;
				pos.z += this.diceSize * 0.4;
			}
			console.log(pos);
			dice.body.position.copy(pos);

			let velocityVector = new CANNON.Vec3(pos.x, pos.y, 0);

			velocityVector = velocityVector.scale(-1);
			velocityVector.normalize();
			velocityVector = velocityVector.scale(velocity * 10);

			// dice.body.quaternion = new CANNON.Quaternion(
			// 	(45 * Math.PI) / 180,
			// 	0,
			// 	(70 * Math.PI) / 180,
			// 	1
			// );

			dice.body.velocity.copy(velocityVector);
			dice.body.angularVelocity.set(0, 0, 0);
			// dice.body.angularVelocity.set(20 * Math.random() -10, 20 * Math.random() -10, 20 * Math.random() -10);
		});

		// this._updateDiceMeshes();

		// let self = this;

		// let check = function () {
		// 	if (self._isThrowFinished()) {
		// 		self.world.removeEventListener("postStep", check);

		// 		let result = self._calcDiceResult();
		// 		callback(result);
		// 	}
		// };

		// this.world.addEventListener("postStep", check);
	}
}

const ThreeContent = () => {
	useLayoutEffect(() => {
		let diceGame = new DiceGame(document.getElementById("container"));
		document.getElementById("throw-btn").addEventListener("click", () => {
			let x = -1;
			let y = -1;
			let velocity = 4;

			document.getElementById("result").style.display = "none";

			diceGame.throwDice(x, y, velocity, (result) => {
				const sum = result.reduce(
					(previousValue, currentValue) =>
						parseInt(previousValue) + parseInt(currentValue),
					0
				);

				document.getElementById("result").style.display = "flex";
				document.getElementById("result-value").innerText =
					result.join(" + ") + " = " + sum;
			});
		});

		document.getElementById("freeze-btn").addEventListener("click", () => {
			diceGame.freezeBoard();
		});
	}, []);

	return null;
};

export default ThreeContent;
