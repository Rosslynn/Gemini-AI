
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Simulación de almacenamiento en memoria para los tests
const store: Record<string, any> = {};

const storageMockImplementation = {
  get: vi.fn((keys, cb) => {
    // Simula comportamiento de chrome.storage.get
    if (typeof keys === 'string') {
        cb({ [keys]: store[keys] });
    } else if (Array.isArray(keys)) {
        const result: any = {};
        keys.forEach(k => result[k] = store[k]);
        cb(result);
    } else {
        cb(store);
    }
  }),
  set: vi.fn((items, cb) => {
    Object.assign(store, items);
    if (cb) cb();
  }),
  remove: vi.fn((keys, cb) => {
    if (typeof keys === 'string') {
        delete store[keys];
    } else if (Array.isArray(keys)) {
        keys.forEach(k => delete store[k]);
    }
    if (cb) cb();
  }),
  clear: vi.fn((cb) => {
      for (const key in store) delete store[key];
      if (cb) cb();
  })
};

// Mock de la API de Chrome
const chromeMock = {
  runtime: {
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
    getURL: vi.fn(),
  },
  storage: {
    local: storageMockImplementation,
    sync: storageMockImplementation,
  },
  tabs: {
    query: vi.fn(),
    captureVisibleTab: vi.fn(),
    sendMessage: vi.fn(),
  },
  windows: {
    create: vi.fn(),
  }
};

vi.stubGlobal('chrome', chromeMock);

// Mock de SpeechRecognition
const MockSpeechRecognition = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
vi.stubGlobal('SpeechRecognition', MockSpeechRecognition);
vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition);

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de navigator.mediaDevices.getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    })
  },
  writable: true
});

// Mock de scrollIntoView para JSDOM (corrige crash en ChatList)
Element.prototype.scrollIntoView = vi.fn();
