import { useContactMaterial } from "@react-three/cannon";
const diceBodyMaterial = "dice";
const floorBodyMaterial = "floor";
function BodyMaterial() {
	useContactMaterial(floorBodyMaterial, diceBodyMaterial, {
		friction: 0.01,
		restitution: 0.4,
	});
	useContactMaterial(diceBodyMaterial, diceBodyMaterial, {
		friction: 0.01,
		restitution: 0.4,
	});
	return null;
}
export { diceBodyMaterial, floorBodyMaterial, BodyMaterial };
