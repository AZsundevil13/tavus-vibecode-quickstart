import { atom } from "jotai";

export type Screen =
  | "intro"
  | "conversation"
  | "finalScreen";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "intro",
};

export const screenAtom = atom<ScreenState>(initialScreenState);