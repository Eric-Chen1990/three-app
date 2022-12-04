import React, { useState } from "react";
import { useTexture } from "@react-three/drei";
import { boxSize } from "../untils/constant";
import { useBox } from "@react-three/cannon";
import { floorBodyMaterial } from "../untils/bodyMaterial";
import { useBoxStore } from "../store";

const Box = (props) => {
	const setPressed = useBoxStore((state) => state.setPressed);
	const inBoard = useBoxStore((state) => state.inBoard);
	const boxTexture = useTexture("./img/cement.jpg");
	const [ref, api] = useBox(() => ({
		type: "Static",
		args: [[boxSize, boxSize, boxSize]],
		material: floorBodyMaterial,
		allowSleep: false,
		...props,
	}));

	const handleDown = (e) => {
		setPressed(api);
	};
	const handleUp = (e) => {
		setPressed(null);
		!inBoard && api.position.set(...props.position);
	};

	return (
		<mesh
			ref={ref}
			castShadow
			onPointerDown={handleDown}
			onPointerUp={handleUp}
		>
			<boxGeometry args={[boxSize, boxSize, boxSize]} />
			<meshStandardMaterial map={boxTexture} />
		</mesh>
	);
};

export default Box;
