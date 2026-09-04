// 切り替えトグルスイッチ

import React from 'react'

// スタイル
import "../../scss/ToggleSwitch.scss";

// props
interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  beforeIcon: React.ReactNode;
  afterIcon: React.ReactNode;
}

const ToggleSwitch = ({ isChecked, onToggle, ariaLabel, beforeIcon, afterIcon,}:ToggleSwitchProps): React.ReactNode => {
  return (
    <div className='switchArea'>
      <span className='iconWrap before'>{beforeIcon}</span>
      <button
        className={`switchBox toggle ${isChecked ? 'checked' : ''}`}
        onClick={onToggle}
        type='button'
        aria-label={ariaLabel}
      >
        <input
          className='switch'
          type='checkbox'
          name='check'
          checked={isChecked}
          onChange={() => {}} // onClickで制御するため空関数
          tabIndex={-1}
          aria-hidden='true'
        />
      </button>
      <span className='iconWrap after'>{afterIcon}</span>
    </div>
  )
}

export default ToggleSwitch