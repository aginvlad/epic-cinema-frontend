import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import NavBar from './components/NavBar/NavBar';
import SignIn from './components/Modals/SignIn/SignIn';
import SignUp from './components/Modals/SignUp/SignUp';
import UserProfile from './components/Modals/UserProfile/UserProfile';
import Home from './containers/Home/Home';
import MoviePage from './containers/MoviePage/MoviePage';
import { GET_CURRENT_USER, GET_MOVIES } from './constants/apiRoutes';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSignInModal: false,
      showSignUpModal: false,
      is404: false,
      isSignedIn: !!localStorage.getItem('token'),
      user: {},
      movies: {},
      showProfileModal: false
    };
  }

  componentDidMount() {
    if (this.state.isSignedIn) {
      axios
        .get(GET_CURRENT_USER, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        })
        .then(res => this.setState({ user: res.data }))
        .catch(e => {
          this.setState({ isSignedIn: false });
          localStorage.removeItem('token');
        });
    }
    axios.get(GET_MOVIES).then(res => this.setState({ movies: res.data }));
  }

  handleToggleSignInModal = () => {
    this.setState(prevState => ({
      showSignInModal: !prevState.showSignInModal
    }));
  };

  handleTogleSignUpModal = () => {
    this.setState(prevState => ({
      showSignUpModal: !prevState.showSignUpModal
    }));
  };

  handleUserSelect = value => {
    if (value[0] === 'edit') {
      this.handleToggleHideUserProfileModal();
    } else if (value[0] === 'exit') {
      this.setState({ isSignedIn: false });
      localStorage.removeItem('token');
    }
  };

  handleToggleHideUserProfileModal = () => {
    this.setState(prevState => ({
      showProfileModal: !prevState.showProfileModal
    }));
  };

  handleUserSignedIn = (data, remember) => {
    const { token, user } = data;
    this.setState({ isSignedIn: true, user });
    if (remember) localStorage.setItem('token', token);
    if (this.state.showSignInModal) this.handleToggleSignInModal();
  };

  render() {
    const {
      showSignInModal,
      showSignUpModal,
      isSignedIn,
      showProfileModal,
      user,
      movies
    } = this.state;
    return (
      <>
        <NavBar
          userName={user.name}
          isSignedIn={isSignedIn}
          handleSelect={this.handleUserSelect}
          openSignInModal={this.handleToggleSignInModal}
        />
        {showSignInModal && (
          <SignIn
            showSignUpModal={this.handleTogleSignUpModal}
            closeSignInModal={this.handleToggleSignInModal}
            userSignedIn={this.handleUserSignedIn}
          />
        )}
        {showSignUpModal && (
          <SignUp
            userSignedIn={this.handleUserSignedIn}
            closeSignUpModal={this.handleTogleSignUpModal}
          />
        )}
        {showProfileModal && (
          <UserProfile
            userName={user.name}
            closeModal={this.handleToggleHideUserProfileModal}
          />
        )}
        <Switch>
          <Route
            path="/"
            exact
            render={props => (
              <Home {...props} isAdmin={user.isAdmin} movies={movies} />
            )}
          />
          <Route
            path="/movie-page"
            exact
            render={props => (
              <MoviePage
                {...props}
                isAdmin={user.isAdmin}
                isSignedIn={isSignedIn}
              />
            )}
          />
          <Route
            path="/tickets"
            exact
            render={props => (
              <div style={{ marginTop: '2.5rem' }}>
                <h2 className="section-header" style={{ textAlign: 'center' }}>
                  Правила возврата билетов
                </h2>
                <p className="section-desc">
                  Информация, содержащаяся в билете, подлежит проверке зрителем
                  в момент приобретения билета. Приобретенные зрителями билеты
                  обмену не подлежат за исключением случаев, установленных
                  законодательством. Утерянный зрителем билет не возобновляется,
                  стоимость его не возмещается.
                  <br />
                  <br />
                  Пожалуйста, внимательно проверяйте дату и время сеанса, а
                  также адрес кинотеатра, в который вы приобретаете билет.
                </p>
              </div>
            )}
          />
          <Redirect to="/" />
        </Switch>
      </>
    );
  }
}

export default App;
