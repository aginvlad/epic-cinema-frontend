import React, { Component } from 'react';
import axios from 'axios';
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  Button,
  message
} from 'antd';
import { ADD_SESSION, DELETE_SESSION } from '../../../constants/apiRoutes';

const EditableContext = React.createContext();

class EditableCell extends Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      return <InputNumber />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Введите ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class EditableTable extends Component {
  constructor(props) {
    super(props);
    this.state = { data: this.props.dataSource, editingKey: '' };
    this.columns = [
      {
        title: 'Дата',
        dataIndex: 'date',
        editable: true,
        defaultSortOrder: 'ascend',
        sorter: (a, b) => {
          const aa = a.date
            .split('.')
            .reverse()
            .join();
          const bb = b.date
            .split('.')
            .reverse()
            .join();
          return aa < bb ? -1 : aa > bb ? 1 : 0;
        }
      },
      {
        title: 'Время',
        dataIndex: 'time',
        editable: true,
      },
      {
        title: 'Цена',
        dataIndex: 'price',
        editable: true
      },
      {
        title: 'Действие',
        width: '36%',
        dataIndex: 'operation',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <Popconfirm
                    title="Вы уверены, что хотите сохранить изменения?"
                    okText="Да"
                    cancelText="Нет"
                    onConfirm={e => this.save(form, record.key)}
                  >
                    <button className="antlink">Сохранить</button>
                  </Popconfirm>
                )}
              </EditableContext.Consumer>
              <button className="antlink" onClick={this.cancel}>
                Отмена
              </button>
            </span>
          ) : (
            <>
              <Popconfirm
                title="Вы уверены, что хотите удалить сеанс?"
                okText="Да"
                cancelText="Нет"
                onConfirm={e => this.onDeleteSession(record)}
              >
                <button className="antlink">Удалить</button>
              </Popconfirm>
            </>
          );
        }
      }
    ];
  }

  isEditing = record => record.key === this.state.editingKey;

  cancel = el => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        this.setState({ data: newData, editingKey: '' });
        axios
          .post(
            ADD_SESSION,
            { session: row, movieId: this.props.movieId },
            {
              headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
              }
            }
          )
          .catch(e => message.error('Что-то пошло не так :('));
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }

  onDeleteSession = record => {
    const index = this.props.sessions.findIndex(
      el =>
        el.date === record.date &&
        el.time === record.time &&
        el.price === record.price
    );
    const newData = [...this.state.data];
    const dataIndex = this.state.data.findIndex(el => el.key === record.key);
    newData.splice(dataIndex, 1);
    axios
      .post(
        DELETE_SESSION,
        { sessionId: this.props.sessions[index]._id },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      )
      .then(res => this.setState({ data: newData }))
      .catch(e => message.error('Что-то пошло не так :('));
  };

  edit(key) {
    this.setState({ editingKey: key });
  }

  onAddNewRow = () => {
    const { data } = this.state;
    const newData = {
      key: data.length,
      time: 'XX:XX',
      date: `XX.XX`,
      price: 1
    };
    this.setState({
      data: [...data, newData],
      editingKey: data.length
    });
  };

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <>
        <EditableContext.Provider value={this.props.form}>
          <Table
            components={components}
            bordered
            dataSource={this.state.data}
            columns={columns}
            rowClassName="editable-row"
            pagination={{
              onChange: this.cancel
            }}
            size="small"
          />
        </EditableContext.Provider>
        <Button type="primary" onClick={this.onAddNewRow}>
          Новый сеанс
        </Button>
      </>
    );
  }
}

const EditableSessionsTable = Form.create()(EditableTable);

export default EditableSessionsTable;
