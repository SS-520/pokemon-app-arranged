// import React from 'react';
import '../scss/NavigationBar.scss';

function NavigationBar() {
  return (
    <nav>
      <h1>
        <img className='titleLogo' src='/img/title.png' alt='読む！' />
        ポケモン図鑑
      </h1>
    </nav>
  );
}

export default NavigationBar;
