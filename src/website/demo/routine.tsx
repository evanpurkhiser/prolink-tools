import {AppStore} from 'src/shared/store';

type Control = {
  /**
   * The number of times the action has ran up until this execution
   */
  run: number;
};

type Action = {
  /**
   * How long (in ms) until the action is executed
   */
  delay?: number;
  /**
   * How many time should we repeat the action? if set to Infinity the action
   * will never end unless it's otherwise stopped. If set to 1 (the default) it
   * will execute just once.
   */
  repeat?: number;
  /**
   * The action to execute
   */
  fn?: (store: AppStore, ctl: Control) => void | Promise<any>;
};

type Status = {
  running: boolean;
};

class Routine {
  nextAction = 0;
  /**
   * The sequental actions to execute when ran
   */
  actionList: Action[] = [];
  /**
   * We track status flags to control running actions that have been given ids.
   */
  namedActions: Record<string, Status> = {};

  constructor(actions: Action[]) {
    this.actionList = actions;
  }

  /**
   * Start execution of the routine sequence
   */
  async run(store: AppStore) {
    while (this.nextAction < this.actionList.length) {
      const {delay, repeat, fn} = this.actionList[this.nextAction];

      const executor = async () => {
        let timesRan = 0;

        while (timesRan < (repeat ?? 1)) {
          await new Promise(r => setTimeout(r, delay ?? 0));
          await fn?.(store, {run: timesRan});
          timesRan++;
        }
      };

      await executor();
      this.nextAction++;
    }
  }
}

export default Routine;
