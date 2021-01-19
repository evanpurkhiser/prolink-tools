import {remove} from 'lodash';
import {action, computed, IObservableArray, makeAutoObservable, observable} from 'mobx';
import {Socket} from 'socket.io';

import {createHash} from 'crypto';

import {AppStore} from 'src/shared/store';

/**
 * An AppKey represents a global way to identify connected prolink tools
 * instances on the API server.
 *
 * It is cryptographically derrived from the apiKey.
 */
type AppKey = string;

export class Connection {
  /**
   * The API key used to communicate with the app client.
   */
  apiKey: string;
  /**
   * The active websocket connection to the client
   */
  socket: Socket;
  /**
   * The observable store which will be synced to events recieved via the
   * socket
   */
  store: AppStore;
  /**
   * Clients subscribed to this store. Sockets in this list will be emitted
   * store-update events
   */
  clients: Socket[] = [];

  /**
   * Get the appKey for this connection.
   */
  get appKey(): AppKey {
    return createHash('sha256').update(this.apiKey).digest('hex');
  }

  constructor(apiKey: string, socket: Socket, store: AppStore) {
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
  appStoreClients = observable.map<AppKey, IObservableArray<Socket>>();

  @action
  addStoreClient(appKey: AppKey, client: Socket) {
    if (!this.appStoreClients.has(appKey)) {
      this.appStoreClients.set(appKey, observable.array<Socket>());
    }
    this.appStoreClients.get(appKey)!.push(client);
  }

  @action
  removeStoreClient(appKey: AppKey, client: Socket) {
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
