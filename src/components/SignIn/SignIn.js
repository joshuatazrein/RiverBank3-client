import './SignIn.css';
import '../App/App.css';
import * as server from '../../services/server';
import { init } from '../../index';
import { useState } from 'react';
import Axios from 'axios';
import imgSource from '../../assets/media/logo.png';

if (window.mode !== 'offline') {
  Axios.get('/server/').then((response) => {
    console.log(response);
  });
} 

// props has init function
export default function SignIn (props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [format, setFormat] = useState('login');

  const reset = () => {
    setPassword2('');
    setPassword('');
    setUsername('');
  }
<ruby><rp>(</rp><rt>pronunciation</rt><rp>)</rp></ruby>
  const login = () => {
    if (format === 'create') {
      if (password2 !== password) {
        alert('passwords must match');
        reset();
        return;
      } else if (username.length === 0) {
        alert('enter a username');
        return;
      } else if (password.length === 0) {
        alert('enter a password');
        return;
      }
      Axios.post('/server/createuser', {
        username: username,
        password: password,
      }).then((response) => {
        console.log(response);
        if (response.data === 'duplicate username') {
          alert('username taken');
          setUsername('');
        } else {
          // load data into window's data
          window.username = username;
          window.password = response.data.encryptedPassword;
          // reset and upload fresh data
          server.initializeData();
          // waiting a bit to let data sync (should be async but meh)
          console.log('finished');
          confirm();
        }
      }).catch((err) => {
        console.log(err);
      });
    } else if (format === 'login') {
      if (username.length === 0) {
        alert('enter a username');
        return;
      } else if (password.length === 0) {
        alert('enter a password');
        return;
      }
      Axios.post('/server/login', {
        username: username,
        password: password,
      }).then((response) => {
        console.log(response);
        if (response.data === 'wrong username') {
          alert('username does not exist');
          setUsername('');
        } else if (response.data === 'wrong password') {
          alert('incorrect password');
          setPassword('');
        } else {
          // load data into window's data
          window.data = {
            settings: response.data.settings,
            tasks: response.data.tasks
          };
          window.username = username;
          window.password = response.data.encryptedPassword;
          confirm();
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  const confirm = () => {
    props.init();
  }

  return (
    <div className='signIn'>
      <img 
        src={imgSource}
        className='logo'
      ></img>
      <span className='title titleLarge'>
        <span className='r'>River</span>
        <span className='b'>Bank</span>
      </span>
      <p className='slogan'>go with the flow</p>
      <div className='radioButtons'>
        <button
          className={`radioButton ${format === 'login' ? 'selected' : ''}`}
          onClick={() => setFormat('login')}
        >login</button>
        <button
          className={`radioButton ${format === 'create' ? 'selected' : ''}`}
          onClick={() => setFormat('create')}
        >create account</button>
        <button
          className={`radioButton ${format === 'demo' ? 'selected' : ''}`}
          onClick={() => {
            window.mode = 'offline';
            server.initializeData();
            setTimeout(init, 250);
          }}
        >demo</button>
      </div>
      <input 
        className='signInput'
        placeholder='username'
        value={username}
        onChange={(ev) => {
          setUsername(ev.target.value);
        }}
      ></input>
      <input 
        type='password'
        className='signInput'
        placeholder='password'
        value={password}
        onChange={(ev) => {
          setPassword(ev.target.value);
        }}
      ></input>
      {format === 'create' &&
      <input 
      type='password'
      className='signInput'
      placeholder='password again'
      value={password2}
      onChange={(ev) => {
        setPassword2(ev.target.value);
      }}
    ></input>}
      <button 
        className='loginButton'
        onClick={login}
      >enter</button>
    </div>
  )
}