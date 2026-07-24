import React, { Component } from 'react';
import clsx from 'clsx';
// import logo from './logo.svg';
import './App.css';

const pad = (n) => (n < 10)? `0${n}` : n;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      t: 5400,
      initialT: 5400,
      paused: true,
      fullscreen: false,
      adjusting: false,
      editing: null, // minute, second, null
      showCursor: false,
    }
    this.timer = null;
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.tick();
    }, 500);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillMount() {
    clearInterval(this.timer);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  tick() {
    const { paused, showCursor, editing } = this.state;
    if (editing) {
      this.setState({ showCursor: !showCursor });
    }
    if (paused) return;
    this.setState((prevState) => {
      const t = prevState.t - 0.5;
      if (t <= 0) {
        return {
          t: 0,
          paused: true,
        }
      } else {
        return {
          t,
        }
      }
    });
  }

  toggleFullScreen = () => {
    const { fullscreen } = this.state;
    if (!fullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
      }
    }
    this.setState({ fullscreen: !fullscreen });
  }

  resetTimer = () => {
    this.setState({
      t: 5400,
      initialT: 5400,
      paused: true
    });
  }

  pauseTimer = () => {
    this.setState((prevState) => ({
      paused: !prevState.paused,
      editing: false,
    }))
  }

  toggleEditing = () => {
    const { editing } = this.state;
    this.setState({
      editing: editing ? null : 'second',
    });
  }

  handleCursorMove(direction) {
    const state = { ...this.state };
    state.paused = true;
    switch (direction) {
      case 'up':
      case 'down':
        if (!state.editing) {
          state.editing = 'second';
        }
        if (state.editing === 'hour') {
          state.t += (direction === 'up' ? 1 : -1) * 3600;
        }
        if (state.editing === 'minute') {
          state.t += (direction === 'up' ? 1 : -1) * 60;
        }
        if (state.editing === 'second') {
          state.t += (direction === 'up' ? 1 : -1);
        }
        if (state.t < 0) {
          state.t = 0;
        }
        state.initialT = state.t;
        break;
      case 'left':
        if (!state.editing) {
          state.editing = 'hour';
        }
        else if (state.editing === 'hour') {
          state.editing = 'second';
        }
        else if (state.editing === 'minute') {
          state.editing = 'hour';
        }
        else if (state.editing === 'second') {
          state.editing = 'minute';
        }
        break;
      case 'right':
        if (!state.editing) {
          state.editing = 'second';
        }
        else if (state.editing === 'hour') {
          state.editing = 'minute';
        }
        else if (state.editing === 'minute') {
          state.editing = 'second';
        }
        else if (state.editing === 'second') {
          state.editing = 'hour';
        }
        break;
      default:
        break;
    }
    this.setState(state);
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'F':
      case 'f':
        this.toggleFullScreen();
        break;
      case 'R':
      case 'r':
        this.resetTimer();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleCursorMove(event.key.toLowerCase().replace('arrow', ''))
        break;
      case 'Enter':
        this.toggleEditing();
        break;
      case ' ':
        this.pauseTimer();
        break;
      default:
        break;
    }
  }

  render() {
    const { t, initialT, paused, editing, showCursor, fullscreen } = this.state;
    const second = parseInt(t % 60);
    const minute = parseInt((t / 60) % 60);
    const hour = parseInt(t / 3600);
    const percent = initialT > 0 ? (t / initialT) * 100 : 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percent / 100);
    return (
      <div className="App">
        <div className="timer-label">Time left:</div>
        <div
          className={clsx('clock', { 'show-cursor': showCursor })}
          onDoubleClick={() => this.toggleFullScreen()}
        >
          <span className={clsx('time hour', { editing: editing === 'hour' })}>{pad(hour)}</span>
          :
          <span className={clsx('time minute', { editing: editing === 'minute' })}>{pad(minute)}</span>
          :
          <span className={clsx('time second', { editing: editing === 'second' })}>{pad(second)}</span>
        </div>
        <div className="progress-ring-container">
          <svg className="progress-ring" viewBox="0 0 180 180">
            <circle className="progress-ring-bg" cx="90" cy="90" r={radius} />
            <circle
              className="progress-ring-fill"
              cx="90"
              cy="90"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
            <text className="progress-ring-text" x="90" y="90">{Math.round(percent)}%</text>
          </svg>
        </div>
        <ul className="tips">
          <li>
            <button onClick={this.toggleFullScreen}>F</button>
            -
            <span className="tip">{fullscreen ? 'exit': 'enter'} fullscreen</span>
          </li>
          <li>
            <button onClick={() => this.handleCursorMove('left')}>←</button>
            <button onClick={() => this.handleCursorMove('right')}>→</button>
            <button onClick={() => this.handleCursorMove('up')}>↑</button>
            <button onClick={() => this.handleCursorMove('down')}>↓</button>
            -
            <span className="tip">edit timer</span>
          </li>
          <li>
            <button onClick={this.resetTimer}>R</button>
            -
            <span className="tip">reset timer</span>
          </li>
          <li>
            <button onClick={this.pauseTimer}>Space</button>
            -
            <span className="tip">{paused ? 'start' : 'pause'} timer</span>
          </li>
        </ul>
      </div>
    );
  }
}

export default App;
