# react-haptic

**Lightweight** | **Cross-Platform** | **iOS-Like Haptics**

A lightweight React Hook that _mimics_ iOS-style haptic feedback. On devices supporting the [Vibrate API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate), it directly triggers vibration. On iOS devices—where `navigator.vibrate` is generally unavailable—it leverages a hidden switch trick to produce **Taptic-like** feedback, _similar_ to native iOS haptic interactions.

## Install

Use your favorite package manager to install:

```bash
# npm
npm install react-haptic

# yarn
yarn add react-haptic

# pnpm
pnpm add react-haptic
```

## Usage

```jsx
import React from "react";
import { useHaptic } from "react-haptic";

const ExampleComponent = () => {
  const { vibrate } = useHaptic();

  const handleClick = () => {
    vibrate(); // Trigger haptic feedback
  };

  return <button onClick={handleClick}>Click for Haptic</button>;
};

export default ExampleComponent;
```

## How It Works

1. **iOS devices**
   Falls back to clicking a hidden switch element, which can trigger Taptic feedback in many iOS browsers.

2. **Non-iOS devices**
   If `navigator.vibrate` is available, the device vibrates for the specified duration (default: 100ms).

> **Note**
> iOS 16+ provides an experimental “Haptics API” behind a Safari flag. Until it's widely enabled, this library uses the hidden switch trick as a workaround.

## API

### `useHaptic(options?: UseHapticOptions)`

| Name                     | Type               | Default | Description                                                                        |
| ------------------------ | ------------------ | ------- | ---------------------------------------------------------------------------------- |
| `options`                | `UseHapticOptions` | -       | Optional configuration object.                                                     |
| `options.hapticDuration` | `number`           | `100`   | The duration (in milliseconds) for the vibration, if the Vibrate API is supported. |

#### Return Value

| Name      | Type         | Description                                                                   |
| --------- | ------------ | ----------------------------------------------------------------------------- |
| `vibrate` | `() => void` | A function that triggers haptic feedback (vibration or Taptic-like feedback). |

## License

[MIT](./LICENSE)
