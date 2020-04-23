import React, { Component } from 'react';
import axios from 'axios';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import { SIGN_IN } from '../../../constants/apiRoutes';
import ForgotPassword from '../ForgotPassword/ForgotPassword';

import './SignIn.sass';

class SignIn extends Component {
  constructor() {
    super();
    this.state = {
      isForgotPassword: false,
      error: false
    };
  }
  
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { phone, password, remember } = values;
        axios
          .post(SIGN_IN, {
            phone,
            password
          })
          .then(res => this.props.userSignedIn(res.data, remember))
          .catch(err => message.error('Неверный логин или пароль'));
      }
    });
  };

  handleToggleForgotPasswordModal = () => {
    this.setState(prevState => ({ isForgotPassword: !prevState.isForgotPassword }));
  }; 

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="backdrop">
        <Form
          onSubmit={this.handleSubmit}
          id="sign-in-modal"
          className="login-form"
        >
          <Icon
            className="close-modal"
            type="close"
            onClick={this.props.closeSignInModal}
          />
          {this.state.isForgotPassword ? (
            <ForgotPassword
              {...this.props.form}
              closeModal={this.handleToggleForgotPasswordModal}
            />
          ) : (
            <>
              <Form.Item>
                {getFieldDecorator('phone', {
                  rules: [
                    {
                      required: true,
                      message: 'Пожалуйста, введите номер телефона',
                      min: 13,
                      max: 13
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    placeholder="Номер телефона"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: 'Пожалуйста, введите ваш пароль'
                    }
                  ]
                })(
                  <Input
                    prefix={
                      <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    type="password"
                    placeholder="Пароль"
                  />
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('remember', {
                  valuePropName: 'checked',
                  initialValue: true
                })(<Checkbox>Запомнить меня</Checkbox>)}
                <a
                  className="login-form-forgot"
                  href="/#"
                  onClick={e => {
                    e.preventDefault();
                    this.handleToggleForgotPasswordModal();
                  }}
                >
                  Забыли пароль?
                </a>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Войти
                </Button>
                Или{' '}
                <a
                  href="/#"
                  onClick={e => {
                    e.preventDefault();
                    this.props.closeSignInModal();
                    this.props.showSignUpModal();
                  }}
                >
                  создать аккаунт!
                </a>
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    );
  }
}

const WrappedSignIn = Form.create({ name: 'sign_in' })(SignIn);

export default WrappedSignIn;
