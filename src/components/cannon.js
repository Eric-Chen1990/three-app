import * as CANNON from "cannon-es";

export const initPhysicsWorld = () => {
	const world = new CANNON.World();
	world.gravity.set(0, 0, -9.82 * 20);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 20;

	const diceBodyMaterial = new CANNON.Material();
	const floorBodyMaterial = new CANNON.Material();

	world.addContactMaterial(
		new CANNON.ContactMaterial(floorBodyMaterial, diceBodyMaterial, {
			friction: 0.01,
			restitution: 0.4,
		})
	);

	world.addContactMaterial(
		new CANNON.ContactMaterial(diceBodyMaterial, diceBodyMaterial, {
			friction: 0.01,
			restitution: 0.4,
		})
	);
};
