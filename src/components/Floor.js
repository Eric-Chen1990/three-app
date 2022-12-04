import { usePlane } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React from "react";
import { boardWidth } from "../untils/constant";
import { floorBodyMaterial } from "../untils/bodyMaterial";
import { useBoxStore } from "../store";

const Floor = () => {
	const setInBoard = useBoxStore((state) => state.setInBoard);
	const boardTexture = useTexture("./img/wood-texture.jpg");
	const [ref, api] = usePlane(() => ({
		type: "Static",
		material: floorBodyMaterial,
	}));
	const handleEnter = () => {
		setInBoard(true);
	};
	const handleOut = () => {
		setInBoard(false);
	};
	return (
		<mesh
			ref={ref}
			receiveShadow
			onPointerEnter={handleEnter}
			onPointerOut={handleOut}
		>
			<planeGeometry args={[boardWidth, boardWidth, 1, 1]} />
			<meshStandardMaterial map={boardTexture} />
		</mesh>
	);
};

export default Floor;
