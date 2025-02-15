import { useCallback, useEffect, useRef } from "react";

/**
 * Configuration options for the `useHaptic` hook.
 */
type UseHapticOptions = {
  /**
   * The duration of the vibration in milliseconds.
   * @default 100
   */
  hapticDuration?: number;
};

/**
 * The return type for `useHaptic`, providing the `vibrate` method.
 */
type UseHaptic = {
  /**
   * Triggers the haptic feedback mechanism.
   */
  vibrate: () => void;
};

/**
 * A React hook that provides haptic feedback.
 *
 * On devices where `navigator.vibrate` is supported, it uses the Vibrate API.
 * On iOS devices (where `vibrate` is typically not supported), it falls back
 * to clicking a hidden switch element to trigger haptic feedback.
 *
 * @param {UseHapticOptions} [options] - Optional configuration for the hook.
 * @param {number} [options.hapticDuration=100] - The duration of the vibration in milliseconds.
 * @returns {UseHaptic} An object containing the `vibrate` function.
 */
const useHaptic = ({
  hapticDuration = 100,
}: UseHapticOptions = {}): UseHaptic => {
  const labelRef = useRef<HTMLLabelElement | null>(null);

  /**
   * Determines whether the current device is running iOS or iPadOS.
   *
   * @returns {boolean} `true` if the device is iOS/iPadOS; otherwise, `false`.
   */
  const checkIosDevice = (): boolean => {
    if (typeof window === "undefined") return false;

    const ua = navigator.userAgent;
    const isIphone = /iPhone|iPod/.test(ua);
    const isIpad =
      /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

    return isIphone || isIpad;
  };

  /**
   * Creates a hidden `<label>` element containing a checkbox input.
   * This element is used as a fallback to trigger haptic feedback on
   * iOS devices by leveraging the switch toggle feedback.
   *
   * @returns {{ label: HTMLLabelElement }} An object with the created label element.
   */
  const createHiddenSwitch = (): { label: HTMLLabelElement } => {
    const label = document.createElement("label");
    const input = document.createElement("input");

    label.style.opacity = "0";
    label.style.pointerEvents = "none";
    label.style.position = "absolute";
    label.style.left = "-9999px";
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);

    return { label };
  };

  const canVibrate = !checkIosDevice() && Boolean(navigator?.vibrate);

  useEffect(() => {
    const { label } = createHiddenSwitch();

    document.body.appendChild(label);
    labelRef.current = label;

    return () => {
      if (label.parentNode === document.body) {
        document.body.removeChild(label);
      }
    };
  }, []);

  /**
   * Triggers haptic feedback. If `navigator.vibrate` is available,
   * it uses that API; otherwise, it clicks the hidden switch element
   * to produce a similar effect on iOS devices.
   *
   * @example
   * vibrate();
   */
  const vibrate = useCallback(() => {
    if (canVibrate) {
      navigator.vibrate(hapticDuration);
    } else {
      labelRef.current?.click();
    }
  }, [canVibrate, hapticDuration]);

  return { vibrate };
};

export { useHaptic };
