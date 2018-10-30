import { observable } from 'mobx';

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

export default config;
