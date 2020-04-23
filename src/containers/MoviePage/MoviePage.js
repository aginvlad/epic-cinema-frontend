import React, { Component } from 'react';
import axios from 'axios';
import {
  Button,
  Icon,
  Cascader,
  message,
  notification,
  Spin,
  Tooltip
} from 'antd';
import Checkout from '../../components/Modals/Checkout/Checkout';
import EditMovie from '../../components/Modals/EditMovie/EditMovie';
import './MoviePage.sass';
import { GET_MOVIE_SESSIONS, BOOK_PLACES } from '../../constants/apiRoutes';
import placeholder from '../../assets/movie-placeholder.png';

class MoviePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTrailer: false,
      showCheckoutModal: !!localStorage.getItem('selectedPlaces'),
      showEditMovieModal: false,
      sessionContent: 'Не выбрано',
      currentStep: 0,
      movieData: {
        title: '',
        description: '',
        price: ''
      },
      sessions: [],
      isLoading: false
    };
  }

  componentDidMount() {
    if (
      !this.props.history.location.state ||
      !this.props.history.location.state.movieData
    ) {
      this.props.history.push({ pathname: '/asd' });
      return;
    }
    this.setState(
      { movieData: this.props.history.location.state.movieData },
      this.loadSessions
    );
    window.addEventListener('click', this.onCloseTrailerWindow);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onCloseTrailerWindow);
  }

  onCloseTrailerWindow = e => {
    if (e.target.id !== 'watch-trailer' && this.state.showTrailer)
      this.setState({ showTrailer: false });
  };

  onOpenTrailerWindow = () => {
    this.setState({ showTrailer: true });
  };

  onSessionChange = (value, selectedOptions) => {
    localStorage.setItem(
      'availablePlaces',
      JSON.stringify(
        this.state.sessions.find(session => session._id === value[1])
          .availablePlaces
      )
    );
    this.setState({
      sessionContent: selectedOptions.map(o => o.label).join(', ')
    });
    localStorage.setItem(
      'sessionName',
      JSON.stringify(selectedOptions.map(o => o.label).join(', '))
    );
    localStorage.setItem('sessionId', JSON.stringify(value[1]));
  };

  handleCancelCheckoutModal = () => {
    this.setState(prevState => ({
      showCheckoutModal: !prevState.showCheckoutModal
    }));
    localStorage.removeItem('selectedPlaces');
    localStorage.removeItem('availablePlaces');
    localStorage.removeItem('sessionName');
    localStorage.removeItem('sessionId');
  };

  convertDataToOptions = data => {
    if (!data.length) return;
    const result = [];
    const monthes = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ];
    data.map(el => {
      const obj = {};
      const lastArrObject = result[result.length - 1];
      if (!result.length || lastArrObject.date !== el.date) {
        const dateTxt = el.date.split('.');
        obj.value = el._id;
        obj.date = el.date;
        obj.label =
          (dateTxt[0][0] === '0' ? dateTxt[0][1] : dateTxt[0]) +
          ' ' +
          monthes[+dateTxt[1] - 1];
        obj.children = [{ value: el._id, label: el.time }];
        result.push(obj);
      } else {
        lastArrObject.children.push({ value: el._id, label: el.time });
      }
      return true;
    });
    return result;
  };

  handleProcessPayment = () => {
    const cardNumber = document.getElementById('ch-card-number').value;
    const cardOwner = document.getElementById('ch-name').value;
    const startDate = document.getElementById('ch-st-date').value;
    const endDate = document.getElementById('ch-end-date').value;
    const cvc = document.getElementById('ch-cvc').value;

    if (this.state.currentStep > 0) return;
    if (
      !cardNumber.match(/^\d+$/) ||
      cardNumber.length < 16 ||
      !cardOwner.length ||
      cardOwner.split(' ').length !== 2 ||
      !cardOwner.match(/^[a-zA-Z\s]*$/) ||
      startDate.length < 2 ||
      startDate < 0 ||
      startDate > 12 ||
      !startDate.match(/^\d+$/) ||
      !endDate.match(/^\d+$/) ||
      endDate.length < 2 ||
      endDate > new Date().getFullYear() - 1996 ||
      endDate < new Date().getFullYear() - 2000 ||
      (startDate < new Date().getMonth() + 1 &&
        endDate === new Date().getFullYear() - 2000 + '') ||
      cvc.length < 3 ||
      !cvc.match(/^\d+$/)
    ) {
      message.error('Проверьте введенные данные!');
      return;
    }
    this.setState({ currentStep: 1 }, () => {
      axios
        .post(
          BOOK_PLACES,
          {
            sessionId: JSON.parse(localStorage.getItem('sessionId')),
            places: JSON.parse(localStorage.getItem('selectedPlaces'))
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          }
        )
        .then(res => {
          this.setState({ currentStep: 2 }, () => {
            this.openNotificationWithIcon('success');
            this.handleCancelCheckoutModal();
          });
        })
        .catch(e => {
          message.error('Похоже, что выбранное вами место уже занято :(');
          this.handleCancelCheckoutModal();
        });
    });
  };

  openNotificationWithIcon = type => {
    notification[type]({
      message: 'Вы успешно приобрели билеты!',
      description:
        'Мы отправили вам SMS с купленными вами местами. Билеты вы сможете получить, указав в кассе свой номер телефона.',
      duration: 5
    });
  };

  loadSessions = () => {
    this.setState({ isLoading: true });
    axios
      .post(GET_MOVIE_SESSIONS, { movieId: this.state.movieData._id })
      .then(res =>
        this.setState({
          sessions: res.data.sort((a, b) => {
            const aa = a.date
              .split('.')
              .reverse()
              .join();
            const bb = b.date
              .split('.')
              .reverse()
              .join();
            return aa < bb ? -1 : aa > bb ? 1 : 0;
          }),
          isLoading: false
        })
      )
      .catch(e => message.error('Что-то пошло не так! :('));
  };

  formatMovieGenres = genres => {
    genres[0] = genres[0].slice(0, 1).toUpperCase() + genres[0].slice(1);
    genres = genres.join(', ');
    return genres;
  };

  handleToggleEditModal = () => {
    this.setState(prevState => ({
      showEditMovieModal: !prevState.showEditMovieModal
    }));
  };

  handleGoToHomePage = () => {
    this.props.history.push('/');
  };

  render() {
    const {
      showTrailer,
      sessionContent,
      sessions,
      showCheckoutModal,
      showEditMovieModal,
      currentStep,
      movieData,
      isLoading
    } = this.state;
    const options = this.convertDataToOptions(sessions);

    return (
      <div>
        {showCheckoutModal && (
          <Checkout
            price={
              sessions.length
                ? sessions.find(
                    session =>
                      session._id ==
                      JSON.parse(localStorage.getItem('sessionId'))
                  ).price
                : {}
            }
            step={currentStep}
            processPayment={this.handleProcessPayment}
            closeModal={this.handleCancelCheckoutModal}
          />
        )}
        {showEditMovieModal && (
          <EditMovie
            closeModal={this.handleToggleEditModal}
            movieData={movieData}
            sessions={sessions}
            edit={true}
            goToHomePage={this.handleGoToHomePage}
          />
        )}
        {showTrailer && (
          <div className="trailer-window">
            <iframe
              width="800"
              height="450"
              src={`https://www.youtube.com/embed/${movieData.trailerUrl.slice(
                -11
              )}`}
              frameBorder="0"
              title="movie trailer"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        <div className="movie-page">
          <img
            className="movie-page__poster"
            src={movieData.posterUrl !== '' ? movieData.posterUrl : placeholder}
            alt="Постер"
          />
          <div className="movie-page__about">
            <h2 className="movie-title">{movieData.title}</h2>
            <div className="movie-genres">
              {movieData.genres &&
                this.formatMovieGenres([...movieData.genres])}
            </div>
            <p className="movie-desc">{movieData.description}</p>
            {movieData.trailerUrl && (
              <Button
                id="watch-trailer"
                size="large"
                icon="caret-right"
                type="primary"
                shape="round"
                onClick={this.onOpenTrailerWindow}
              >
                Трейлер
              </Button>
            )}
            <div className="movie-sessions">
              <div className="session">
                <Cascader
                  options={options}
                  notFoundContent={
                    isLoading ? (
                      <div style={{ textAlign: 'center' }}>
                        <Spin style={{ display: 'block' }} type="down" />
                        Загрузка...
                      </div>
                    ) : (
                      <div className="no-sessions">
                        <Icon type="inbox" />
                        Сенансов нет
                      </div>
                    )
                  }
                  onClick={this.loadSessions}
                  onChange={this.onSessionChange}
                >
                  <div className="session-picker">Выберите сеанс:</div>
                </Cascader>
                &nbsp;
                {sessionContent}
              </div>
              {!this.props.isSignedIn || sessionContent === 'Не выбрано' ? (
                <Tooltip
                  placement="bottomLeft"
                  title="Для продолжения необходимо авторизироваться и выбрать сеанс"
                  trigger="click"
                  arrowPointAtCenter
                >
                  <button className="disabled-link ant-btn ant-btn-danger ant-btn-round ant-btn-lg">
                    Выбрать места
                  </button>
                </Tooltip>
              ) : (
                <a
                  href="/seats.html"
                  className="ant-btn ant-btn-danger ant-btn-round ant-btn-lg"
                >
                  Выбрать места
                </a>
              )}
              {this.props.isAdmin && (
                <Button
                  type="primary"
                  className="edit-movie"
                  onClick={this.handleToggleEditModal}
                >
                  <Icon type="edit" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MoviePage;
