import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill for jsdom (fixes "not implemented: HTMLFormElement.prototype.requestSubmit")
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function () {
    const event = new Event("submit", { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  };
}

// Optional: Silence console errors for cleaner test output
vi.spyOn(console, "error").mockImplementation(() => {});
