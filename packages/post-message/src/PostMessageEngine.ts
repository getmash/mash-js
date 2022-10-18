import { v4 as uuid } from "uuid";

export type EventMessage<T = Record<string, unknown>> = {
  name: string;
  metadata?: T;
};

export type PostMessageEvent<TData = unknown> = {
  targetName: string;
  data?: TData;
};

export interface PostMessageEngineOptions {
  name: string;
  targetName: string;
  targetWindow?: Window | null;
  targetOrigin?: string;
}

type RawEventListener = (evt: MessageEvent) => void;
type RawEventListenerMap = { [id: string]: RawEventListener };

type EventListener<TData = unknown> = (evt: PostMessageEvent<TData>) => void;
type Unsubscribe = () => void;

export type EngineListener<T> = (callback: EventListener<T>) => Unsubscribe;

export default class PostMessageEngine<TData> {
  name: string;
  private _targetName: string;
  private _targetWindow: Window;
  private _targetOrigin: string;

  private _listeners: RawEventListenerMap = {};

  constructor(options: PostMessageEngineOptions) {
    this.name = options.name;
    this._targetName = options.targetName;
    this._targetWindow = options.targetWindow || window;
    this._targetOrigin = options.targetOrigin || window.location.origin;
  }

  /**
   * Check to determine if message should be ignore. PostMessage listener can be polluted with
   * external message. This create "stream" that only process events between 2 targets.
   * @param evt
   * @returns boolean
   */
  // @ts-ignore Type 'MessageEvent' is not generic
  private _shouldIgnoreMessage(evt: MessageEvent<PostMessageEvent>) {
    const blockedOrigin =
      this._targetOrigin !== "*" && evt.origin !== this._targetOrigin;
    const message = evt.data;
    const messageIsObject = typeof message === "object";
    const targetNameMismatch =
      messageIsObject && message.targetName !== this.name;
    const notTargetWindow = this._targetWindow !== evt.source;
    const noData = messageIsObject && !message.data;
    return (
      blockedOrigin ||
      !messageIsObject ||
      targetNameMismatch ||
      notTargetWindow ||
      noData
    );
  }

  /**
   * Attaches a listenerr to the window to listen on 'message' events
   * @param listener EventListener
   * @param id ID of listener
   * @returns fn to unsubscribe listener
   */
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
   * Unsubscribe listener with passed in ID
   * @param id ID of listener
   */
  unsubscribe(id: string) {
    const listener = this._listeners[id];
    if (listener) {
      window.removeEventListener("message", listener);
      delete this._listeners[id];
    }
  }

  /**
   * Sends postMessage to using targetWindow.
   * @param data [TData] data to send through post message
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
   * Attach a listener to events sent through post message
   * @param callback
   * @returns fn to unsubscribe listener
   */
  listen(callback: EventListener<TData>) {
    return this._listen(callback, uuid());
  }

  /**
   * Remove all event listeners
   */
  destroy() {
    const keys = Object.keys(this._listeners);
    keys.forEach(key => this.unsubscribe(key));
  }
}
