import React, { Component } from 'react';
import { Input, Form, Row, Col, Button, Select } from 'antd';
import './ForgotPassword.sass';

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      codeWasSent: false
    };
    this.phoneNumber = React.createRef();
  }

  onSubmit = () => {
    this.props.validateFields((err, values) => {
      if (!err) {
        this.props.closeModal();
      }
    });
  };

  enterLoading = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, codeWasSent: true });
    }, 5000 * Math.random());
  };

  render() {
    const { getFieldDecorator } = this.props;
    const { loading, codeWasSent } = this.state;

    return (
      <>
        <Form.Item label="Номер телефона">
          {getFieldDecorator('phone', {
            rules: [
              {
                required: true,
                message: 'Пожалуйста, введите номер телефона',
                min: 11,
                max: 11
              }
            ]
          })(<Input style={{ width: '100%' }} ref={this.phoneNumber} />)}
        </Form.Item>
        <Form.Item
          label="Код потверждения"
          extra="Мы отправим вам новый пароль, который будет действовать в течении 15 минут"
        >
          <Row className="get-code" gutter={6}>
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
                disabled={
                  codeWasSent ||
                  !this.phoneNumber.current ||
                  this.phoneNumber.current.props.value === null ||
                  (this.phoneNumber.current && this.phoneNumber.current.props.value === "")
                }
                onClick={this.enterLoading}
              >
                Получить код
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={this.onSubmit}>
            Продолжить
          </Button>
        </Form.Item>
      </>
    );
  }
}

export default ForgotPassword;
