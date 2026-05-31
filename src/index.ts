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
  const isBrowser = typeof window !== "undefined";
  const labelRef = useRef<HTMLLabelElement | null>(null);

  /**
   * Determines whether the current device is running iOS or iPadOS.
   *
   * @returns {boolean} `true` if the device is iOS/iPadOS; otherwise, `false`.
   */
  const checkIosDevice = (): boolean => {
    if (!isBrowser) return false;

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

    label.style.position = "fixed";
    label.style.bottom = "0";
    label.style.right = "0";
    label.style.width = "1px";
    label.style.height = "1px";
    label.style.overflow = "hidden";
    label.style.clip = "rect(0, 0, 0, 0)";
    label.style.border = "0";
    label.style.margin = "0";
    label.style.padding = "0";
    input.type = "checkbox";
    input.style.width = "1px";
    input.style.height = "1px";
    input.setAttribute("switch", "");

    label.appendChild(input);

    return { label };
  };

  const canVibrate =
    isBrowser && !checkIosDevice() && Boolean(navigator?.vibrate);

  useEffect(() => {
    if (!isBrowser) return;

    const { label } = createHiddenSwitch();

    document.body.appendChild(label);
    labelRef.current = label;

    return () => {
      if (label.parentNode === document.body) {
        document.body.removeChild(label);
      }
    };
  }, [isBrowser]);

  /**
   * Triggers haptic feedback. If `navigator.vibrate` is available,
   * it uses that API; otherwise, it clicks the hidden switch element
   * to produce a similar effect on iOS devices.
   *
   * @example
   * vibrate();
   */
  const vibrate = useCallback(() => {
    if (!isBrowser) return;

    if (canVibrate) {
      navigator.vibrate(hapticDuration);
    } else {
      const label = labelRef.current;

      if (label) {
        const input = label.querySelector("input");

        if (input) {
          input.checked = false;
        }

        label.click();
      }
    }
  }, [canVibrate, hapticDuration, isBrowser]);

  return { vibrate };
};

export { useHaptic };
