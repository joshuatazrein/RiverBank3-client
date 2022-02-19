import React from 'react';
import './Task.css';
import $ from 'jquery';
import * as display from '../../services/display';
import * as edit from '../../services/edit';
import * as util from '../../services/util';
import TaskList from '../TaskList/TaskList';
import List from '../List/List';

export default class Task extends React.Component {
  constructor(props) {
    super();
    this.state = {
      info: props.info, title: props.title,
      subtasks: props.subtasks.filter(x =>
        window.data.tasks[util.stripR(x)]), parent: props.parent,
      id: props.id, displayOptions: 'hide', riverTask: false,
      zoomed: '', minHeight: 1
    };
    // TODO
    if (!this.state.info.startDate) this.state.info.startDate = ['--', '--'];
    if (!this.state.info.endDate) this.state.info.endDate = ['--', '--'];
    if (!this.state.info.notes) this.state.info.notes = '';
    if (!this.state.info.type) {
      if (props.parent instanceof List &&
        util.getFrame(props.parent).props.id === 'river') {
        this.state.info.type = 'event';
      } else {
        this.state.info.type = 'date';
      }
    };
    if (!this.state.info.collapsed) this.state.info.collapsed = '';
    if (!this.state.info.excludes) this.state.info.excludes = [];
  }
  displayOptions(ev, showHide) {
    edit.save(this);
    if (this.freeze === true) return;
    if (window.selected !== this) {
      edit.selectTask(this);
    }
    if (this.editBar.current) {
      this.editBar.current.focus();
    }
    if ($(ev.target).hasClass('options') ||
      $(ev.target).parent().hasClass('options')) {
      return
    }
    if (showHide === 'hide' || this.state.displayOptions === 'show') {
      this.setState({ displayOptions: 'hide' });
      if (
        this.props.parent instanceof List && 
        util.getFrame(this).props.id === 'river'
      ) {
        this.props.parent.forceUpdate();
      }
    } else if (showHide === 'show' || this.state.displayOptions === 'hide') {
      this.setState({ displayOptions: 'show' });
    }
  }
  changeTitle(ev) {
    this.setState({ title: ev.target.value });
    this.updateHeight();
  }
  updateHeight() {
    if (this.resizable !== false) {
      this.editBar.current.style.height = '0px';
      this.editBar.current.style.height =
        (this.editBar.current.scrollHeight) + "px";
      this.resizable = false;
    }
    setTimeout(() => this.resizable = true, 100);
  }
  updateRiverDate(type, action) {
    // remove from startdates/deadlines
    var date = new Date();
    var deadlineData;
    if (type === 'start') {
      if (this.state.info.startDate.includes('--')) return;
      deadlineData = window.app.current.state.startdates;
      date.setMonth(this.state.info.startDate[0] - 1);
      date.setDate(this.state.info.startDate[1]);
    } else if (type === 'end') {
      if (this.state.info.endDate.includes('--')) return;
      deadlineData = window.app.current.state.deadlines;
      date.setMonth(this.state.info.endDate[0] - 1);
      date.setDate(this.state.info.endDate[1]);
    }
    var dateString = date.toDateString();
    if (action === 'add') {
      if (!deadlineData[dateString]) {
        deadlineData[dateString] = [this.props.id]
      }
      else { deadlineData[dateString].push(this.props.id) }
    } else if (action === 'remove') {
      if (!deadlineData[dateString]) return
      else {
        deadlineData[dateString].splice(deadlineData[dateString].findIndex(
          x => x === this.props.id), 1)
      };
    }
    // add to the things
    if (type === 'start') {
      window.app.current.setState({ startdates: { ...deadlineData } });
      edit.saveSetting('startdates', deadlineData);
    } else if (type === 'end') {
      window.app.current.setState({ deadlines: { ...deadlineData } });
      edit.saveSetting('deadlines', deadlineData);
    }
  }
  toggleComplete(change) {
    let status = this.state.info.complete
    if (status === 'complete') { 
      status = '';
      if (this.state.info.type === 'date') {
        this.updateRiverDate('start', 'add');
        this.updateRiverDate('end', 'add');
      }
    }
    else {
      status = 'complete';
      if (this.state.info.type === 'date') {
        this.updateRiverDate('start', 'remove');
        this.updateRiverDate('end', 'remove');
      }
      display.playSound(window.app.current.state.popSnd);
    }
    // excludes lets it put it in complete
    const repeats = window.app.current.state.river.current.state.repeats;
    let repeating = false;
    let parent = this.props.parent; /// find list it's in
    while (!parent instanceof List) {
      parent = parent.props.parent;
    }
    const excludes = this.state.info.excludes;
    for (let x of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      if (repeats[x].includes('R' + util.stripR(this.props.id))) {
        repeating = true;
        if (!excludes.includes(parent.state.title)) {
          excludes.push(parent.state.title);
          break;
        } else {
          excludes.splice(excludes
            .findIndex(x => x === parent.state.title), 1);
          break;
        }
      }
    }
    if (repeating === true) {
      this.setState({ info: { ...this.state.info, excludes: excludes } })
    } else {
      this.setState(prevState => ({
        info: { ...prevState.info, complete: status }
      }));
    }
    if (change !== false) {
      this.displayOptions('hide');
    }
  }
  toggleImportant(change) {
    let status = this.state.info.important
    if (status === 'important') { status = '' }
    else { status = 'important' }
    this.setState(prevState => ({
      info: { ...prevState.info, important: status, maybe: '' }
    }));
    if (change !== false) {
      this.displayOptions('hide');
    }
  }
  toggleMaybe(change) {
    let status = this.state.info.maybe
    if (status === 'maybe') { status = '' }
    else { status = 'maybe' }
    this.setState(prevState => ({
      info: { ...prevState.info, maybe: status, important: '' }
    }));
    if (change !== false) {
      this.displayOptions('hide');
    }
  }
  toggleCollapse() {
    let status = this.state.info.collapsed
    if (status === 'collapsed') { status = '' }
    else { status = 'collapsed' }
    this.setState(prevState => ({
      info: { ...prevState.info, collapsed: status }
    }), display.updateAllSizes);
    this.displayOptions('hide');
  }
  hasRepeats = () => {
    let repeating = false;
    for (let repeat of Object.keys(window.data.settings.repeats)) {
      if (window.data.settings.repeats[repeat].includes('R' +
        util.stripR(this.props.id))) {
        repeating = true;
        break;
      }
    }
    return repeating;
  }
  deleteThis(removeData) {
    if (this.hasRepeats()) {
      const permission = window.confirm(
        'This will delete all repeats.\n(Complete task to hide only this one)');
      if (!permission) { return; }
    }
    // TODO: remove deadline, repeat & startdate 
    // [[don't use global variable]]
    let parent = this.props.parent;
    while (parent.props.parent) {
      parent = parent.props.parent;
    }
    const subtasks = this.state.parent.state.subtasks;
    const currentTask = subtasks.findIndex(x => x === this.props.id);
    subtasks.splice(currentTask, 1);
    window.selected = this.state.parent;
    window.preventSelect = true;
    this.state.parent.setState({ subtasks: subtasks });
    if (removeData !== false) {
      this.updateRiverDate('start', 'remove');
      this.updateRiverDate('end', 'remove');
      this.toggleRepeat('all', true);
      delete window.data.tasks[util.stripR(this.props.id)];
    }
    setTimeout(() => {
      edit.saveUndo();
      window.preventSelect = false
      edit.save(this.props.parent, 'list');
    }, 200);
  }
  componentDidMount() {
    this.editBar.current.focus();
    setTimeout(
      () => {
        if (this.editBar.current) this.updateHeight();
      }, 50
    )
    edit.selectTask(this);
    this.resizable = true;
  }
  dateRender = (type) => {
    var info;
    if (type === 'start') {
      info = this.state.info.startDate.concat();
    } else if (type === 'end') {
      info = this.state.info.endDate.concat();
    }
    if (this.state.info.type === 'event') {
      if (type === 'start') {
        let end;
        if (info[0] >= 12) end = 'p';
        else end = 'a';
        if (info[0] > 12) { info[0] -= 12 }
        return info[0] + ':' + String(info[1]).padStart(2, 0) + end;
      } else if (type === 'end') {
        let string = '';
        if (info[0] !== 0) string += info[0] + 'h';
        if (info[1] !== 0) string += info[1] + 'm';
        return string;
      }
    } else if (this.state.info.type === 'date') {
      return info[0] + '-' + info[1];
    }
  }
  toggleRepeat = (dayInput, del) => {
    var days;
    if (dayInput === 'all') {
      days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      days = [dayInput];
    }
    let repeatId;
    if (this.props.id.charAt(0) === 'R') {
      repeatId = this.props.id;
    } else {
      repeatId = 'R' + this.props.id;
    }
    const repeats = { ...window.app.current.state.river.current.state.repeats };
    for (let day of days) {
      if (repeats[day].includes(repeatId) || del === true) {
        if (repeats[day].includes(repeatId)) {
          repeats[day].splice(repeats[day]
            .findIndex(x => x === repeatId), 1);
        }
      } else {
        repeats[day].push(repeatId);
      }
    }
    window.app.current.state.river.current.setState({
      repeats: repeats
    });
    edit.saveSetting('repeats', repeats);
  }
  timeDrag = (ev, unit, type) => {
    var mouseup = () => {
      window.removeEventListener('mousemove', changeTime);
      window.app.current.setState({ disableSelect: '' });
      if (unit === 'e' || this.state.info.type === 'event') {
        this.displayOptions('hide');
      } else if (unit === 's') {
        this.setState({ displayOptions: 'show' });
      } 
      this.freeze = true;
      setTimeout(() => this.freeze = false, 200);
      window.removeEventListener('mouseup', mouseup);
      this.props.parent.forceUpdate();
    }
    window.addEventListener('mouseup', mouseup);
    var change = 10;
    var pageY = ev.screenY;
    var updateTime = (ev2, value, unit) => {
      let val;
      let date;
      let infoOrig;
      let orig2;
      if (this.state.info.type === 'event') {
        if (type === 'start') {
          infoOrig = this.state.info.startDate[1];
          orig2 = this.state.info.startDate[0];
        } else if (type === 'end') {
          infoOrig = this.state.info.endDate[1];
          orig2 = this.state.info.endDate[0];
        }
        if (infoOrig === '--') {
          infoOrig = 0;
        }
        if (orig2 === '--' && type === 'end') {
          orig2 = 0;
        } else if (orig2 === '--' && type === 'start') {
          orig2 = new Date().getHours();
        }
        let change;
        if (ev2.shiftKey) {
          change = value * 5;
        } else {
          change = value * 30;
        }
        val = infoOrig + change;
        if (val >= 60) {
          val = 0;
          orig2 += 1;
        } else if (val < 0) {
          val = 60 + change;
          orig2 -= 1;
        }
        if (type === 'end') {
          if (orig2 >= 24 || orig2 < 0) {
            val = '--';
            orig2 = '--';
            window.removeEventListener('mousemove', changeTime);
          }
        } else if (type === 'start') {
          if (orig2 == 3) {
            val = '--';
            orig2 = '--';
            window.removeEventListener('mousemove', changeTime);
          }
        }
        if (type === 'start') {
          this.setState({
            info: {
              ...this.state.info,
              startDate: [orig2, val]
            }
          });
        } else if (type === 'end') {
          this.setState({
            info: {
              ...this.state.info,
              endDate: [orig2, val]
            }
          });
        }
      } else {
        // dates
        this.updateRiverDate(type, 'remove');
        if (unit === 's') {
          if (type === 'start') {
            infoOrig = this.state.info.startDate[0];
            orig2 = this.state.info.startDate[1];
          } else if (type === 'end') {
            infoOrig = this.state.info.endDate[0];
            orig2 = this.state.info.endDate[1];
          }
          if (infoOrig === '--' || Number.isNaN(infoOrig)) {
            infoOrig = new Date().getMonth() + 1;
          }
          if (orig2 === '--' || Number.isNaN(orig2)) {
            orig2 = 1;
          }
          val = infoOrig + value;
          if (val === new Date().getMonth() && value < 0) {
            val = '--';
            orig2 = '--';
          } else {
            date = new Date();
            date.setMonth(val - 1);
            val = date.getMonth() + 1;
          }
          if (type === 'start') {
            this.setState({
              info: {
                ...this.state.info,
                startDate: [val, orig2]
              }
            });
          } else if (type === 'end') {
            this.setState({
              info: {
                ...this.state.info,
                endDate: [val, orig2]
              }
            });
          }
        } else if (unit === 'e') {
          if (type === 'start') {
            infoOrig = this.state.info.startDate[1];
            orig2 = this.state.info.startDate[0];
          } else if (type === 'end') {
            infoOrig = this.state.info.endDate[1];
            orig2 = this.state.info.endDate[0];
          }
          if (infoOrig === '--' || Number.isNaN(infoOrig)) {
            infoOrig = new Date().getDate();
          }
          if (orig2 === '--' || Number.isNaN(orig2)) {
            orig2 = new Date().getMonth() + 1;
          }
          val = infoOrig + value;
          date = new Date();
          date.setMonth(orig2 - 1);
          date.setDate(val);
          date.setHours(0); date.setSeconds(0); date.setMilliseconds(0);
          const today = new Date();
          today.setDate(today.getDate() - 1);
          today.setHours(0); today.setSeconds(0); today.setMilliseconds(0);
          if (date.getTime() === today.getTime() && value < 0) {
            if (type === 'start') {
              this.setState({
                info: {
                  ...this.state.info,
                  startDate: ['--', '--']
                }
              });
            } else if (type === 'end') {
              this.setState({
                info: {
                  ...this.state.info,
                  endDate: ['--', '--']
                }
              });
            }
            return;
          }
          if (type === 'start') {
            this.setState({
              info: {
                ...this.state.info,
                startDate: [date.getMonth() + 1, date.getDate()]
              }
            });
          } else if (type === 'end') {
            this.setState({
              info: {
                ...this.state.info,
                endDate: [date.getMonth() + 1, date.getDate()]
              }
            });
          }
        }
        if (type === 'start' && !this.state.info.startDate.includes('--')) {
          this.updateRiverDate(type, 'add');
        } else if (type === 'end' && !this.state.info.endDate.includes('--')) {
          this.updateRiverDate(type, 'add');
        }
      }
    }
    var changeTime = (ev) => {
      var changeTime = false;
      if (ev.screenY < pageY - change) {
        pageY -= change;
        changeTime = -1;
      } else if (ev.screenY > pageY + change) {
        pageY += change;
        changeTime = 1;
      }
      if (changeTime !== false) {
        updateTime(ev, changeTime, unit);
      }
    }
    window.app.current.setState({ disableSelect: 'disable-select' });
    window.addEventListener('mousemove', changeTime);
  }
  isComplete = () => {
    let completed = this.state.info.complete;
    let parent = this.props.parent;
    // hacking completed for repeats
    while (!parent instanceof List) {
      parent = parent.props.parent;
    }
    if (this.state.info.excludes.includes(parent.state.title)) {
      completed = 'complete';
    }
    return completed;
  }
  dropTask = (ev, type) => {
    if (window.draggedTask.props.id === this.props.id) return;
    edit.selectTask(window.draggedTask);
    const listParent = window.selected.props.parent;
    edit.cutTask();
    edit.save(listParent, 'list');
    window.preventSelect = false;
    setTimeout(() => {
      edit.selectTask(this);
      if (type === 'subtask') {
        edit.pasteTask('task');
      } else if (type === 'task') {
        edit.pasteTask();
      }
    }, 100);
    this.setState({
      taskDrop: false,
      subtaskDrop: false,
    })
    ev.stopPropagation();
  }
  render() {
    // fuck react
    this.displayOptions = this.displayOptions.bind(this);
    this.toggleComplete = this.toggleComplete.bind(this);
    this.toggleImportant = this.toggleImportant.bind(this);
    this.toggleMaybe = this.toggleMaybe.bind(this);
    this.deleteThis = this.deleteThis.bind(this);
    this.updateHeight = this.updateHeight.bind(this);
    this.taskList = React.createRef();
    this.optionsButton = React.createRef();
    this.editBar = React.createRef();
    this.infoInput = React.createRef();
    this.infoArea = React.createRef();
    const headingClass = this.state.subtasks.length > 0 ?
      'heading' : '';
    if (this.editBar.current) {
      this.editBar.current.style.height = '0px';
      this.editBar.current.style.height =
        (this.editBar.current.scrollHeight) + "px";
    }
    let parent = this;
    let id = [];
    while (parent) {
      id.push(parent.props.id);
      parent = parent.props.parent;
    }
    id = id.reverse().join('-');
    const hasTimes = this.state.info.type === 'event' &&
      !this.state.info.startDate.includes('--');
    let repeatsOn = {};
    for (let day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      if (window.data.settings.repeats[day].map(x => util.stripR(x)).includes(
        util.stripR(this.props.id))) {
        repeatsOn[day] = 'repeatOn';
      } else {
        repeatsOn[day] = '';
      }
    }
    let completed = this.isComplete();
    const amPmFormat = (hours) => {
      if (hours === '--') return hours;
      if (hours > 12) return hours - 12;
      else return hours;
    }
    let startExtra;
    let endExtra;
    if (this.state.info.type === 'event') {
      // am/pm
      if (!this.state.info.startDate.includes('--')) {
        if (this.state.info.startDate[0] >= 12) startExtra = 'p';
        else startExtra = 'a';
      }
    }
    else {
      // date
      const getWeekday = (list) => {
        const weekdaysDict = {
          1: 'M', 2: 'T', 3: 'W', 4: 'R', 5: 'F', 6: 'S', 0: 'U'
        };
        const date = new Date();
        date.setMonth(list[[0]] - 1);
        date.setDate(list[1]);
        return weekdaysDict[date.getDay()];
      }
      if (!this.state.info.startDate.includes('--')) {
        startExtra = getWeekday(this.state.info.startDate);
      }
      if (!this.state.info.endDate.includes('--')) {
        endExtra = getWeekday(this.state.info.endDate);
      }
    } 
    const openDrag = (ev) => {
      $(container.current).attr('draggable', 'true');
    }
    const closeDrag = (ev) => {
      $(container.current).attr('draggable', 'false');
    }
    const startDrag = (ev) => {
      // enabling drag & drop: only select target with matching title
      // const dragId = $(ev.target).attr('dragid');
      // if (this.props.id === dragId) {
      // }
      // only drag it if it's possible to be dragged
      window.draggedTask = this;
      ev.stopPropagation();
    }
    const dragOver = (ev) => {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'all';
    }
    const container = React.createRef();
    return (
      <>
      <li className={'task ' + this.state.info.important +
        ' ' + completed +
        ' ' + this.state.info.maybe +
        ' ' + headingClass +
        ' ' + this.state.info.type +
        ' ' + this.state.info.collapsed +
        ' ' + this.state.zoomed}
        onClick={() => { edit.selectTask(this) }} 
        onContextMenu={() => edit.selectTask(this) }
        style={{minHeight: this.state.minHeight * 1.15 * 30}}
        onDragOver={dragOver}
      >
        <textarea className='infoArea' 
        ref={this.infoArea}
        onKeyDown={(ev) => {
          if (ev.key === 'Escape') {
            $(this.infoArea.current).hide();
            setTimeout(() => window.preventReturn = false, 100);
          }
        }}
        onChange={() => {
          this.setState({
            info: {
              ...this.state.info,
              notes: this.infoArea.current.value
            }
          })
        }}
        value={this.state.info.notes}
        ></textarea>
        <div className='taskContent' ref={container}
          onDragStart={startDrag}>
          <div className={'options ' + this.state.displayOptions}>
            <div className='buttonBar' style={{
              width: '100%',
              justifyContent: 'space-around',
              flexWrap: 'nowrap',
            }}>
              <div className='buttonBar'>
                <button
                  title='toggle complete'
                  className={'button ' + this.state.info.complete}
                  onClick={this.toggleComplete}>
                  √</button>
                <button
                  title='toggle important'
                  className={'button ' + this.state.info.important}
                  onClick={this.toggleImportant}>
                  !</button>
                <button
                  title='toggle maybe'
                  className={'button ' + this.state.info.maybe}
                  onClick={this.toggleMaybe}>
                  ?</button>
                <button
                  title='toggle fold'
                  className={'button'}
                  onClick={() => this.toggleCollapse()}>
                  {'[]'}</button>
              </div>
              <div className='buttonBar'>
                <button className={'button ' + repeatsOn['Mon']}
                  onClick={() => { this.toggleRepeat('Mon'); }}>M</button>
                <button className={'button ' + repeatsOn['Tue']}
                  onClick={() => {
                    this.toggleRepeat('Tue');
                  }}>T</button>
                <button className={'button ' + repeatsOn['Wed']}
                  onClick={() => {
                    this.toggleRepeat('Wed');
                  }}>W</button>
                <button className={'button ' + repeatsOn['Thu']}
                  onClick={() => {
                    this.toggleRepeat('Thu');
                  }}>R</button>
                <button className={'button ' + repeatsOn['Fri']}
                  onClick={() => {
                    this.toggleRepeat('Fri');
                  }}>F</button>
                <button className={'button ' + repeatsOn['Sat']}
                  onClick={() => {
                    this.toggleRepeat('Sat');
                  }}>S</button>
                <button className={'button ' + repeatsOn['Sun']}
                  onClick={() => {
                    this.toggleRepeat('Sun');
                  }}>U</button>
              </div>
            </div>
              <div className='timeDiv buttonBar' style={{
                flexWrap: 'nowrap',
              }}>
                <button className='button timeSwitch'
                  onClick={() => {
                    var changeValue = this.state.info.type === 'event' ?
                      'date' : 'event';
                    this.setState({
                      info: {
                        ...this.state.info,
                        type: changeValue,
                        startDate: ['--', '--'],
                        endDate: ['--', '--'],
                      }
                    })
                  }}>
                  {this.state.info.type}
                </button>
                <span className='startSpan start'>
                  <span className='s' onMouseDown={(ev) => {
                    this.timeDrag(ev, 's', 'start');
                  }}>{
                    this.state.info.type === 'event' ?
                      amPmFormat(this.state.info.startDate[0]) :
                      this.state.info.startDate[0]
                  }</span>
                  <span className='m'>{
                    this.state.info.type === 'event' ? ':' : '/'
                  }</span>
                  <span 
                    className='e' 
                    onMouseDown={(ev) => {
                      this.timeDrag(ev, 'e', 'start');
                    }}
                  >
                    {this.state.info.type === 'event' ?
                      String(this.state.info.startDate[1]).padStart(2, 0) :
                      this.state.info.startDate[1]
                    }
                  </span>
                  {startExtra && 
                  <span className='startSpan extraInfo'>
                    {startExtra}
                  </span>}
                </span>
                <span className='startSpan end'>
                  <span className='s' onMouseDown={(ev) => {
                    this.timeDrag(ev, 's', 'end');
                  }}>{this.state.info.endDate[0]}</span>
                  <span className='m'>{
                    this.state.info.type === 'event' ? 'h' : '/'
                  }</span>
                  <span className='e' onMouseDown={(ev) => {
                    this.timeDrag(ev, 'e', 'end');
                  }}>{this.state.info.endDate[1]}</span>
                  <span>{this.state.info.type === 'event' ?
                    'm' : ''}</span>
                  {endExtra && 
                  <span className='startSpan extraInfo'>
                    {endExtra}
                  </span>}
                </span>
                <input ref={this.infoInput} className='infoSpan' placeholder='notes'
                  style={{ marginLeft: '5px' }}
                  value={this.state.info.notes}
                  onChange={() => {
                    this.setState({
                      info: {
                        ...this.state.info,
                        notes: this.infoInput.current.value
                      }
                    })
                  }}></input>
                <button className='button' onClick={() => {
                  $(this.infoArea.current).show();
                  window.preventReturn = true;
                }} title='expand notes to paragraph'>+</button>
              </div>
          </div>
          {!hasTimes ? 
            <span className='info'
              onClick={(ev) => this.displayOptions(ev)}
              ref={this.optionsButton}
              onMouseDown={openDrag}
              onMouseUp={closeDrag}>
            </span> :
            <span className='startDate'
              onClick={(ev) => this.displayOptions(ev)}
              ref={this.optionsButton}
              onMouseDown={(ev) => {
                this.timeDrag(ev, 's', 'start')
              }}>
              {this.dateRender('start')}
            </span>}
          <textarea className='editBar' value={this.state.title}
            onChange={(ev) => this.changeTitle(ev)} ref={this.editBar}
            spellCheck='false' onClick={(ev) => this.displayOptions(ev, 'hide')}></textarea>
          {this.state.info.notes.length === 0 &&
            <div style={{
              display: 'flex', flexDirection: 'column',
              marginRight: '5px'
            }}>
              {!hasTimes &&
                !this.state.info.startDate.includes('--') &&
                <span className='startDate'>
                  {this.dateRender('start')}
                </span>}
              {!this.state.info.endDate.includes('--') &&
                <span className='endDate'>
                  {this.dateRender('end')}
                </span>}
            </div>
          }
        </div>
        {this.state.info.notes.length > 0 &&
        <div className='taskInfo'>
          {this.state.info.notes.length > 0 &&
            <span className='notesSpan'>
              {this.state.info.notes.length > 50 ?
                this.state.info.notes.slice(0, 50) + '...' :
                this.state.info.notes}
            </span>}
          {!hasTimes &&
            !this.state.info.startDate.includes('--') &&
            <span className='startDate'>
              {this.dateRender('start')}
            </span>}
          {!this.state.info.endDate.includes('--') &&
            <span className='endDate'>
              {this.dateRender('end')}
            </span>}
        </div>}
        <div 
          className={`dropArea ${this.state.subtaskDrop ? 'droppable' : ''}`}
          onDragEnter={() => {
            if (window.draggedTask.props.id === this.props.id) return;
            this.setState({subtaskDrop: true})
          }}
          onDragLeave={() => this.setState({subtaskDrop: false})}
          onDrop={(ev) => this.dropTask(ev, 'subtask')}
        ></div>
        <TaskList 
          ref={this.taskList} 
          subtasks={this.state.subtasks}
          parent={this} 
        />
      </li>
      <div 
        className={`dropArea ${this.state.taskDrop ? 'droppable' : ''}
          ${completed}`}
        onDragEnter={() => {
          if (window.draggedTask.props.id === this.props.id) return;
          this.setState({taskDrop: true})
        }}
        onDragLeave={() => this.setState({taskDrop: false})}
        onDrop={(ev) => this.dropTask(ev, 'task')}
        onDragOver={dragOver}
      ></div>
      </>
    )
  }
}