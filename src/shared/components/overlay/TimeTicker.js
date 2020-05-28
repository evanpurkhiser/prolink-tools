import React from 'react';

class TimeTicker extends React.Component {
  componentDidMount() {
    this.tick();
  }

  componentWillUnmount() {
    clearTimeout(this.ticker);
  }

  tick() {
    const [start, end] = this.props.randomRange;
    const interval = 1000 * (Math.floor(Math.random() * end) + start);
    this.ticker = setTimeout(_ => this.forceUpdate(this.tick), interval);
  }

  render() {
    return this.props.render();
  }
}

export default TimeTicker;
