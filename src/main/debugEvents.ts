import * as Sentry from '@sentry/node';
import fetch from 'node-fetch';
import FormData from 'form-data';
import {
  CDJStatus,
  ConnectedProlinkNetwork,
  Device,
  ProlinkNetwork,
} from 'prolink-connect';
import {autorun} from 'mobx';
import {gzip} from 'node-gzip';

import store from 'src/shared/store';

type Events =
  | {
      type: 'status';
      event: CDJStatus.State;
    }
  | {
      type: 'nowPlaying';
      event: CDJStatus.State;
    }
  | {
      type: 'deviceAdded';
      event: Device;
    }
  | {
      type: 'deviceRemoved';
      event: Device;
    };

type DebugEvent = {ts: number} & Events;

async function uploadEvents(eventId: string, data: Buffer) {
  const dsn = Sentry.getCurrentHub().getClient()?.getDsn();

  if (dsn === undefined) {
    return;
  }

  // Determine the sentry attachment upload URL
  const {host, path, projectId, port, protocol, user} = dsn;
  const portString = port !== '' ? `:${port}` : '';
  const pathString = path !== '' ? `/${path}` : '';

  const endpoint = `${protocol}://${host}${portString}${pathString}/api/${projectId}/events/${eventId}/attachments/?sentry_key=${user}&sentry_version=7&sentry_client=custom-javascript`;

  // Transform our event history into uploadable FormData
  const formData = new FormData();

  formData.append('my-attachment', await gzip(data), {
    filename: 'events.json.gz',
    contentType: 'application/json',
  });

  // Upload debug events blob to Sentry
  await fetch(endpoint, {method: 'POST', body: formData});
}

class DebugEventsService {
  #network: ConnectedProlinkNetwork;
  /**
   * Is the service currently recording and reporting?
   */
  #active = false;
  /**
   * Records events for the current DJ set
   */
  #eventHistory: DebugEvent[] = [];

  constructor(network: ConnectedProlinkNetwork) {
    this.#network = network;
  }

  toggle(enabled: boolean) {
    return enabled ? this.enable() : this.disable();
  }

  /**
   * Start capturing events for debugging
   */
  enable() {
    if (this.#active) {
      return;
    }

    this.#network.statusEmitter.on('status', this.#handleStatus);
    this.#network.mixstatus.on('setStarted', this.#handleSetStarted);
    this.#network.mixstatus.on('setEnded', this.#handleSetEnded);
    this.#network.mixstatus.on('nowPlaying', this.#handleNowPlaying);
    this.#network.deviceManager.on('connected', this.#handleNewDevice);
    this.#network.deviceManager.on('disconnected', this.#handleRemovedDevice);

    this.#active = true;
  }

  /**
   * Stop capturing events for debugging
   */
  disable() {
    if (!this.#active) {
      return;
    }

    this.#network.statusEmitter.off('status', this.#handleStatus);
    this.#network.mixstatus.off('setStarted', this.#handleSetStarted);
    this.#network.mixstatus.off('setEnded', this.#handleSetEnded);
    this.#network.mixstatus.off('nowPlaying', this.#handleNowPlaying);
    this.#network.deviceManager.off('connected', this.#handleNewDevice);
    this.#network.deviceManager.off('disconnected', this.#handleRemovedDevice);

    this.#eventHistory = [];
    this.#active = false;
  }

  #handleNewDevice = (event: Device) => {
    this.#eventHistory.push({ts: Date.now(), type: 'deviceAdded', event});
  };

  #handleRemovedDevice = (event: Device) => {
    this.#eventHistory.push({ts: Date.now(), type: 'deviceRemoved', event});
  };

  #handleNowPlaying = (event: CDJStatus.State) => {
    this.#eventHistory.push({ts: Date.now(), type: 'nowPlaying', event});
  };

  #handleStatus = (event: CDJStatus.State) => {
    this.#eventHistory.push({ts: Date.now(), type: 'status', event});
  };

  // Control events. These events will control the lifecycle of capturing debug
  // events. Including uploading the events list to Sentry.

  #handleSetStarted = () => {
    this.#eventHistory = [];
  };

  #handleSetEnded = () => {
    const eventId = Sentry.captureMessage('Debug events uploaded', Sentry.Severity.Debug);
    const data = Buffer.from(JSON.stringify(this.#eventHistory));

    uploadEvents(eventId, data);
  };
}

/**
 * Registers availability to capture and upload debug events from the network
 * to Sentry. The service will be activated and deactivated reactively to the
 * reportDebugEvents store configuration.
 */
export function registerDebuggingEventsService(network: ProlinkNetwork) {
  if (!network.isConnected()) {
    return;
  }

  const service = new DebugEventsService(network);
  autorun(() => service.toggle(store.config.reportDebugEvents));
}
