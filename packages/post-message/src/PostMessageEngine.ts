import { v4 as uuid } from "uuid";

export type PostMessageEvent<TData = unknown> = {
  targetName: string;
  data?: TData;
};

export interface PostMessageEngineOptions {
  name: string;
  targetName: string;
  targetWindow?: Window | null;
  targetWindowFilter?: boolean;
  targetOrigin?: string;
}

type RawEventListener = (evt: MessageEvent) => void;
type RawEventListenerMap = { [id: string]: RawEventListener };

type EventListener<TData = unknown> = (evt: PostMessageEvent<TData>) => void;
type Unsubscribe = () => void;

export type EngineListener<T> = (callback: EventListener<T>) => Unsubscribe;

/**
 * Add structure to the postmessage channel by defining message types
 * and listening for specific streams based on engine name and window.
 */
export default class PostMessageEngine<TData> {
  /** The name of the engine. The engine will only listen for events sent to this name. */
  name: string;
  /** The name of the engine to send messages to. */
  private _targetName: string;
  /** The window to send and receive messages to. Defaults to current window. */
  private _targetWindow: Window;
  /** Listen for messages from just target window or all windows if disabled. Defaults to true.*/
  private _targetWindowFilter: boolean;
  /** Origin to send and receive messages on. Security backstop, be careful of using '*'. Defaults to current origin. */
  private _targetOrigin: string;

  private _listeners: RawEventListenerMap = {};

  constructor(options: PostMessageEngineOptions) {
    this.name = options.name;
    this._targetName = options.targetName;
    this._targetWindow = options.targetWindow || window;
    this._targetWindowFilter = options.targetWindowFilter ?? true;
    this._targetOrigin = options.targetOrigin || window.location.origin;
  }

  /**
   * Check to determine if message should be ignore. PostMessage listener can be polluted with
   * external message. This filter creates a "stream" that only processes events between 2 targets.
   */
  // @ts-ignore Type 'MessageEvent' is not generic
  private _shouldIgnoreMessage(evt: MessageEvent<PostMessageEvent>) {
    // origin is the main security check
    const blockedOrigin =
      this._targetOrigin !== "*" && evt.origin !== this._targetOrigin;
    const message = evt.data;
    const messageIsObject = typeof message === "object";
    // engine name's define streams
    const targetNameMismatch =
      messageIsObject && message.targetName !== this.name;
    // checking the event source helps limit messages and can also be used as a secondary security check
    const notTargetWindow =
      this._targetWindowFilter && this._targetWindow !== evt.source;
    const noData = messageIsObject && !message.data;
    return (
      blockedOrigin ||
      !messageIsObject ||
      notTargetWindow ||
      targetNameMismatch ||
      noData
    );
  }

  // Attaches a listener to the window to listen on 'message' events.
  _listen(listener: EventListener<TData>, id: string): Unsubscribe {
    // @ts-ignore Type 'MessageEvent' is not generic
    const wrapped: RawEventListener = (
      evt: MessageEvent<PostMessageEvent<TData>>,
    ) => {
      if (this._shouldIgnoreMessage(evt)) return;
      listener(evt.data || null);
    };
    this._listeners[id] = wrapped;
    window.addEventListener("message", wrapped, false);
    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe listener.
   * @param id of listener
   */
  unsubscribe(id: string) {
    const listener = this._listeners[id];
    if (listener) {
      window.removeEventListener("message", listener);
      delete this._listeners[id];
    }
  }

  /**
   * Sends a message using targetWindow.
   * @param data to send through post message
   */
  send(data: TData) {
    this._targetWindow.postMessage(
      {
        targetName: this._targetName,
        data,
      },
      this._targetOrigin,
    );
  }

  /**
   * Attach a listener to events sent to engine.
   * @param callback to process event
   * @returns fn to unsubscribe listener
   */
  listen(callback: EventListener<TData>) {
    return this._listen(callback, uuid());
  }

  /**
   * Remove all event listeners.
   */
  destroy() {
    const keys = Object.keys(this._listeners);
    keys.forEach(key => this.unsubscribe(key));
  }
}
