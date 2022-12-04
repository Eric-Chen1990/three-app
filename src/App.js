import "./App.css";
import ThreeContent from "./components/ThreeContent";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useAppStore } from "./store";
import ThreeContent1 from "./components/ThreeContent copy";

function App() {
	const Throw = useAppStore((state) => state.Throw);
	const Freeze = useAppStore((state) => state.Freeze);

	return (
		<div className="App">
			<div id="container">
				<Canvas
					shadows
					camera={{ fov: 40, near: 5, far: 100, position: [0, 0, 5] }}
				>
					<axesHelper />
					<Suspense fallback={null}>
						<ThreeContent />
					</Suspense>
				</Canvas>
				{/* <ThreeContent1 /> */}
				<button className="btn" id="throw-btn" onClick={Throw}>
					Throw dice
				</button>
				<button className="btn" id="freeze-btn" onClick={Freeze}>
					Freeze board
				</button>

				<div id="result">
					<span id="result-value"></span>
				</div>
			</div>
		</div>
	);
}

export default App;
