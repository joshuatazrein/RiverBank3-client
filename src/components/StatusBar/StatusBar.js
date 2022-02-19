import React from 'react';
import './StatusBar.css';
import timerSnd from '../../assets/snd/timer.mp3';
import startSnd from '../../assets/snd/start.mp3';
import * as display from '../../services/display';
import * as edit from '../../services/edit';
import * as util from '../../services/util';
import * as saving from '../../services/saving';
import $ from 'jquery';

export default class StatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchString: '', foundTasks: {} };
  }
  search(ev) {
    if (this.state.searchString === '') {
      this.searches = { ...window.data.tasks };
    }
    this.setState({ searchString: ev.target.value });
    for (let x of Object.keys(this.searches)) {
      if (!new RegExp(this.state.searchString, 'i').test(
        this.searches[x].title) ||
        this.searches[x].info.complete === 'complete') {
        delete this.searches[x];
      }
    }
    // id : {title, subtasks, info}
    this.setState({ foundTasks: this.searches });
  }
  goToSearch(id) {
    window.preventReturn = true;
    window.preventSelect = true;
    var idList = [id];
    function buildParents(otherId) {
      for (let x of Object.keys(window.data.tasks)) {
        if (window.data.tasks[util.stripR(x)].subtasks.includes(otherId)) {
          idList.splice(0, 0, x);
          buildParents(x);
          return;
        }
      }
    }
    buildParents(id);
    const frame = window.app.current.state[idList[0]].current;
    const listIndex = frame.state.subtasks.slice(frame.state.shownIndex)
      .findIndex(x => x === idList[1]);
    frame.changeIndex(frame.state.shownIndex + listIndex, true);
    this.setState({ searchString: '', foundTasks: {} });
    
    setTimeout(() => {
      const list = frame.frames[listIndex].current;
      let foundTask = list;
      let i = 2;
      while (idList.length > i) {
        // find in tasks starting at index 2 (if it's there)
        let taskId = idList[i];
        let taskIndex;
        if (foundTask.subtasksCurrent &&
          foundTask.subtasksCurrent.length > 0) {
          taskIndex = foundTask.subtasksCurrent
            .findIndex(x => x === taskId);
        } else {
          taskIndex = foundTask.state.subtasks
            .findIndex(x => x === taskId);
        }
        foundTask = foundTask.taskList.current
          .subtaskObjects[taskIndex].current;
        i++;
      }
      window.preventSelect = false;
      edit.selectTask(foundTask);
      
      // go through IDs and find the trace paths
      setTimeout(() => {
        window.preventReturn = false;
      }, 100);
    }, 100);
  }
  componentDidMount() {
    setTimeout(display.goToToday, 200);
  }
  goToFirst() {
    if ($(this.searchResults.current).children().length === 0) {
      console.log('zero length', $($(this.searchResults.current)
      .children()[0]).attr('value'));
      this.setState({ searchString: '', foundTasks: {} });
      return;
    }
    this.goToSearch($($(this.searchResults.current)
      .children()[0]).attr('value'));
  }
  tutorial = () => {
    this.setState({ tutorial: true });
    const myFunc = (ev) => {
      if (!$(ev.target).hasClass('tutorialShow')) {
        this.setState({ tutorial: false });
        $(window).off('click', myFunc);
      }
    }
    setTimeout(() => {
      $(window).on('click', myFunc)
    }, 100);
  }
  render() {
    this.search = this.search.bind(this);
    this.goToSearch = this.goToSearch.bind(this);
    this.goToFirst = this.goToFirst.bind(this);
    this.searchResults = React.createRef();
    this.searchBar = React.createRef();
    this.options = React.createRef();
    this.functions = React.createRef();
    this.move = React.createRef();
    this.upcoming = React.createRef();
    let deadlineItems = Object.keys(this.props.deadlines).filter(
      x => new Date(x).getTime() >= new Date().getTime()
    )
    deadlineItems = deadlineItems.map(x => (
      this.props.deadlines[x].map(y => [x, y])
    )).flat().filter(x => x.length > 0);
    this.functionsDict = {
      'newTask': edit.newTask,
      'newSubtask': () => edit.newTask("task"),
      'cutTask': edit.cutTask,
      'copyTask': edit.copyTask,
      'copyTaskTrue': () => edit.copyTask(true),
      'pasteTask': edit.pasteTask,
      'pasteTaskTask': () => edit.pasteTask('task'),
      'deleteTask': edit.deleteTask,
      'moveTaskUp': () => edit.moveTask(-1),
      'moveTaskDown': () => edit.moveTask(1),
      'switchView': () => display.switchView(1),
      'listEditMigrate': () => edit.listEdit('migrate'),
      'listEditClear': () => edit.listEdit('clear'),
      'displayTable': display.displayTable,
      'focus': display.focus,
      'zoom': display.zoom,
      'undo': edit.undo,
      'toggleComplete': () => window.app.current.toggleComplete(),
      'backup': saving.backup,
      'restore': saving.restore,
      'reset': saving.reset,
      'toggleSounds': display.toggleSounds,
      'toggleMode': display.toggleMode,
      'setThemeSpace': () => display.setTheme("space"),
      'setThemeSky': () => display.setTheme("sky"),
      'setThemeWater': () => display.setTheme("water"),
      'setThemeEarth': () => display.setTheme("earth"),
      'setThemeFire': () => display.setTheme("fire"),
      'indent': edit.indentTask,
      'unindent': () => edit.indentTask(true),
      'togglePast': () => {
        if (window.app.current.state.river.current.state.shownIndex !== 0) {
          window.app.current.state.river.current.setState({
            shownIndex: 0
          });
        } else {
          window.app.current.state.river.current.setState({
            shownIndex: window.app.current.state.river.current.todayIndex()
          });
        }
        display.goToToday();
      } 
    }
    return (
      <>
      <div className='statusBar'>
        <span className='title'><span className='r'>River</span>
          <span className='b'>Bank</span></span>
        <div style={{
          display: 'flex', flexDirection: 'column',
          position: 'relative'
        }}>
          <input
            ref={this.searchBar}
            className='searchBar' onChange={(ev) => this.search(ev)}
            value={this.state.searchString}
            onKeyDown={(ev) => {
              if (ev.key === 'Backspace') {
                ev.preventDefault();
                this.setState({ searchString: '', foundTasks: {} });
              } else if (ev.key === 'Enter') {
                ev.preventDefault();
                if ($(this.searchResults.current).children().length > 0) {
                  this.goToFirst();
                }
              }
            }}
            placeholder='search'></input>
          {this.state.searchString.length > 0 &&
            <select ref={this.searchResults}
              style={{ width: '5em' }}
              onChange={() => {
                this.goToSearch(this.searchResults.current.value)
              }}>
              {Object.keys(this.state.foundTasks).map(x =>
                <option key={x} value={x}>
                  {this.state.foundTasks[x].title}
                </option>)}
            </select>
          }
        </div>
        <Timer />
        <div className='buttonBar nowrap'>
          <select defaultValue='' ref={this.functions} style={{ width: '35px' }}
            onChange={() => {
              this.functionsDict[this.functions.current.value].call();
              this.functions.current.value = '';
            }}>
            <option value="" disabled hidden>edit</option>
            <option value='newTask'>
              new task (return)</option>
            <option value='newSubtask'>
              new subtask (shift-return)</option>
            <option value='cutTask'>
              cut (ctrl-x)</option>
            <option value='copyTask'>
              copy (ctrl-c)</option>
            <option value='copyTaskTrue'>
              mirror (ctrl-shift-C)</option>
            <option value='pasteTask'>
              paste (ctrl-v)</option>
            <option value='pasteTaskTask'>
              paste as subtask (ctrl-shift-V)</option>
            <option value="deleteTask">
              delete (ctrl-delete)</option>
          </select>
          <select defaultValue='' ref={this.move} style={{ width: '45px' }}
            onChange={() => {
              this.functionsDict[this.move.current.value].call();
              this.move.current.value = '';
            }}>
            <option value="" disabled hidden>move</option>
            <option value="moveTaskUp">
              move up (ctrl-w)</option>
            <option value="moveTaskDown">
              move down (ctrl-s)</option>
            <option value="indent">
              indent (ctrl-])</option>
            <option value='unindent'>
              unindent (ctrl-[)</option>
            <option value="switchView">
              following week/lists (ctrl-d)</option>
            <option value="switchView(-1)">
              previous week/lists (ctrl-a)</option>
            <option value="listEditMigrate">
              migrate date</option>
            <option value="listEditClear">
              clear list</option>
            <option value="displayTable">
              display as table</option>
            <option value="togglePast">
              show/hide past dates</option>
          </select>
          <select defaultValue='' ref={this.options} onChange={() => {
            this.functionsDict[this.options.current.value].call();
            this.options.current.value = '';
          }}
            style={{ width: '60px' }}>
            <option value="" disabled hidden>settings</option>
            <option value='focus'>focus on list (ctrl-f)</option>
            <option value='zoom'>focus on view (ctrl-shift-F)</option>
            <option value='toggleComplete'>
              show/hide complete (ctrl-h)</option>
            <option value='undo'>undo (ctrl-z)</option>
            <option value='backup'>backup</option>
            <option value='restore'>restore</option>
            <option value='reset'>reset</option>
            <option value='toggleSounds'>toggle sounds</option>
            <option value='toggleMode'>toggle day/night</option>
            <option value='setThemeSpace'>theme: space</option>
            <option value='setThemeSky'>theme: sky</option>
            <option value='setThemeWater'>theme: water</option>
            <option value='setThemeEarth'>theme: earth</option>
            <option value='setThemeFire'>theme: fire</option>
          </select>
          <ListMenu />
          <select defaultValue='' ref={this.upcoming} onChange={() => {
            this.goToSearch(this.upcoming.current.value);
            this.upcoming.current.value = '';
          }} style={{width: '75px'}}>
            <option value="" disabled hidden>upcoming</option>
            {deadlineItems.map(x => (
              <option value={util.stripR(x[1])}>
                {x[0].slice(0, x[0].length - 5)}: {
                window.data.tasks[util.stripR(x[1])].title}
              </option>
            ))}
          </select>
        </div>
        <span className='tutorialLink' onClick={this.tutorial}>help</span>
      </div>
      {this.state.tutorial && 
        <div className='tutorial tutorialShow'>
          <iframe src='https://www.youtube.com/embed/AcfqM2exBu0'>
          </iframe>
        </div>
      }
      </>
    )
  }
}

class ListMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { bankLists: props.bankLists, riverLists: props.riverLists };
  }
  goToList(type) {
    if (type === 'river') {
      display.searchDate(this.riverLister.current.value);
    } else if (type === 'bank') {
      var parent = window.app.current.state.bank.current;
      var list = this.bankLister;
      parent.changeIndex(Number(list.current.value), true);
    }

    if (type === 'river') {
      this.riverLister.current.value = '';
    } else if (type === 'bank') {
      this.bankLister.current.value = '';
    }
  }
  render() {
    this.riverLister = React.createRef();
    this.bankLister = React.createRef();
    return (
      <>
        <select defaultValue='' ref={this.bankLister} onChange={() => this.goToList('bank')}
          style={{ width: '35px' }}>
          <option value="" disabled hidden>lists</option>
          {window.data.tasks['bank'].subtasks.filter(
            x => window.data.tasks[x].title !== '--')
            .map((x, index) =>
              <option key={x} value={index}>{window.data.tasks[x].title}</option>)}
        </select>
        <select defaultValue='' ref={this.riverLister} onChange={() => {
          if (this.riverLister.current.value === 'today') {
            display.goToToday();
            this.riverLister.current.value = '';
          } else {
            this.goToList('river')
          }
        }}
          style={{ width: '45px' }}>
          <option value="" disabled hidden>dates</option>
          <option value='today'>today (ctrl-t)</option>
          {window.data.tasks['river'].subtasks.filter(x => new Date(
            window.data.tasks[x].title).getTime() >=
            new Date().getTime())
            .map((x) =>
              <option key={x} value={window.data.tasks[x].title}>
                {window.data.tasks[x].title}</option>)}
        </select>
      </>
    )
  }
}

