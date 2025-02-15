import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { useHaptic } from "./index";

/**
 * Extends the globalThis type to safely mock `window` and `navigator`.
 */
declare global {
  // We only add optional properties we intend to overwrite or mock.
  // This avoids using `any`.
  // If you need more properties, add them here.
  interface Global {
    // We use a union type to allow for `undefined` in the mock.
    window?: (Window & typeof globalThis) | undefined;
    navigator: Partial<Navigator>;
  }
}

/**
 * For convenience, we cast globalThis to this extended type:
 */
const getGlobal = () => globalThis as Global & typeof globalThis;

describe("useHaptic hook", () => {
  let originalUserAgent: PropertyDescriptor | undefined;
  let originalVibrate: Navigator["vibrate"] | undefined;

  beforeAll(() => {
    // If 'navigator' does not exist in this environment, define it.
    if (!("navigator" in getGlobal())) {
      getGlobal().navigator = {
        clipboard: {} as Clipboard,
      } as Partial<Navigator> & Navigator;
    }
    // Store the original 'navigator.vibrate'.
    originalVibrate = getGlobal().navigator.vibrate;
  });

  afterAll(() => {
    // Restore the original vibrate after all tests.
    if (originalVibrate) {
      getGlobal().navigator.vibrate = originalVibrate;
    }
  });

  beforeEach(() => {
    // Make the userAgent property configurable for mocking.
    originalUserAgent = Object.getOwnPropertyDescriptor(
      getGlobal().navigator,
      "userAgent",
    );
  });

  afterEach(() => {
    // Restore userAgent to the original descriptor.
    if (originalUserAgent) {
      Object.defineProperty(
        getGlobal().navigator,
        "userAgent",
        originalUserAgent,
      );
    }
    // Clear the DOM for cleanliness.
    document.body.innerHTML = "";
  });

  const mockUserAgent = (uaString: string): void => {
    Object.defineProperty(getGlobal().navigator, "userAgent", {
      value: uaString,
      writable: true,
      configurable: true,
    });
  };

  it("should append and remove label from the body", () => {
    // Emulate a non-iOS environment (e.g., Android).
    mockUserAgent("Mozilla/5.0 (Linux; Android 10)");
    // Mock vibrate
    getGlobal().navigator.vibrate = jest.fn();

    const { unmount } = renderHook(() => useHaptic());

    // A label should be in the body after mount
    const labelElement = document.body.querySelector("label");
    expect(labelElement).toBeInTheDocument();

    // After unmount, it should be removed
    unmount();
    expect(document.body.querySelector("label")).not.toBeInTheDocument();
  });

  it("should call navigator.vibrate when not on iOS", () => {
    mockUserAgent("Mozilla/5.0 (Linux; Android 10)");
    getGlobal().navigator.vibrate = jest.fn();

    const { result } = renderHook(() => useHaptic());
    const { vibrate } = result.current;

    act(() => {
      vibrate();
    });

    // Should call vibrate with default 100ms
    expect(getGlobal().navigator.vibrate).toHaveBeenCalledWith(100);
  });

  it("should click the label when on iOS", () => {
    // Mock iOS UA
    mockUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)");
    // iOS often doesn't have vibrate
    getGlobal().navigator.vibrate =
      undefined as unknown as Navigator["vibrate"];

    const { result } = renderHook(() => useHaptic());
    const { vibrate } = result.current;

    const labelElement = document.body.querySelector(
      "label",
    ) as HTMLLabelElement;
    const clickSpy = jest.spyOn(labelElement, "click");

    act(() => {
      vibrate();
    });

    // We expect a click on the label, no vibrate call
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should use a custom hapticDuration if provided", () => {
    mockUserAgent("Mozilla/5.0 (Linux; Android 10)");
    getGlobal().navigator.vibrate = jest.fn();

    const { result } = renderHook(() => useHaptic({ hapticDuration: 200 }));
    const { vibrate } = result.current;

    act(() => {
      vibrate();
    });

    // Should call vibrate with 200ms instead of 100ms
    expect(getGlobal().navigator.vibrate).toHaveBeenCalledWith(200);
  });

  it("should gracefully handle SSR environment without error", async () => {
    const globalRef = getGlobal();
    const originalWin = globalRef.window;

    // Simulate no window
    if (globalRef.window) {
      globalRef.window = undefined as unknown as Window & typeof globalThis;
    }

    let success = false;
    try {
      const mod = await import("./index");
      expect(mod.useHaptic).toBeDefined();
      success = true;
    } catch (error) {
      success = false;
    }

    // We expect the import to succeed
    expect(success).toBe(true);

    // Restore window
    if (originalWin) {
      globalRef.window = originalWin;
    }
  });
});
