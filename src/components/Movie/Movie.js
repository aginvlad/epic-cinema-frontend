import React from 'react';
import { Button } from 'antd';
import './Movie.sass';
import placeholder from '../../assets/movie-placeholder.png';

const movie = props => {
  const { data } = props;
  return (
    <div className="movie">
      <img
        className="movie__poster"
        src={data.posterUrl !== '' ? data.posterUrl : placeholder}
        alt="Постер"
        onClick={props.goToMoviePage}
      />
      <div className="movie__title" onClick={props.goToMoviePage}>
        {data.title}
      </div>
      <Button
        className="movie__order-btn"
        ghost="true"
        type="primary"
        shape="round"
        size="large"
        onClick={props.goToMoviePage}
      >
        Купить билет
      </Button>
    </div>
  );
};

export default movie;
