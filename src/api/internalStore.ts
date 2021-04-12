import {remove} from 'lodash';
import {action, computed, IObservableArray, makeAutoObservable, observable} from 'mobx';

import {createHash} from 'crypto';

import {AppStore} from 'src/shared/store';
import {ApiAppServerSocket, ApiExternalServerSocket} from 'src/shared/websockeTypes';

/**
 * An AppKey represents a global way to identify connected prolink tools
 * instances on the API server.
 *
 * It is cryptographically derrived from the apiKey.
 */
export type AppKey = string;

export class Connection {
  /**
   * The API key used to communicate with the client app.
   */
  apiKey: string;
  /**
   * The active websocket connection to the client app.
   */
  socket: ApiAppServerSocket;
  /**
   * The observable store which will be synced to events recieved via the
   * socket
   */
  store: AppStore;

  /**
   * Get the appKey for this connection.
   */
  get appKey(): AppKey {
    return this.makeOpaqueKey('appKey');
  }

  /**
   * Genearte a asymetric key that can be used to verify app requests by
   * comparing the API keys
   *
   * This uses the secret API key, that is only shared when the app first
   * connects and is only known by the client esentially as a HMAC secret.
   */
  makeOpaqueKey(subKey: string) {
    return createHash('sha256')
      .update(`${this.apiKey}:${subKey}`)
      .digest('base64')
      .slice(0, 20);
  }

  constructor(apiKey: string, socket: ApiAppServerSocket, store: AppStore) {
    this.apiKey = apiKey;
    this.socket = socket;
    this.store = store;
  }
}

export class InternalStore {
  /**
   * Active connections from app instances
   */
  @observable
  appConnections = observable.map<AppKey, Connection>();

  @action
  addAppConnection(conn: Connection) {
    this.appConnections.set(conn.appKey, conn);
  }

  @action
  removeAppConnection(appKey: AppKey) {
    this.appConnections.delete(appKey);
  }

  /**
   * Active socket connections to a particular app store. Maintained outside of
   * app connections to allow open socket connections of a store without the
   * app being connected.
   */
  @observable
  appStoreClients = observable.map<AppKey, IObservableArray<ApiExternalServerSocket>>();

  @action
  addStoreClient(appKey: AppKey, client: ApiExternalServerSocket) {
    if (!this.appStoreClients.has(appKey)) {
      this.appStoreClients.set(appKey, observable.array<ApiExternalServerSocket>());
    }
    this.appStoreClients.get(appKey)!.push(client);
  }

  @action
  removeStoreClient(appKey: AppKey, client: ApiExternalServerSocket) {
    const clients = this.appStoreClients.get(appKey) ?? [];
    remove(clients, client);
  }

  /**
   * Compute the mapping of overlay keys to connections.
   */
  @computed
  get overlayKeyMap() {
    return [...this.appConnections.values()].reduce(
      (mapping, conn) =>
        Object.assign(
          mapping,
          ...conn.store.config.overlays.map(config => ({[config.key]: conn}))
        ),
      {} as Record<string, Connection>
    );
  }

  constructor() {
    makeAutoObservable(this);
  }
}

export const createInternalStore = () => new InternalStore();
