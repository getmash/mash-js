import "node:test"; // trigger declaration merging

// Extend the existing node types with the builtin test runner's new mocking capabilities.
// These were introduced in node v19. Once their types are defined in @types/node we can drop.
// This is a subset of the mocking functionality offered, but should be enough for now when used
// with before/after constructs.
declare module "node:test" {
  export const mock: MockTracker;

  interface MockFnOptions {
    times?: number;
  }

  interface MockMethodOptions {
    getter?: boolean;
    setter?: boolean;
    times?: number;
  }

  // https://nodejs.org/api/test.html#class-mocktracker
  interface MockTracker {
    fn<T>(
      original?: T,
      implementation?: T,
      options?: MockFnOptions,
    ): T & { mock: MockFunctionContext };
    method(
      // eslint-disable-next-line @typescript-eslint/ban-types
      object: Object,
      methodName: string,
      // eslint-disable-next-line @typescript-eslint/ban-types
      implementation: Function,
      options?: MockFnOptions,
    ): T & { mock: MockFunctionContext };
    reset: () => void;
    restoreAll: () => void;
  }

  // https://nodejs.org/api/test.html#class-mockfunctioncontext
  interface MockFunctionContext {
    callCount: () => number;
  }
}
