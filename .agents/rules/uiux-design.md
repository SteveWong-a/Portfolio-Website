---
trigger: always_on
glob:
description: UI/UX Design and Animation Best Practices
---

# UI/UX Design and Animation Guidelines

When designing and implementing animations for this workspace, always adhere to the following best practices, particularly when using the Motion library (formerly Framer Motion):

## 1. Performance and Execution
- **Avoid Object Allocation**: Inside functions that run every animation frame (e.g., `requestAnimationFrame` callbacks, `onUpdate`), avoid object allocation. Prefer mutation where safe.
- **Loops**: Prefer `for` loops over `forEach` or `map` in high-frequency frame loops, unless the callback can be pre-allocated. Avoid `Object.entries` and `Object.values`.
- **`will-change` Usage**: When animating with CSS `transition` or Motion independent transforms (`x`, `y`, `scale`), set `will-change` on the animating properties so the browser promotes the element to its own compositor layer. Use sparingly and remove once the animation finishes. Unnecessary for CSS `animation` or Motion via `transform` (handled automatically).

## 2. Animating Transforms
- **Prefer `transform` for WAAPI**: Use `transform: "scale(2)"` instead of independent transforms (`scale: 2`) when possible, as these will run via the Web Animations API (WAAPI) for better performance.
- **When to use independent transforms**: 
  - Different transition settings for different transforms.
  - Passing transforms as motion values.
  - Competing/composable transforms (e.g., an element has a base `x` animation and a separate `scale` hover animation).

## 3. Design and Physics
- **Physics-based Springs**: Prefer physics-based springs for physical motion (like `x`, `y`, `rotate`), especially for animations that could be interrupted by the user.
- **Non-numerical Values**: For colors, opacities, or non-numerical values, use predictable settings like `type: "spring", bounce: 0.2, visualDuration: 0.4`.
- **Contextual Easing**: Choose easing curves based on the interface. Avoid overshoot in serious/professional contexts.

## 4. Vanilla JS Motion Implementation
- **Importing**: Always import from `motion`, never from `framer-motion`.
- **`animate` Syntax**: Use one of the three valid syntaxes:
  - `animate(motionValue, targetValue, options)`
  - `animate(originValue, targetValue, options)` (must add `onUpdate` to options)
  - `animate(objectOrElement, values, options)`
- **Canceling Animations**: Do not track the current animation in a variable to cancel it. Start a new animation on the same value (automatically cancels the previous) or use `value.stop()`.
- **Easing Syntax**: Define easing via the `ease` option using camelCase (`easeOut`, `easeInOut`), never kebab-case (`ease-out`).
