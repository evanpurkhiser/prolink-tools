import React from 'react';

type Props = {
  randomRange: [number, number];
  children: () => React.ReactNode;
};

class TimeTicker extends React.Component<Props> {
  ticker = 0;

  componentDidMount() {
    this.tick();
  }

  componentWillUnmount() {
    clearTimeout(this.ticker);
  }

  tick() {
    const [start, end] = this.props.randomRange;
    const interval = 1000 * (Math.floor(Math.random() * end) + start);
    this.ticker = window.setTimeout(() => this.forceUpdate(this.tick), interval);
  }

  render() {
    return this.props.children();
  }
}

export default TimeTicker;
