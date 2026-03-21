import {useEffect, useState} from 'react';

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
  const [demoStore] = useState(createAppStore());

  // TODO figure out if it's safe to pass all deps
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void demoRoutine.run(demoStore), []);

  return <StoreContext.Provider value={demoStore}>{children}</StoreContext.Provider>;
};

export default DemoContext;
