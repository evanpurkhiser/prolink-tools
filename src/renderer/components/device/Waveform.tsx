import * as React from 'react';
import {autorun, toJS} from 'mobx';
import {CDJStatus, DeviceID} from 'prolink-connect/lib/types';

import store from 'src/shared/store';

function drawScrollingWaveform(deviceId: DeviceID, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');

  if (ctx == null) {
    return;
  }

  const width = canvas.parentElement?.clientWidth ?? 0;
  const height = canvas.parentElement?.clientHeight ?? 0;

  canvas.width = width;
  canvas.height = height;

  const zoom = 1;
  const heightMultiplier = height / 31;

  const offscreen = document.createElement('canvas');

  autorun(() => {
    const deviceStore = store.devices.get(deviceId);

    if (deviceStore === undefined) {
      return;
    }

    const {track} = deviceStore;

    if (track === undefined) {
      return;
    }

    // if (track.waveformHd === null) {
    //   return;
    // }

    const waveformHd: any = [];

    offscreen.width = Math.round(waveformHd.length / zoom);
    offscreen.height = height;
    const oscCtx = offscreen.getContext('2d');

    if (oscCtx === null) {
      return;
    }

    oscCtx.clearRect(0, 0, width, height);

    // Draw 'track line'
    oscCtx.lineWidth = 2;
    oscCtx.strokeStyle = `#f2f2f2`;
    oscCtx.beginPath();
    oscCtx.moveTo(0, height / 2);
    oscCtx.lineTo(width, height / 2);
    oscCtx.stroke();

    for (let s = 0; s < waveformHd.length; s++) {
      const x = s / zoom;
      const {height: segmentHeight, color} = waveformHd[s];
      const [r, g, b] = color;

      const size = segmentHeight * heightMultiplier;

      const start = Math.round(height / 2 - size / 2);
      const end = Math.round(height / 2 + size / 2);

      oscCtx.strokeStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
      oscCtx.lineWidth = 1;
      oscCtx.beginPath();
      oscCtx.moveTo(0.5 + x, start);
      oscCtx.lineTo(0.5 + x, end);
      oscCtx.stroke();
    }
  });

  let posX = 0;
  let pitch = 0;
  let playState: CDJStatus.PlayState = CDJStatus.PlayState.Paused;

  autorun(() => {
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

    const timeOffset = track.beatGrid?.[state?.beat ?? 0]?.offset ?? 0;
    posX = Math.round(((timeOffset / 1000) * 150) / zoom);
  });

  let lastPosX = -1;
  let lastTs = 0;

  const doDrawing = (ts: DOMHighResTimeStamp) => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offscreen, posX * -1, 0);

    if (lastTs === 0) {
      lastTs = ts;
    }

    if (playState === CDJStatus.PlayState.Playing) {
      // milliseconds since last draw, convert to seconds, 150 pixels per second.
      posX += ((ts - lastTs) / 1000) * 150;
    }

    lastTs = ts;
    window.requestAnimationFrame(doDrawing);
  };

  window.requestAnimationFrame(doDrawing);
}

type Props = {
  deviceId: DeviceID;
};

const startedFor: {[k: number]: boolean} = {};

const Waveform = ({deviceId}: Props) => {
  const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas === null) {
      return;
    }

    if (startedFor[deviceId]) {
      return;
    }

    startedFor[deviceId] = true;

    drawScrollingWaveform(deviceId, canvas);
  };

  return <canvas ref={handleCanvasRef} />;
};

export default Waveform;
