import create from "zustand";
export const useAppStore = create((set) => ({
	isThrow: false,
	Throw: () => set((state) => ({ isThrow: true })),
	isFreeze: false,
	Freeze: () => set((state) => ({ isFreeze: true })),
	reset: () => set((state) => ({ isThrow: false, isFreeze: false })),
}));

export const useBoxStore = create((set) => ({
	inBoard: false,
	pressed: null,
	setPressed: (v) => set((state) => ({ pressed: v })),
	setInBoard: (v) => set((state) => ({ inBoard: v })),
}));
