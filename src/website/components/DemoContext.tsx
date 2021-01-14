import * as React from 'react';

import {createAppStore} from 'src/shared/store';
import {StoreContext} from 'src/shared/store/context';
import Routine from 'src/website/demo/routine';

type Props = {
  /**
   * The Routine object to execute within the demo store context
   */
  demoRoutine: Routine;
  children: React.ReactNode;
};

const DemoContext = ({demoRoutine, children}: Props) => {
  const [demoStore] = React.useState(createAppStore());

  React.useEffect(() => {
    demoRoutine.run(demoStore);
  }, []);

  return <StoreContext.Provider value={demoStore}>{children}</StoreContext.Provider>;
};

export default DemoContext;
