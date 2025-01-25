import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from '../renderer/App';

// Mock `window.electron` to prevent ipcRenderer errors
beforeAll(() => {
  global.window.electron = {
    ipcRenderer: {
      invoke: jest.fn(async (channel, ...args) => {
        if (channel === 'get-defaultappdatapaths') {
          return ['path1', 'path2', 'path3']; // Mock response for this channel
        }
        return null;
      }),
      sendMessage: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
    },
  };
  global.ResizeObserver = class {
    observe = jest.fn();

    unobserve = jest.fn();

    disconnect = jest.fn();
  };
});

describe('App', () => {
  it('should render', () => {
    expect(render(<App />)).toBeTruthy();
  });
});
