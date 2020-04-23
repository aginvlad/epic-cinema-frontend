import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Cascader, Icon } from 'antd';
import './NavBar.sass';

const navBar = props => {
  const { openSignInModal, handleSelect, isSignedIn, userName } = props;
  const options = [
    {
      value: 'edit',
      label: 'Профиль'
    },
    {
      value: 'exit',
      label: 'Выйти'
    }
  ];
  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        <span>E</span>pic
        <div className="logo__sub">cinema</div>
      </Link>
      {isSignedIn ? (
        <Cascader
          className="user-account"
          popupClassName="user-account-select"
          options={options}
          onChange={handleSelect}
        >
          <div className="user-account__name">
            <Icon type="down" />
            &nbsp;&nbsp;{userName}
          </div>
        </Cascader>
      ) : (
        <Button
          ghost={true}
          className="sign-btn"
          size="large"
          icon="login"
          onClick={openSignInModal}
        >
          Войти
        </Button>
      )}
    </nav>
  );
};

export default navBar;
