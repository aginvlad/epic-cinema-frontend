import React, { Component } from 'react';
import axios from 'axios';
import { Modal, Button, Input, Tabs, Select, Popconfirm, message, Icon } from 'antd';
import './EditMovie.sass';
import { genresList } from './movieGenres';
import EditableSessionsTable from './SessionsTable';
import {
  GET_MOVIE_SESSIONS_ADMIN,
  ADD_MOVIE,
  EDIT_MOVIE,
  DELETE_MOVIE,
} from '../../../constants/apiRoutes';
import { downloadJSON } from '../../../constants/functions';

class EditMovie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialData: this.props.movieData,
      newData: {},
      isEdit: this.props.edit,
      isLoading: false,
      sessions: [],
    };
  }

  componentDidMount() {
    if (!this.state.isEdit) return;
    axios
      .post(
        GET_MOVIE_SESSIONS_ADMIN,
        { movieId: this.state.initialData._id },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      )
      .then((res) =>
        this.setState({
          sessions: res.data,
        })
      )
      .catch((e) => message.error('Что-то пошло не так! :('));
  }

  onSaveMovieInfo = () => {
    if (this.state.isEdit) {
      const { initialData, newData } = this.state;
      const dataToSend = { _id: initialData._id };
      if (!Object.keys(newData).length) return this.props.closeModal();
      Object.entries(newData).map((el) => {
        if (el[0] === 'genres')
          JSON.stringify(el[1]) !== JSON.stringify(initialData.genres)
            ? (dataToSend.genres = el[1])
            : delete dataToSend.genres;
        else if (el[1] !== initialData[el[0]]) dataToSend[el[0]] = el[1];
      });
      if (!Object.keys(dataToSend).length) return this.props.closeModal();
      this.setState({ isLoading: true });
      axios
        .post(EDIT_MOVIE, dataToSend, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        })
        .then((res) => this.setState({ isLoading: false }))
        .catch((e) => {
          this.setState({ isLoading: false });
          message.error('Что-то пошло не так :(');
        });
    } else {
    }
  };

  onAddMovieInfo = () => {
    const { newData } = this.state;
    if (!newData.title) return message.warn('Укажите название!');
    if (!newData.genres) return message.warn('Укажите жанр!');
    if (!newData.description) return message.warn('Укажите описание!');
    this.setState({ isLoading: true });
    axios
      .post(ADD_MOVIE, newData, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      })
      .then((res) => {
        this.setState({ isLoading: false });
        this.props.closeModal();
      })
      .catch((e) => {
        this.setState({ isLoading: false });
        message.error('Что-то пошло не так :(');
      });
  };

  onDeleteMovie = () => {
    axios
      .post(
        DELETE_MOVIE,
        { _id: this.state.initialData._id },
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      )
      .then((res) => this.props.goToHomePage())
      .catch((e) => message.error('Что-то пошло не так :('));
  };

  onChangeGenres = (values, selectedVals) => {
    this.setState({
      newData: {
        ...this.state.newData,
        genres: selectedVals.map((el) => el.props.children),
      },
    });
  };

  render() {
    const movieData = this.state.initialData;
    const { newData, isEdit, isLoading } = this.state;
    const { sessions } = this.state;
    const { TabPane } = Tabs;

    const sessionsForTable = sessions.map((session, index) => ({
      key: index,
      date: session.date,
      time: session.time,
      price: session.price,
    }));

    const { Option } = Select;

    return (
      <Modal
        title={isEdit ? 'Изменить данные о фильме' : 'Добавить фильм'}
        className="edit-movie-modal"
        visible={true}
        //confirmLoading={this.state.isLoading}
        footer={null}
        onCancel={this.props.closeModal}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Данные о фильме" key="1">
            <Input
              placeholder="Название фильма"
              defaultValue={movieData && movieData.title}
              onChange={(e) =>
                this.setState({
                  newData: { ...newData, title: e.target.value },
                })
              }
            />
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Выберите жанр"
              defaultValue={
                movieData
                  ? movieData.genres.map(
                      (genre) => genresList.indexOf(genre) + ''
                    )
                  : []
              }
              onChange={this.onChangeGenres}
            >
              {genresList.map((genre, index) => (
                <Option key={index}>{genre}</Option>
              ))}
            </Select>
            <Input.TextArea
              placeholder="Описание"
              defaultValue={movieData && movieData.description}
              onChange={(e) =>
                this.setState({
                  newData: { ...newData, description: e.target.value },
                })
              }
            />
            <Input
              placeholder="Url постера"
              defaultValue={movieData && movieData.posterUrl}
              onChange={(e) =>
                this.setState({
                  newData: { ...newData, posterUrl: e.target.value },
                })
              }
            />
            <Input
              placeholder="Url трейлера"
              defaultValue={movieData && movieData.trailerUrl}
              onChange={(e) =>
                this.setState({
                  newData: { ...newData, trailerUrl: e.target.value },
                })
              }
            />
            <div className="toRight">
              <Button type="primary" onClick={() => downloadJSON(sessions, 'sessions')}>
                <Icon type="cloud-download" />
              </Button>
              {isEdit && (
                <Popconfirm
                  placement="topRight"
                  title="Вы дейстивительно хотите снять этот фильм с показа?"
                  onConfirm={this.onDeleteMovie}
                  okText="Да"
                  cancelText="Нет"
                >
                  <Button type="danger" icon="delete">
                    Удалить
                  </Button>
                </Popconfirm>
              )}
              <Button
                type="primary"
                loading={isLoading}
                onClick={isEdit ? this.onSaveMovieInfo : this.onAddMovieInfo}
              >
                Сохранить
              </Button>
            </div>
          </TabPane>
          <TabPane tab="Сеансы" key="2" disabled={!isEdit}>
            {/*             <Table
              dataSource={sessionsForTable}
              columns={columns}
              size="small"
            /> */}
            <EditableSessionsTable
              movieId={movieData ? movieData._id : {}}
              sessions={sessions}
              dataSource={sessionsForTable}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

export default EditMovie;
