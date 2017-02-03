import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

const Metadata = (track) => {
  if (track === undefined || Object.keys(track).length === 0) {
    return <div className="metadata empty" />;
  }

  let artwork = <div className="artwork">
    <img src={track.artwork} />
  </div>;

  if (!track.artwork) {
    artwork = <div className="artwork blank"></div>;
  }

  return <div className="metadata">
    <div className="new-track-indicator">
      Next track selected — Last track shown
    </div>
    {artwork}
    <div className="details">
      <div className="title">{track.title}</div>
      <div className="artist">{track.artist}</div>
      <div className="album">{track.album}</div>
      <div className="release">
        <span className="label">{track.label}</span>
        <span className="catalog-num">{track.release}</span>
      </div>
    </div>
  </div>;
}

const PlayerStatus = (info) => {
  const {bpm, pitch} = info;

  const currentBPM = ((pitch / 100) * bpm) + bpm;
  const pitchSign  = pitch > 0 ? '+' : (pitch < 0 ? '−' : '');

  const bpmDetails = bpm === undefined ? null : <span>
    <span className="bpm-original">{bpm.toFixed(1)}</span>
    <span className="bpm-pitch-sign">{pitchSign}</span>
    <span className="bpm-pitch">{Math.abs(pitch).toFixed(2)}%</span>
  </span>;

  return <div className="player-info">
    <div className="bpm-current">
      {currentBPM.toFixed(1)}
    </div>
    <div className="bpm-details">
      {bpmDetails}
    </div>
    <div className={["play-state", info.play_state].join(' ')}>
      {info.play_state}
    </div>
    <div className={["on-air", info.on_air ? "true" : "false"].join(' ')}>
      {info.on_air ? "on-air" : "off-air"}
    </div>
    <div className={["synced", info.synced ? "true" : "false"].join(' ')}>
      {info.synced ? 'sync on' : 'sync off'}
    </div>
  </div>;
};

const MetadataAnimateWrapper = (props) => {
  return <div className="metadata-animate-wrapper">
    {props.children}
  </div>
};

export default props => <div
  className={['player', props.status].join(' ')}>
  <ReactCSSTransitionGroup
    component={MetadataAnimateWrapper}
    transitionName="metadata-changed"
    transitionEnterTimeout={2000}
    transitionLeaveTimeout={2000}>
    <Metadata key={props.metadata && props.metadata.id} {...props.metadata} />
  </ReactCSSTransitionGroup>
  <PlayerStatus {...props.info} />
</div>;
