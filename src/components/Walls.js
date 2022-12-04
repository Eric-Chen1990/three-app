import { useBox } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React from "react";
import { boardWidth, borderWidth } from "../untils/constant";

const Walls = () => {
    const argsX = [boardWidth + borderWidth * 2, borderWidth, borderWidth * 4];
		const argsY = [boardWidth, borderWidth, borderWidth * 4];
		const boardTexture = useTexture("./img/wood-texture.jpg");
		const [topRef, api1] = useBox(() => ({
			type: "Static",
			args: argsY,
			position: [0, boardWidth / 2 + borderWidth / 2, 0],
		}));
		const [bottomRef, api2] = useBox(() => ({
			type: "Static",
			args: argsY,
			position: [0, -(boardWidth / 2 + borderWidth / 2), 0],
		}));
		const [leftRef, api3] = useBox(() => ({
			type: "Static",
			args: argsX,
			position: [-(boardWidth / 2 + borderWidth / 2), 0, 0],
			rotation: [0, 0, Math.PI / 2],
		}));
		const [rightRef, api4] = useBox(() => ({
			type: "Static",
			args: argsX,

			position: [boardWidth / 2 + borderWidth / 2, 0, 0],
			rotation: [0, 0, -Math.PI / 2],
		}));
		return (
			<>
				<mesh ref={topRef} receiveShadow>
					<boxGeometry args={argsY} />
					<meshStandardMaterial map={boardTexture} />
				</mesh>
				<mesh ref={bottomRef} receiveShadow>
					<boxGeometry args={argsY} />
					<meshStandardMaterial map={boardTexture} />
				</mesh>
				<mesh ref={leftRef} receiveShadow>
					<boxGeometry args={argsX} />
					<meshStandardMaterial map={boardTexture} />
				</mesh>
				<mesh ref={rightRef} receiveShadow>
					<boxGeometry args={argsX} />
					<meshStandardMaterial map={boardTexture} />
				</mesh>
			</>
		);
};

export default Walls;
