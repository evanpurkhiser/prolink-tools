import {makeObservable, observable} from 'mobx';
import {list, primitive, serializable} from 'serializr';

/**
 * Configures saving live track history into files on disc
 */
export class SaveHistoryConfig {
  /**
   * Should we store live play history in a file?
   */
  @serializable
  @observable
  enabled = false;
  /**
   * Where should we store the live history?
   */
  @serializable
  @observable
  fileDirectory = '';
  /**
   * The name of the file we write to. Does not include the format extension.
   */
  @serializable
  @observable
  fileName = 'prolink-history';
  /**
   * What formats should we store the live history as?
   */
  @serializable(list(primitive()))
  @observable
  formats: Array<'txt' | 'json' | 'csv'> = ['txt'];
  /**
   * The text output format
   */
  @serializable
  @observable
  txtFormat = '{artist} - {title}';
  /**
   * Log the entire track history instead of replacing the contents of the file
   * with the latest track.
   */
  @serializable
  @observable
  fullHistory = false;

  constructor() {
    makeObservable(this);
  }
}
