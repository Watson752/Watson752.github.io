// Shared between intro-gate.tsx and painting-scene.tsx. Deliberately its own
// file with no three.js import — intro-gate.tsx is not itself dynamically
// imported past IntroGateLoader, so pulling this constant in from
// painting-scene.tsx directly would drag the `three` dependency into
// intro-gate's chunk and defeat the point of lazily loading PaintingScene.
export const FALL_DURATION_MS = 1350;
