import React from "react";
import { useGLTF, Clone } from "@react-three/drei";
import { diceSize } from "../untils/constant";

const Dice = React.forwardRef((props, ref) => {
	const { scene } = useGLTF("./model/dice.glb");
	scene.traverse((node) => {
		if (node.isMesh) {
			node.castShadow = true;
		}
	});
	return (
		<Clone
			ref={ref}
			scale={[diceSize, diceSize, diceSize]}
			{...props}
			object={scene}
		/>
	);
});

export default Dice;
