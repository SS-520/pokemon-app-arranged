// import React from 'react';
import '../scss/NavigationBar.scss';
import logo from '../img/title.png';

function NavigationBar() {
  return (
    <header id='navigation'>
      <h1>
        <img className='titleLogo' src={logo} alt='読む！' />
        ポケモン図鑑
      </h1>
    </header>
  );
}

export default NavigationBar;
