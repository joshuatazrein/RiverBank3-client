import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as display from './services/display';
import * as keyComms from './services/keyComms';
import * as saving from './services/saving';
import * as util from './services/util';
import * as edit from './services/edit';
import SignIn from './components/SignIn/SignIn';
import App from './components/App/App.js';
import './style.css';

window.themes = {
  'earth-day': {
    "--font": "var(--fontSize) 'Quicksand', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "300",
    "--bold": "400",
    "--background": "rgb(218, 221, 216)",
    "--border": "rgba(60, 52, 31, 0.3)",
    "--select": "rgb(85, 107, 47)",
    "--event": "rgba(85, 107, 47, 0.3)",
    "--foreground": "rgb(59, 60, 54)",
    "--midground": "rgba(59, 60, 54, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(85, 107, 47, 0.5)",
    "--important": "rgba(59, 60, 54, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(14, 41, 48, 0.8)",
    "--endDate": "rgb(14, 41, 48)",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(59, 60, 54, 0.1)",
    "--river": "rgba(85, 107, 47, 0.1)",
  },
  'earth-night': {
    "--font": "var(--fontSize) 'Quicksand', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "300",
    "--bold": "400",
    "--background": "rgb(35, 38, 33)",
    "--border": "rgba(224, 223, 225, 0.3)",
    "--select": "rgb(186, 208, 149)",
    "--event": "rgba(186, 208, 149, 0.3)",
    "--foreground": "rgb(218, 222, 200)",
    "--midground": "rgba(59, 60, 54, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(186, 208, 149, 0.5)",
    "--important": "rgba(218, 222, 200, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(85, 107, 47, 0.8)",
    "--endDate": "rgb(85, 107, 47)",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(218, 222, 200, 0.1)",
    "--river": "rgba(186, 208, 149, 0.1)",
  },
  'fire-day': {
    "--font": "var(--fontSize) 'Josefin Sans', Cochin, sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--bold": "300",
    "--background": "rgb(230, 230, 250)",
    "--border": "rgba(53, 3, 58, 0.3)",
    "--select": "rgb(242, 172, 229)",
    "--event": "rgba(251, 217, 253, 0.3)",
    "--foreground": "rgb(53, 3, 58)",
    "--midground": "rgba(200, 200, 230, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(242, 172, 229, 0.5)",
    "--important": "rgba(53, 3, 58, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(226, 156, 210, 0.8)",
    "--endDate": "rgb(226, 156, 210)",
    "--headingSize": "120%",
    "--lineSpacing": "10px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(53, 3, 58, 0.1)",
    "--river": "rgba(242, 172, 229, 0.1)",
  },
  'fire-night': {
    "--font": "var(--fontSize) 'Josefin Sans', Cochin, sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--bold": "300",
    "--background": "rgb(5, 5, 26)",
    "--border": "rgba(212, 112, 162, 0.3)",
    "--select": "rgb(183, 104, 162)",
    "--event": "rgba(183, 104, 162, 0.3)",
    "--foreground": "rgb(248, 197, 252)",
    "--midground": "rgba(40, 6, 34, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(183, 104, 162, 0.5)",
    "--important": "rgba(248, 197, 252, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(226, 156, 210, 0.8)",
    "--endDate": "rgb(226, 156, 210)",
    "--headingSize": "125%",
    "--lineSpacing": "10px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(248, 197, 252, 0.1)",
    "--river": "rgba(183, 104, 162, 0.1)",
  },
  'sky-day': {
    "--font": "var(--fontSize) 'Pilo Thin', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--bold": "300",
    "--background": "#E4EDF1",
    "--border": "rgba(21, 35, 40, 0.3)",
    "--select": "rgb(119, 152, 171)",
    "--event": "rgba(119, 152, 171, 0.3)",
    "--foreground": "rgb(52, 64, 85)",
    "--midground": "rgba(128, 128, 128, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(119, 152, 171, 0.5)",
    "--important": "rgba(52, 64, 85, 0.2)",
    "--maybe": "rgba(29, 41, 81, 0.5)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(29, 41, 81, 0.8)",
    "--endDate": "rgb(29, 41, 81)",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "3em",
    "--bank": "rgba(52, 64, 85, 0.1)",
    "--river": "rgba(119, 152, 171, 0.1)",
  },
  'sky-night': {
    "--font": "var(--fontSize) 'Pilo Thin', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--bold": "300",
    "--background": "rgb(14, 23, 27)",
    "--border": "rgba(36, 40, 43, 0.3)",
    "--select": "rgb(83, 117, 136)",
    "--event": "rgba(59, 75, 84, 0.3)",
    "--foreground": "rgb(170, 182, 203)",
    "--midground": "rgba(128, 128, 128, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(83, 117, 136, 0.5)",
    "--important": "rgba(170, 182, 203, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(173, 185, 225, 0.8)",
    "--endDate": "rgb(173, 185, 225)",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "3em",
    "--bank": "rgba(170, 182, 203, 0.1)",
    "--river": "rgba(83, 117, 136, 0.1)",
  },
  'space-day': {
    "--font": "var(--fontSize) 'Adam', Cochin, sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "300",
    "--background": "rgb(201, 192, 187)",
    "--border": "rgba(128, 128, 128, 0.3)",
    "--select": "rgb(165, 113, 100)",
    "--event": "rgba(165, 113, 100, 0.3)",
    "--foreground": "rgba(59, 47, 47)",
    "--midground": "rgba(165, 113, 100, 0.5)",
    "--padding": "14px",
    "--importantE": "rgba(165, 113, 100, 0.5)",
    "--important": "rgba(59, 47, 47, 0.2)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(161, 122, 116, 0.8)",
    "--endDate": "rgb(161, 122, 116)",
    "--bold": "400",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(59, 47, 47, 0.1)",
    "--river": "rgba(165, 113, 100, 0.1)",
  },
  'space-night': {
    "--font": "var(--fontSize) 'Adam', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "300",
    "--background": "rgb(0, 0, 0)",
    "--border": "rgb(128, 128, 128, 0.3)",
    "--select": "rgb(101, 138, 149)",
    "--event": "rgba(101, 138, 149, 0.3)",
    "--foreground": "rgb(191, 193, 194)",
    "--midground": "rgba(101, 138, 149, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(101, 138, 149, 0.5)",
    "--important": "rgba(191, 193, 194, 0.2)",
    "--maybe": "darkblue",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(135,206,235, 0.8)",
    "--endDate": "rgb(135,206,235)",
    "--bold": "400",
    "--headingSize": "125%",
    "--lineSpacing": "5px",
    "--frontWidth": "2.5em",
    "--bank": "rgba(191, 193, 194, 0.1)",
    "--river": "rgba(101, 138, 149, 0.1)",
  },
  'water-day': {
    "--font": "var(--fontSize) 'Kirvy', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--background": "rgb(188, 212, 230)",
    "--border": "rgba(36, 40, 43, 0.3)",
    "--select": "rgb(64, 71, 77)",
    "--event": "rgba(64, 71, 77, 0.3)",
    "--foreground": "rgb(10, 10, 10)",
    "--midground": "rgba(64, 71, 77, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(64, 71, 77, 0.5)",
    "--important": "rgba(10, 10, 10, 0.2)",
    "--maybe": "rgba(41, 74, 112, 0.5)",
    "--menufont": "24px Dosis",
    "--startDate": "rgb(41, 74, 112, 0.8)",
    "--endDate": "rgb(41, 74, 112)",
    "--bold": "300",
    "--headingSize": "1.15em",
    "--lineSpacing": "7px",
    "--frontWidth": "3.5em",
    "--bank": "rgba(10, 10, 10, 0.1)",
    "--river": "rgba(64, 71, 77, 0.1)",
  },
  'water-night': {
    "--font": "var(--fontSize) 'Kirvy', sans-serif",
    "--fontSize": "30px",
    "--fontWeight": "100",
    "--background": "rgb(31, 40, 52)",
    "--border": "rgba(176, 194, 212, 0.3)",
    "--select": "rgb(145, 163, 176)",
    "--event": "rgba(145, 163, 176, 0.3)",
    "--foreground": "whitesmoke",
    "--midground": "rgba(145, 163, 176, 0.1)",
    "--padding": "14px",
    "--importantE": "rgba(145, 163, 176, 0.5)",
    "--important": "rgba(245, 245, 245, 0.1)",
    "--maybe": "rgba(143, 176, 214, 0.5)",
    "--menufont": "24px Dosis",
    "--startDate": "rgba(143, 176, 214, 0.8)",
    "--endDate": "rgb(143, 176, 214)",
    "--bold": "300",
    "--headingSize": "1.15em",
    "--lineSpacing": "7px",
    "--frontWidth": "3.5em",
    "--bank": "rgba(245, 245, 245, 0.1)",
    "--river": "rgba(145, 163, 176, 0.1)",
  }
}

