import React, { Component } from 'react';
import axios from 'axios';
import { Modal, Input, Form } from 'antd';
import './UserProfile.sass';
import { UPDATE_USER } from '../../../constants/apiRoutes';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      confirmDirty: false
    };
    this.profileForm = React.createRef();
    this.newPass = React.createRef();
  }

  handleProfileModalOk = () => {
    this.profileForm.current.props.onSubmit();
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
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

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const data = {};
        if(values.name) {
          data.name = values.name;
        }
        if(values.password) {
          data.password = values.password;
        }

        axios
          .post(UPDATE_USER, data, {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          })
          .then(res => window.location.reload())
          .catch(e => console.log(e));
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

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

    return (
      <Modal
        title="Изменить профиль"
        visible={true}
        onOk={this.handleProfileModalOk}
        confirmLoading={this.state.isLoading}
        onCancel={this.props.closeModal}
      >
        <Form
          ref={this.profileForm}
          {...formItemLayout}
          onSubmit={this.handleSubmit}
        >
          <Form.Item label={<span>Имя пользователя</span>}>
            {getFieldDecorator('name', {
              rules: [
                {
                  required: false,
                  min: 3,
                  max: 50
                }
              ]
            })(<Input placeholder={this.props.userName} />)}
          </Form.Item>
          <Form.Item label="Новыый пароль" hasFeedback ref={this.newPass}>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: false,
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
                  required:
                    this.newPass.current &&
                    this.newPass.current.props.children.props.value !== undefined
                      ? this.newPass.current.props.children.props.value.length
                      : false,
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
        </Form>
      </Modal>
    );
  }
}

const WrappedUserProfile = Form.create({ name: 'user_profile' })(UserProfile);

export default WrappedUserProfile;