class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 0,
      audio: new Audio(timerSnd),
      start: new Audio(startSnd),
      startTime: undefined,
      ended: false,
    };

  }
  startTimer(val) {
    const endTime =
      new Date(new Date().getTime() + val * 60 * 1000).getTime();
    this.setState({ endTime: endTime, seconds: val * 60 });
    display.playSound(this.state.start);
    this.play();
  }
  play(stopwatch, backwards) {
    Notification.requestPermission();
    clearInterval(this.interval);
    this.setState({ ended: false });
    if (stopwatch === 'stopwatch') {
      display.playSound(this.state.start);
      this.interval = setInterval(() => {
        this.setState({ seconds: this.state.seconds + 1 });
      }, 1000);
    } else {
      this.interval = setInterval(() => {
        this.setState({
          seconds: Math.ceil((this.state.endTime -
            new Date().getTime()) / 1000)
        });
        if (this.state.seconds <= 0 && this.state.ended === false) {
          this.end();
        }
      }, 1000);
    }
  }
  end() {
    this.setState({ play: true, ended: true });
    display.playSound(this.state.audio);
    this.options.current.value = '';
    new Notification('timer complete');
  }
  playPause() {
    clearInterval(this.interval);
    this.setState({ seconds: 0 });
    this.options.current.value = '';
  }
  render() {
    this.startTimer = this.startTimer.bind(this);
    this.playPause = this.playPause.bind(this);
    this.play = this.play.bind(this);
    this.audioRef = React.createRef();
    this.options = React.createRef();
    var timeReadout;
    if (this.state.seconds >= 0) {
      timeReadout = Math.floor(this.state.seconds / 60) + ':' +
        String(this.state.seconds -
          (Math.floor(this.state.seconds / 60) * 60))
          .padStart(2, '0')
    } else {
      if ((this.state.seconds / 60) === Math.floor(this.state.seconds / 60)
        && this.state.seconds !== 0) {
        // right on minute
        timeReadout = '-' +
          (-1 * (Math.floor(this.state.seconds / 60))) + ':00'
      } else {
        timeReadout = '-' +
          (-1 * (Math.floor(this.state.seconds / 60) + 1)) + ':' +
          String(60 - (this.state.seconds -
            (Math.floor(this.state.seconds / 60) * 60)))
            .padStart(2, '0')
      }
    }
    return (
      <>
        <input className='timerBar' readOnly={true}
          value={timeReadout}></input>
        <select value='' ref={this.options} onChange={() => {
          if (this.options.current.value === 'clear') {
            this.playPause();
            this.options.current.value = '';
          } else if (this.options.current.value === 'stopwatch') {
            this.setState({ seconds: 0 });
            this.play('stopwatch');
            this.options.current.value = '';
          } else {
            this.startTimer(this.options.current.value);
            this.options.current.value = '';
          }
        }}
          style={{ width: '45px' }}>
          <option value="" disabled hidden>timer</option>
          <option value={'clear'}>--:--</option>
          <option value={50}>50:00</option>
          <option value={25}>25:00</option>
          <option value={15}>15:00</option>
          <option value={10}>10:00</option>
          <option value={5}>5:00</option>
          <option value={'stopwatch'} title='stopwatch'>&infin;</option>
        </select>
      </>
    )
  }
}