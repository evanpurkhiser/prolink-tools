import {Fragment} from 'react';
import styled from '@emotion/styled';
import filesize from 'filesize';
import {observer} from 'mobx-react';

import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';
import ProgressRing from 'ui/components/ProgressRing';

type Props = {
  store: AppStore;
  deviceId: number;
};

const DbStateIndicator = observer(({store, deviceId}: Props) => {
  const deviceStore = store.devices.get(deviceId);

  if (!deviceStore) {
    return null;
  }

  const {hydrationProgress, fetchProgress} = deviceStore;

  const indicators = [...fetchProgress.entries()].map(([slot, download]) => {
    const hydration = hydrationProgress.get(slot);

    if (!download) {
      return null;
    }

    if (download.read === download.total && hydration && hydration.isDone) {
      return null;
    }

    return (
      <Wrapper key={slot}>
        <DownloadRing
          bgColor="#E4E4E4"
          color="#FF6666"
          barWidth={4}
          size={32}
          maxValue={(hydration?.total ?? download.total) || 100}
          value={hydration?.complete ?? download.read}
        />
        <Info>
          {!hydration
            ? 'Fetching database...'
            : hydration.total !== hydration.complete
            ? 'Hydrating database...'
            : 'Flushing database...'}
          <small>
            {hydration
              ? `${hydration.complete} / ${hydration.total} entries`
              : `${filesize(download.read)} / ${filesize(download.total)}`}
          </small>
        </Info>
      </Wrapper>
    );
  });

  return <Fragment>{indicators}</Fragment>;
});

const DownloadRing = styled(ProgressRing)`
  font-size: 10px;
`;

const Wrapper = styled('div')`
  display: grid;
  align-items: center;
  grid-template-columns: auto auto;
  grid-gap: 0.5rem;
  font-size: 0.75rem;
  border: 1px solid #e2e2e2;
  border-radius: 3px;
  padding: 0.375rem;
`;

const Info = styled('div')`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;

  small {
    display: block;
    font-size: 10px;
    color: ${p => p.theme.subText};
    font-weight: normal;
    margin-top: 0.125rem;
  }
`;

export default withStore(DbStateIndicator);
