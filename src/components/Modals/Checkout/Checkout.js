import React from 'react';
import { Card, Input, Icon, Steps, Button } from 'antd';
import './Checkout.sass';

const checkout = props => {
  const places = JSON.parse(localStorage.getItem('selectedPlaces')).map(
    (el, index) => {
      if (
        index ===
        JSON.parse(localStorage.getItem('selectedPlaces')).length - 1
      )
        return el;
      return el + ', ';
    }
  );
  const sessionName = JSON.parse(localStorage.getItem('sessionName'));
  return (
    <div className="backdrop">
      <Card
        title="Оплата билетов"
        extra={
          <div className="close-modal" onClick={props.closeModal}>
            Отмена
          </div>
        }
        style={{ width: 300 }}
        className="checkout"
      >
        <p className="checkout__info">
          <span>Дата и время:</span> {sessionName}
        </p>
        <p className="checkout__info">
          <span>Ваши места:</span> {places}
        </p>
        <p className="checkout__info">
          <span>Итого к оплате:</span> {places.length * props.price + ' руб.'}
        </p>
        <Input
          placeholder="Введите номер вашей карты"
          style={{ marginBottom: '1.5rem' }}
          maxLength={16}
          id="ch-card-number"
          prefix={
            <Icon type="credit-card" style={{ color: 'rgba(0,0,0,.25)' }} />
          }
        />
        <Input
          placeholder="Введите имя владельца"
          style={{ marginBottom: '1.5rem' }}
          maxLength={40}
          id="ch-name"
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
        />
        <Input.Group compact>
          <Input
            placeholder="Срок"
            id="ch-st-date"
            style={{ width: '25%', marginBottom: '1.5rem' }}
            maxLength={2}
          />
          <Input
            placeholder="Действия"
            id="ch-end-date"
            style={{ width: '25%', marginBottom: '1.5rem' }}
            maxLength={2}
          />
        </Input.Group>
        <Input
          placeholder="CVC"
          id="ch-cvc"
          style={{ width: '25%', marginBottom: '1.5rem' }}
          maxLength={3}
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
        />
        <Button
          style={{ display: 'block', width: '25%', marginBottom: '1.5rem' }}
          type="primary"
          onClick={props.processPayment}
        >
          Оплатить
        </Button>
        <Steps current={props.step}>
          <Steps.Step title="Ввод данных" icon={<Icon type="solution" />} />
          <Steps.Step
            title="Оплата"
            icon={<Icon type={props.step === 1 ? 'loading' : 'check-circle'} />}
          />
          <Steps.Step title="Готово" icon={<Icon type="smile-o" />} />
        </Steps>
      </Card>
    </div>
  );
};

export default checkout;
