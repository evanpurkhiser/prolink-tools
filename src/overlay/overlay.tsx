import * as React from 'react';
import {observer} from 'mobx-react';

import store from 'src/shared/store';

const Overlay = observer(() => (
  <React.Fragment>
    <p>Live Track history</p>
    <ul>
      {store.mixstatus.trackHistory.map(entry => (
        <li>{entry.track.title}</li>
      ))}
    </ul>
  </React.Fragment>
));

export default Overlay;
