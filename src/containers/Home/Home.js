import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import Movie from '../../components/Movie/Movie';
import EditMovie from '../../components/Modals/EditMovie/EditMovie';
import { downloadJSON } from '../../constants/functions';
import './Home.sass';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddMovieModal: false,
    };
  }

  onGoToMoviePage = (movie) => {
    this.props.history.push({
      pathname: '/movie-page',
      state: { movieData: movie },
    });
  };

  handleToggleAddModal = () => {
    this.setState((prevState) => ({
      showAddMovieModal: !prevState.showAddMovieModal,
    }));
  };

  render() {
    return (
      <>
        {this.props.isAdmin && this.state.showAddMovieModal && (
          <EditMovie sessions={[]} closeModal={this.handleToggleAddModal} />
        )}
        <main className="main">
          {this.props.isAdmin && (
            <div className="add-movie">
              <Button
                type="primary"
                style={{ marginRight: '1rem' }}
                onClick={this.handleToggleAddModal}
              >
                <Icon type="plus-circle" />
              </Button>
              <Button
                type="primary"
                onClick={() => downloadJSON(this.props.movies, 'movies')}
              >
                <Icon type="cloud-download" />
              </Button>
            </div>
          )}
          <h1 className="main__header">Сейчас в кино</h1>
          <div className="main__movies-container">
            {this.props.movies.length > 0 &&
              this.props.movies.map((movie, index) => (
                <Movie
                  key={index}
                  data={movie}
                  goToMoviePage={() => this.onGoToMoviePage(movie)}
                />
              ))}
          </div>
        </main>
        <section className="about">
          <p className="about__desc">
            Наше официальное веб-приложение представляет Вам киноафишу всех
            фильмов, идущих в нашем кинотеатре Epic Cinema. Вся информация о
            репертуаре является актуальной и позволяет Вам следить за новинками
            кино для детей и взрослых.
            <br />
            <br />
            <strong>Киноафиша Epic Cinema</strong> предоставляет актуальную и
            полную информацию о фильмах, которые сейчас в прокате, и о тех,
            которые ожидаются в нем.
            <br />
            <br />
            Мы предлагаем Вам ознакомиться с киноафишей на нашем сайте,
            посмотреть, <strong>что идет в кино в Минске</strong> сегодня и
            купить билеты онлайн в кинотеатр Epic Cinema не выходя из дома.
            <br />
            <br />
            Доставьте себе удовольствие от просмотра своих любимых фильмов! Ждем
            Вас у нас в кинотеатре Epic Cinema!
          </p>
        </section>
        <section className="contacts">
          <div className="contacts__info">
            <h2 className="section-header">Где мы находимся</h2>
            <p className="section-desc">
              Наш кинотеатр находится по адресу: Минск, улица Сурганова, 27
            </p>
            <p className="section-desc">
              Контактный номер телефона: +375 29 180 18 18
            </p>
            <Button
              ghost={true}
              className="sign-btn"
              size="large"
              icon="info-circle"
              onClick={() => this.props.history.push('/tickets')}
            >
              Правила возврата билетов
            </Button>
          </div>
          <div className="contacts__location"></div>
        </section>
      </>
    );
  }
}

export default Home;