function load() {
  const newTheme = window.themes['space-night'];
  for (let key of Object.keys(newTheme)) {
    document.documentElement.style.setProperty(
      key, newTheme[key]
    );
  }
  ReactDOM.render(
    <SignIn init={init} />, 
    document.getElementById('root')
  );
}

function init() {
  const newTheme = window.themes['space-night'];
  for (let key of Object.keys(newTheme)) {
    document.documentElement.style.setProperty(
      key, newTheme[key]
    );
  }

  window.selected = undefined;
  window.preventSelect = undefined;
  window.copiedTask = undefined;
  window.app = undefined;
  window.preventReturn = undefined;
  edit.saveUndo();

  saving.clean();

  window.selected = undefined;
  window.width = Math.floor(window.innerWidth / 200);
  window.prevWidth = Math.floor(window.innerWidth / 200);
  window.app = React.createRef();
  ReactDOM.render(<App ref={window.app} />, document.getElementById('root'));
  $(document).on('keydown', keyComms.keyComms);
  display.focus(window.data.settings.focused);
  display.setTheme(window.data.settings.theme);
  window.addEventListener('resize', () => {
    if (window.innerWidth / 10 !== Math.floor(window.innerWidth / 10)) return;
    display.updateAllSizes();
  });
  display.checkTimes();
  window.setInterval(display.checkTimes, 60000);
  window.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    }
    const contextMenu = window.app.current.state.contextMenu.current.self.current;
    window.app.current.state.contextMenu.current.setState({ 
      top: Math.min(ev.pageY, 
        window.innerHeight - $(contextMenu).height()), 
      left: Math.min(ev.pageX, 
        window.innerWidth - $(contextMenu).width()),
      display: 'block' });
  })
  window.addEventListener('click', () => 
    window.app.current.state.contextMenu.current.setState({ display: 'none' }))
  document.addEventListener('fullscreenchange', display.updateAllSizes);
}

