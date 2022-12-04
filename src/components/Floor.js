import { usePlane } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React from "react";
import { boardWidth } from "../untils/constant";
import { floorBodyMaterial } from "../untils/bodyMaterial";

const Floor = () => {
	const boardTexture = useTexture("./img/wood-texture.jpg");
	const [ref, api] = usePlane(() => ({
		type: "Static",
		material: floorBodyMaterial,
	}));
	return (
		<mesh ref={ref} receiveShadow>
			<planeGeometry args={[boardWidth, boardWidth, 1, 1]} />
			<meshStandardMaterial map={boardTexture} />
		</mesh>
	);
};

export default Floor;
