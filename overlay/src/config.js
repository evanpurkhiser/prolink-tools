import { observable, reaction } from 'mobx';
import base64url from 'base64-url';

const config = observable({
  /**
   * Prolink server address to connect to.
   */
  serverAddress: 'localhost:8000',

  /**
   * The number of track history items to display.
   */
  historyCutoff: 4,

  /**
   * The color of the text background
   */
  textBackground: 'rgba(0, 0, 0, 0.25)',

  /**
   * The list of track metadata items that should be rendered in the track
   * details line.
   */
  detailLineItems: ['album', 'label', 'comment'],
});

// Update configuration stored in the URL
reaction(
  _ => base64url.encode(JSON.stringify(config)),
  data => (window.location.hash = data)
);

// Hydrate config from URL
const encodedConfig = window.location.hash.replace(/^#/, '');

try {
  Object.entries(JSON.parse(base64url.decode(encodedConfig))).map(
    ([key, value]) => (config[key] = value)
  );
} catch (e) {
  console.warn(`Failed to decode config: ${e}`);
}

export default config;
