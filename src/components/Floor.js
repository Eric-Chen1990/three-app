import { usePlane } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React from "react";
import { boardWidth } from "../untils/constant";

const Floor = () => {
	const boardTexture = useTexture("./img/wood-texture.jpg");
	const [ref, api] = usePlane(() => ({ type: "Static" }));
	return (
		<mesh ref={ref} receiveShadow>
			<planeGeometry args={[boardWidth, boardWidth, 1, 1]} />
			<meshStandardMaterial map={boardTexture} />
		</mesh>
	);
};

export default Floor;
