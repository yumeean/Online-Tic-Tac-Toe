import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Board from './Board';
import calculateWinner from './helpers';
import './Game.css';

const socket = io();

const styles = {
  width: '200px',
  margin: '20px auto',
};

function Game({ username }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [show, setShow] = useState(false);
  const [xNext, setXNext] = useState(true);
  const [playerX, setPlayerX] = useState(null);
  const [playerO, setPlayerO] = useState(null);
  const [xScore, setXScore] = useState(null);
  const [oScore, setOScore] = useState(null);
  const [spectList, setSpectList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [scores, setScores] = useState([]);
  const [gameStat, setGameStat] = useState(true);
  const win = calculateWinner(board);
  const onClickShow = () => setShow(!show);

  /* eslint-disable */
  function handleBoxClick(e, index) {
    if (xNext && gameStat === true && playerX === username) {
      socket.emit('board', {
        message: `Player clicked box ${index}`,
        index,
      });
    } if (!xNext && gameStat === true && playerO === username) {
      socket.emit('board', {
        message: `Player clicked box ${index}`,
        index,
      });
    } if (isSpect(username) || gameStat === false) {
      return null;
    }
  }
  /* eslint-enable */

  function handleClear() {
    setBoard(Array(9).fill(null));
    setXNext(true);
    setGameStat(true);
    socket.emit('reset', { message: 'Reset/Play Again was clicked' });
  }

  function isSpect() {
    return spectList.includes(username);
  }

  useEffect(() => {
    socket.on('board', (data) => {
      const newBoard = [...board];
      if (win || newBoard[data.index]) return;
      newBoard[data.index] = xNext ? 'X' : 'O';
      setBoard(newBoard);
      setXNext(!xNext);
    });
  }, [board, xNext, win]);

  useEffect(() => {
    socket.on('reset', () => {
      setBoard(Array(9).fill(null));
      setXNext(true);
    });
  }, []);

  useEffect(() => {
    socket.on('playerX', (data) => {
      setPlayerX(data.playerX);
      setXScore(data.score);
    });
  }, [playerX]);

  useEffect(() => {
    socket.on('playerO', (data) => {
      setPlayerO(data.playerO);
      setOScore(data.score);
    });
  }, [playerO]);

  useEffect(() => {
    socket.on('spectators', (data) => {
      const arr = data.spectators;
      setSpectList(arr);
    });
  }, [spectList]);

  useEffect(() => {
    socket.on('leaderboard', (data) => {
      setLeaderboard(data.users);
      setScores(data.scores);
    });
  }, []);

  useEffect(() => {
    if (win != null) {
      if (win === 'X') {
        // additional condition username
        socket.emit('winner', { winner: playerX, loser: playerO });
      } else if (win === 'O') {
        socket.emit('winner', { winner: playerO, loser: playerX });
      }
    }
  });
/* eslint-disable */
  return (
    <div className="container">
      <h1>
        {' '}
        Welcome
        {username}
      </h1>
      <Board squares={board} onClick={handleBoxClick} username={username} />
      {!isSpect(username) ? (
        <p>
          {win ? (
            <button type="button" onClick={handleClear}> Play Again </button>
          ) : (
            <button type="button" onClick={handleClear}> Reset </button>
          )}
        </p>
      ) : null}
      <div style={styles}>
        <h3>
          {' '}
          Player X :
          {playerX}
          {' '}
          -
          {xScore}
        </h3>
        <h3>
          {' '}
          Player O :
          {playerO}
          {' '}
          -
          {oScore}
        </h3>
      </div>
      <div>
        <p>{win ? `Winner: ${win}` : `Next Player: ${xNext ? 'X' : 'O'}`}</p>
        <p> Spectators:</p>
        {spectList.map((user, i) => (
          <p>
            {' '}
            {user}
            {' '}
          </p>
        ))}
      </div>
      <div>
        <h3> Leaderboard </h3>
        <button type="button" onClick={onClickShow}> Show Leaderboard </button>
        {show ? (
          <div className="leaderboard">
            {leaderboard.map((player, i) => (
              <p>
                {' '}
                {player}
                {' '}
              </p>
            ))}
            {scores.map((score, i) => (
              <p>
                {' '}
                {score}
                {' '}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
/* eslint-enable */
Game.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Game;