const migrate = () => {
  // MIGRATION PROTOCOLS

  if (!window.data.settings.migrated) {
    window.data.settings.migrated = [];
  }

  if (!window.data.settings.migrated.includes('12/1')) {
    window.data.settings.migrated.push('12/1');
    var tasksMigrated = {};
    var newData = JSON.parse(JSON.stringify(window.data));
    function treeSearch(task) {
      tasksMigrated[task.id] = {
        info: task.info, title: task.title,
        subtasks: task.subtasks.map(x => x.id)
      };
      for (let subtask of task.subtasks) {
        treeSearch(subtask, task);
      }
      delete task.subtasks;
    }
    newData.river.id = 'river';
    newData.bank.id = 'bank';
    treeSearch(newData.river);
    treeSearch(newData.bank);
    delete newData.river;
    delete newData.bank;
    newData.tasks = tasksMigrated;
    window.data = newData;
  }

  if (!window.data.settings.migrated.includes('12/2')) {
    window.data.settings.migrated.push('12/2');
    for (let task of Object.keys(window.data.tasks)) {
      const foundTask = window.data.tasks[util.stripR(task)];
      delete foundTask.info.startDate;
      delete foundTask.info.endDate;
    }
  }

  if (!window.data.settings.migrated.includes('12/3')) {
    window.data.settings.migrated.push('12/3');
    window.data.settings.startdates = {};
    window.data.settings.deadlines = {};
  }

  if (!window.data.settings.migrated.includes('12/24')) {
    window.data.settings.migrated.push('12/24');
    window.data.settings.sounds = 'true';
  }
}

load();