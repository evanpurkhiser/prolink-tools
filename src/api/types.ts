/**
 * Represents the connection state to the API server
 */
export enum ConnectionState {
  /**
   * No connection is active to the Prolink Tools API server.
   */
  Offline = 'offline',
  /**
   * We are connceting to the API server...
   */
  Connecting = 'connecting',
  /**
   * There is an active connection to the Prolink Tools API server.
   */
  Connected = 'connected',
  /**
   * There is an active connection, but some functionality may not work due to an
   * outdated version of the Prolink Tools app.
   */
  Degraded = 'degraded',
  /**
   * The connected Prolink Tools app is outdated and not compatible with the
   * current running version of the API server.
   */
  Outdated = 'outdated',
  /**
   * There was a problem connecting to the API server.
   */
  Errored = 'errored',
}

export type AppHandshake = {
  connectionState: ConnectionState;
  /**
   * The git version running on the API server.
   */
  version: string;
  /**
   * A message meant for the app client
   */
  notice?: string;
};
