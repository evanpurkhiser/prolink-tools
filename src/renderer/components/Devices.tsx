import * as React from 'react';
import {observer} from 'mobx-react';
import {DeviceType} from 'prolink-connect';
import styled from '@emotion/styled';

import {devices, states, localdbState} from 'src/shared/store';
import PlayState from 'app/components/PlayState';
import IconCdj from 'app/icons/cdj';
import BpmIndicator from './BpmIndicator';
import BeatCounter from './BeatCounter';

const Devices = observer(() => (
  <React.Fragment>
    {[...devices.values()]
      .filter(device => device.type === DeviceType.CDJ)
      .map(device => {
        const state = states.get(device.id);
        const fetching = localdbState.fetchProgress.get(device.id);

        console.log(state?.playState)

        return (
          <Device key={device.id}>
            <Indicator>
              <PlayerId>{device.id.toString().padStart(2, '0')}</PlayerId>
              <IconCdj />
              <OnairIndicator active={!!state?.isOnAir} />
            </Indicator>
            <Status>
            <StatusBar>
              <PlayState playState={state?.playState} />
              <BeatCounter beat={state?.beatInMeasure} beatsUntilCue={state?.beatsUntilCue} />
            </StatusBar>
            <StatusBar>
              <BpmIndicator pitch={state?.sliderPitch} bpm={state?.trackBPM} />
            </StatusBar>

            </Status>


          </Device>
        );
      })}
  </React.Fragment>
));

const OnairIndicator = styled('div')<{active: boolean}>`
  height: 0.5rem;
  width: 0.5rem;
  border-radius: 50%;

`;

const Indicator = styled('div')`
  color: #3B434B;
  display: grid;
  grid-template-rows: max-content max-content;
  grid-gap: 0.5rem;
  padding-right: 0.5rem;
  border-right: 1px solid #eee;
`;


const Status = styled('div')`
  display: grid;
  grid-template-rows: max-content max-content;
  grid-gap: 0.5rem;

`;

const Device = styled('div')`
  color: #3B3B3B;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  margin: 1rem;
`;

const StatusBar = styled('div')`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  grid-gap: 0.5rem;
`;

const PlayerId = styled('div')`
  font-size: 0.825rem;
  line-height: 22px;
  width: 34px;
  font-weight: 700;
  background: #3B434B;
  text-align: center;
  align-items: center;
  color: #fff;
  border-radius: 3px;
  overflow: hidden;
`;

export default Devices;
