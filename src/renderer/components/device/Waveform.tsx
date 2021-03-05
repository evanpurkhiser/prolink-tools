import React from 'react';
import styled from '@emotion/styled';
import {autorun} from 'mobx';
import {CDJStatus, DeviceID} from 'prolink-connect/lib/types';

import {AppStore} from 'src/shared/store';
import withStore from 'src/utils/withStore';

function makeTrackLine(width: number, height: number) {
  const offscreen = new OffscreenCanvas(width, height);
  const osCtx = offscreen.getContext('2d')!;

  // Draw 'track line'
  osCtx.lineWidth = 2;
  osCtx.strokeStyle = `#f2f2f2`;
  osCtx.beginPath();
  osCtx.moveTo(0, height / 2);
  osCtx.lineTo(width, height / 2);
  osCtx.stroke();

  return offscreen;
}

function drawScrollingWaveform(
  store: AppStore,
  deviceId: DeviceID,
  canvas: HTMLCanvasElement
) {
  const width = canvas.parentElement?.clientWidth ?? 0;
  const height = canvas.parentElement?.clientHeight ?? 0;

  const trackLine = makeTrackLine(width, height);

  const zoom = 2;
  const setgmentSize = 500;
  const heightMultiplier = (height - 10) / 31;

  let offscreen = new OffscreenCanvas(width, height);

  // Whenever a new waveform is loaded, re-draw the offscreen waveform
  const trackChangeDisposer = autorun(() => {
    const waveformHd = store.devices.get(deviceId)?.waveforms?.waveformHd;
    const grid = store.devices.get(deviceId)?.track?.beatGrid;

    if (waveformHd === undefined) {
      return;
    }

    const waveWidth = Math.round(waveformHd.length / zoom);
    offscreen = new OffscreenCanvas(waveWidth, height);

    const osCtx = offscreen.getContext('2d')!;

    const segments = Math.ceil(waveformHd.length / setgmentSize);

    const draw = async () => {
      for (let i = 0; i < segments; i++) {
        const start = i * setgmentSize;
        const end = Math.min(start + setgmentSize, waveformHd.length);

        for (let s = start; s < end; s++) {
          const x = s / zoom;
          const {height: segmentHeight, color} = waveformHd[s];
          const [r, g, b] = color;

          const size = segmentHeight * heightMultiplier;

          const start = Math.round(height / 2 - size / 2);
          const end = Math.round(height / 2 + size / 2);

          osCtx.strokeStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
          osCtx.lineWidth = 1;
          osCtx.beginPath();
          osCtx.moveTo(0.5 + x, start);
          osCtx.lineTo(0.5 + x, end);
          osCtx.stroke();
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    };

    draw();
  });

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;

  const xOffset = width / 2;

  let posX = 0 - xOffset;
  let pitch = 0;
  let playState: CDJStatus.PlayState = CDJStatus.PlayState.Paused;

  const beatDisposer = autorun(() => {
    const deviceStore = store.devices.get(deviceId);

    if (deviceStore === undefined) {
      return;
    }

    const {track, state} = deviceStore;

    if (track === undefined) {
      return;
    }

    pitch = state?.sliderPitch ?? 0;
    playState = state?.playState ?? CDJStatus.PlayState.Empty;

    console.log(pitch);

    const timeOffset = track.beatGrid?.[state?.beat ?? 0]?.offset ?? 0;
    posX = Math.round(((timeOffset / 1000) * 150) / zoom) - xOffset;
  });

  // const lastPosX = -1;
  let lastTs = 0;

  let stop = false;

  const doDrawing = (ts: DOMHighResTimeStamp) => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(trackLine, 0, 0, width, height);
    ctx.drawImage(offscreen, posX * -1, 0);

    if (lastTs === 0) {
      lastTs = ts;
    }

    if (
      playState === CDJStatus.PlayState.Playing ||
      playState === CDJStatus.PlayState.Cuing
    ) {
      // milliseconds since last draw, convert to seconds, 150 pixels per second.
      posX += ((ts - lastTs) / 1000) * 150;
    }

    lastTs = ts;

    if (!stop) {
      window.requestAnimationFrame(doDrawing);
    }
  };

  window.requestAnimationFrame(doDrawing);

  return () => {
    beatDisposer();
    trackChangeDisposer();
    stop = true;
  };
}

type Props = {
  store: AppStore;
  deviceId: DeviceID;
};

const Waveform = ({store, deviceId}: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => drawScrollingWaveform(store, deviceId, canvasRef.current!), []);

  return (
    <Container>
      <canvas ref={canvasRef} />
    </Container>
  );
};

const Container = styled('div')`
  height: 60px;
  width: 100%;
`;

export default withStore(Waveform);
