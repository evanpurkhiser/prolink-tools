import {Server, Socket as ServerSocket} from 'socket.io';
import {Socket as ClientSocket} from 'socket.io-client';

import {AppHandshake} from 'src/api/types';
import {SerializedChange} from 'src/shared/store/ipc';

import {OAuthProvider} from './store/types';

type NoEvents = Record<string, never>;

/**
 * Events used to communicate store changes
 */
type StoreUpdateEvents = {
  /**
   * Initialize the AppStore in the API server
   */
  'store-init': (serializedStore: any, done?: () => void) => void;
  /**
   * Update the AppStore representation on the API server with an incremental
   * change
   */
  'store-update': (update: SerializedChange, done?: () => void) => void;
};

/**
 * Events used to update the ConfigStore
 */
type ConfigUpdateEvents = {
  'config-update': (change: SerializedChange) => void;
};

/**
 * Events specific to App <-> API communication
 */
type AppApiEvents = StoreUpdateEvents & {
  /**
   * Initialize the handshake with the API server
   */
  handshake: (opts: {version: number}, done: (handshake: AppHandshake) => void) => void;
  /**
   * Check how long it takes for the server to respond
   */
  'latency-check': (done: () => void) => void;
};

/**
 * Events specifc to API <-> External
 */
type AppApiHandlers = {
  'oauth:authorize': (
    provider: OAuthProvider,
    code: string,
    result: (opts: {error: string | null}) => void
  ) => void;
};

/**
 * Events emitted from the control API server socket
 */
type ApiControlEvents = {
  /**
   * Initialize the ApiStore on an external client
   */
  'api-store-init': (serializedStore: any) => void;
  /**
   * Updates the ApiStore representation on the external client
   */
  'api-store-update': (update: SerializedChange) => void;
};

/**
 * Events received on the control API server socket
 */
type ApiControlHandlers = {
  /**
   * Resolves an appKey given an overlayKey
   */
  'appKey:by-overlay-key': (
    overlayKey: string,
    respond: (appKey: string) => void
  ) => void;
};

/**
 * A note on how to read these types...
 *
 * Each type is prefixed with a [FROM -> TO]
 *
 * FROM Indicates where the socket lives. TO Indicates where the socket sends
 * messages. Each type comes as a pair, where there will be a inverse client
 * socket that receives + replies to the server socket.
 */

/**
 * [API->...]: Serves clients generically connected to the API
 */
export type ApiServer = Server<ApiControlHandlers, ApiControlEvents>;

/**
 * [...->API]: A generic client connection to the API server
 */
export type ApiClientSocket = ClientSocket<ApiControlEvents, ApiControlHandlers>;

/**
 * [API->App]: A app client connection on the API Server
 */
export type ApiAppServerSocket = ServerSocket<AppApiEvents, ConfigUpdateEvents>;

/**
 * [App->API]: The Prolink Tools app client connection to the API server
 */
export type ApiAppClientSocket = ClientSocket<ConfigUpdateEvents, AppApiEvents>;

/**
 * [API->External]: A external client connection to a specific App on the API server
 */
export type ApiExternalServerSocket = ServerSocket<AppApiHandlers, StoreUpdateEvents>;

/**
 * [External->API]: A external client connection to a specific App to the API server.
 */
export type ApiExternalClientSocket = ClientSocket<StoreUpdateEvents, AppApiHandlers>;

/**
 * [App->Overlay]: Serves the overlay
 */
export type AppOverlayServer = Server<NoEvents, StoreUpdateEvents>;

/**
 * [Overlay->App]: A connection to the Overlay server
 */
export type AppOverlayClientSocket = ClientSocket<StoreUpdateEvents, NoEvents>;
