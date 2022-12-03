import { useBox } from "@react-three/cannon";
import React, { useEffect } from "react";
import { useAppStore } from "../store";
import Dice from "./Dice";
import { boardWidth, diceSize } from "../untils/constant";
import * as CANNON from "cannon-es";

const Dices = () => {
	const isThrow = useAppStore((state) => state.isThrow);
	const reset = useAppStore((state) => state.reset);
	const settings = {
		mass: 1,
		position: [0, 0, 1],
		sleepTimeLimit: 0.01,
		linearDamping: 0.1,
		angularDamping: 0.1,
	};
	const [dice1, api1] = useBox(() => ({ ...settings }));
	const [dice2, api2] = useBox(() => ({ ...settings }));
	const [dice3, api3] = useBox(() => ({ ...settings }));

	useEffect(() => {
		if (isThrow) {
			console.log(isThrow);
			throwDice(-1, -1, 4);
			reset();
		}
	}, [isThrow]);

	const throwDice = (x, y, velocity) => {
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
			pos.z -= diceSize * 0.3;
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
			api.position.copy(pos);
			api.quaternion = new CANNON.Quaternion(
				(45 * Math.PI) / 180,
				0,
				(70 * Math.PI) / 180,
				1
			);

			api.velocity.copy(velocityVector);
			api.angularVelocity.set(0, 0, 0);
		}
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
