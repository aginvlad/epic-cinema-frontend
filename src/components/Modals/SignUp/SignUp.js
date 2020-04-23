import React, { Component } from 'react';
import axios from 'axios';
import { Form, Input, Icon, Select, Row, Col, Button, message } from 'antd';
import { SIGN_UP } from '../../../constants/apiRoutes';
import './SignUp.sass';

const { Option } = Select;

class SignUp extends Component {
  state = {
    confirmDirty: false,
    loading: false,
    codeWasSent: false
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { prefix, name, password, phone } = values;
        axios
          .post(SIGN_UP, {
            name,
            phone: '+375' + prefix + phone,
            password
          })
          .then(res => {
            this.props.userSignedIn(res.data, false);
            this.props.closeSignUpModal();
          })
          .catch(err => {
            if (err.response.status === 400) message.error('Пользователь с таким номером уже существует!');
            else message.error('Произошла ошибка :(');
          });
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value.length > 5 && value !== form.getFieldValue('password')) {
      callback('Пароли не совпадают!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  validateUsername = (rule, value, callback) => {
    if (value.length > 1 && value.indexOf(' ') > -1) {
      callback('Некорректное имя пользователя!');
    } else {
      callback();
    }
  };

  enterLoading = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, codeWasSent: true });
    }, 5000 * Math.random());
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { codeWasSent, loading } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '29'
    })(
      <Select style={{ width: 90 }}>
        <Option value="29">+375 29</Option>
        <Option value="44">+375 44</Option>
        <Option value="25">+375 25</Option>
        <Option value="33">+375 33</Option>
      </Select>
    );

    return (
      <div className="backdrop">
        <Form
          {...formItemLayout}
          id="sign-up-modal"
          onSubmit={this.handleSubmit}
        >
          <Icon
            className="close-modal"
            type="close"
            onClick={this.props.closeSignUpModal}
          />
          <Form.Item label={<span>Имя пользователя</span>}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: 'Пожалуйста, введите имя пользователя',
                  min: 3,
                  max: 50
                },
                {
                  validator: this.validateUsername
                }
              ]
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Пароль" hasFeedback>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: 'Пожалуйста, введите ваш пароль',
                  min: 6,
                  max: 30
                },
                {
                  validator: this.validateToNextPassword
                }
              ]
            })(<Input.Password />)}
          </Form.Item>
          <Form.Item label="Повторите пароль" hasFeedback>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: 'Пожалуйста, повторите ваш пароль',
                  min: 6,
                  max: 30
                },
                {
                  validator: this.compareToFirstPassword
                }
              ]
            })(<Input.Password onBlur={this.handleConfirmBlur} />)}
          </Form.Item>
          <Form.Item label="Номер телефона">
            {getFieldDecorator('phone', {
              rules: [
                {
                  required: true,
                  message: 'Пожалуйста, введите номер телефона',
                  min: 7,
                  max: 7
                }
              ]
            })(
              <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
            )}
          </Form.Item>
          <Form.Item
            label="Код потверждения"
            extra="Мы отправим код потверждения на указанный вами номер телефона"
          >
            <Row gutter={6}>
              <Col span={6}>
                {getFieldDecorator('captcha', {
                  rules: [
                    {
                      required: true,
                      message: 'Неверный код!',
                      min: 5,
                      max: 5
                    }
                  ]
                })(<Input disabled={!codeWasSent} />)}
              </Col>
              <Col span={18}>
                <Button
                  loading={loading}
                  disabled={codeWasSent}
                  onClick={this.enterLoading}
                >
                  Получить код
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button
              disabled={!form.getFieldValue('name')}
              type="primary"
              htmlType="submit"
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedSignUp = Form.create({ name: 'register' })(SignUp);

export default WrappedSignUp;
