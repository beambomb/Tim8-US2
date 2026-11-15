/**
 * Menyiapkan mock minimal window, localStorage, dan dispatchEvent untuk test browser-side helpers.
 */
export function setupMockWindow({ pathname = "/" } = {}) {
  const storage = new Map();
  const dispatchedEvents = [];

  const localStorageMock = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  let replacedUrl = null;
  const windowMock = {
    localStorage: localStorageMock,
    location: {
      pathname,
      replace(url) {
        replacedUrl = url;
      },
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
      return true;
    },
  };

  const prevWindow = globalThis.window;
  const prevLocalStorage = globalThis.localStorage;
  globalThis.window = windowMock;
  globalThis.localStorage = localStorageMock;

  return {
    windowMock,
    localStorageMock,
    dispatchedEvents,
    getReplacedUrl() {
      return replacedUrl;
    },
    restore() {
      if (prevWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = prevWindow;
      }
      if (prevLocalStorage === undefined) {
        delete globalThis.localStorage;
      } else {
        globalThis.localStorage = prevLocalStorage;
      }
    },
  };
}
