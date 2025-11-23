// import React from 'react';
import '../scss/NavigationBar.scss';
import logo from '../img/title.png';

function NavigationBar() {
  return (
    <nav>
      <h1>
        <img className='titleLogo' src={logo} alt='読む！' />
        ポケモン図鑑
      </h1>
    </nav>
  );
}

export default NavigationBar;
