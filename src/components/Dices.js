import { useBox } from "@react-three/cannon";
import React, { useEffect, useRef } from "react";
import { useAppStore } from "../store";
import Dice from "./Dice";
import { boardWidth, diceSize } from "../untils/constant";
import * as CANNON from "cannon-es";
import { diceBodyMaterial } from "../untils/bodyMaterial";
import * as THREE from "three";
let finishCount = 0;
const diceArr = [];
const Dices = () => {
	const isThrow = useAppStore((state) => state.isThrow);
	const reset = useAppStore((state) => state.reset);
	const settings = {
		mass: 1,
		type: "Dynamic",
		material: diceBodyMaterial,
		position: [100, 100, 1],
		sleepTimeLimit: 0.01,
		linearDamping: 0.1,
		angularDamping: 0.1,
		args: [diceSize, diceSize, diceSize],
	};
	const [dice1, api1] = useBox(() => ({ ...settings }));
	const [dice2, api2] = useBox(() => ({ ...settings }));
	const [dice3, api3] = useBox(() => ({ ...settings }));

	useEffect(() => {
		if (isThrow) {
			throwDice(-1, -1, 4);
			reset();
		}
	}, [isThrow]);

	const throwDice = (x, y, velocity) => {
		finishCount = 0;
		document.getElementById("result").style.display = "none";
		let boardX = (boardWidth / 2) * x * 0.95;
		let boardY = (boardWidth / 2) * y * 0.95;

		changeDice(velocity, boardX, boardY, 0);
		changeDice(velocity, boardX, boardY, 1);
		changeDice(velocity, boardX, boardY, 2);
	};

	const changeDice = (velocity, boardX, boardY, i) => {
		let api;
		let pos = new CANNON.Vec3(boardX, boardY, boardWidth * 0.45);

		if (i === 0) {
			pos.z += diceSize * 1.1;
			api = api1;
		}

		if (i === 1) {
			pos.x -= diceSize * 1.2;
			pos.z -= diceSize * 1.3;
			api = api2;
		}

		if (i === 2) {
			pos.y += diceSize * 1.1;
			pos.z += diceSize * 0.4;
			api = api3;
		}

		let velocityVector = new CANNON.Vec3(pos.x, pos.y, 0);

		velocityVector = velocityVector.scale(-1);
		velocityVector.normalize();
		velocityVector = velocityVector.scale(velocity * 10);

		if (api) {
			api.wakeUp();
			api.position.copy(pos);
			api.quaternion.set((45 * Math.PI) / 180, 0, (70 * Math.PI) / 180, 1);

			api.velocity.copy(velocityVector);
			api.angularVelocity.set(0, 0, 0);

			const unsub_velocity = api.velocity.subscribe((v) => {
				if (v[0] === 0 && v[1] === 0 && v[2] === 0) {
					diceArr[i] = {};
					finishCount++;
					if (finishCount === 3) {
						setTimeout(() => {
							calcDiceResult();
						}, 100);
					}
					unsub_velocity();
				}
			});
			const unsub_position = api.position.subscribe((v) => {
				if (finishCount === 3 && diceArr[i]) {
					diceArr[i].position = v;
					unsub_position();
				}
			});
			const unsub_quaternion = api.quaternion.subscribe((v) => {
				if (finishCount === 3 && diceArr[i]) {
					diceArr[i].quaternion = v;
					unsub_quaternion();
				}
			});
		}
	};

	const calcDiceResult = () => {
		let indexToResult = {
			1: [0, 2, 1, 2, 3, 1],
			3: [4, 6, 5, 6, 7, 5],
			2: [8, 9, 10, 10, 9, 11],
			4: [12, 13, 14, 14, 13, 15],
			5: [16, 17, 18, 18, 17, 19],
			6: [20, 21, 22, 22, 21, 23],
		};

		let tempMesh = new THREE.Mesh(
			new THREE.BoxGeometry(diceSize, diceSize, diceSize),
			new THREE.MeshPhongMaterial()
		);

		let result = [];

		diceArr.forEach((dice, i) => {
			tempMesh.position.set(...dice.position);
			tempMesh.quaternion.set(...dice.quaternion);
			// console.log(dice.quaternion);
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
					.set(...dice.quaternion)
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
		// console.log(result);
		const sum = result.reduce(
			(previousValue, currentValue) =>
				parseInt(previousValue) + parseInt(currentValue),
			0
		);

		document.getElementById("result").style.display = "flex";
		document.getElementById("result-value").innerText =
			result.join(" + ") + " = " + sum;
	};

	return (
		<>
			<Dice ref={dice1} />
			<Dice ref={dice2} />
			<Dice ref={dice3} />
		</>
	);
};

export default Dices;
