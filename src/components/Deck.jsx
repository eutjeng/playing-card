import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, ButtonBase, ButtonGroup, MenuItem, Select } from '@mui/material';

import cardImageMapper from 'domain/mappers/cardImageMapper';
import deckMapper from 'domain/mappers/deckMapeer';

import { SUITS, VALUES_52_FULL } from 'domain/constants';

import ReplayIcon from '@mui/icons-material/Replay';

const deckSelectedMapper = SUITS.reduce((deck, suit) => {
  const collection = VALUES_52_FULL.map(value => `${value}_of_${suit}`);

  return {
    ...deck,
    [suit]: collection.reduce(
      (acc, curr) => ({ ...acc, [curr]: { selected: false, outside: false, inEnemy: false } }),
      {},
    ),
  };
}, {});

const Deck = () => {
  const [cardState, setCardState] = useState(
    JSON.parse(localStorage.getItem('cardState')) || deckSelectedMapper,
  );
  const [deckCount, setDeckCount] = useState(
    JSON.parse(JSON.parse(localStorage.getItem('deckCount'))) || 52,
  );

  const deck = useMemo(
    () =>
      SUITS.reduce((deck, suit) => {
        const collection = deckMapper[deckCount].map(value => `${value}_of_${suit}`);

        return { ...deck, [suit]: collection };
      }, {}),
    [deckCount],
  );

  const handleCardClick = useCallback(
    (suit, cardName) => {
      setCardState({
        ...cardState,
        [suit]: {
          ...cardState[suit],
          [cardName]: {
            ...{ ...cardState[suit][cardName], selected: !cardState[suit][cardName]?.selected },
          },
        },
      });
    },
    [cardState],
  );

  const updateDeck = useCallback(
    newState => {
      const updatedState = Object.entries(deck).reduce((acc, [suit, collection]) => {
        const cards = collection.reduce((acc, cardName) => {
          return {
            ...acc,
            [cardName]: cardState[suit][cardName].selected ? newState : cardState[suit][cardName],
          };
        }, {});

        return {
          ...acc,
          [suit]: cards,
        };
      }, {});

      setCardState(updatedState);
    },
    [cardState, deck],
  );

  const handleOutsideClick = useCallback(() => {
    updateDeck({ outside: true, inEnemy: false, selected: false });
  }, [updateDeck]);

  const handleInEnemyClick = useCallback(() => {
    updateDeck({ outside: false, inEnemy: true, selected: false });
  }, [updateDeck]);

  const handleResetClick = useCallback(() => {
    updateDeck({ outside: false, inEnemy: false, selected: false });
  }, [updateDeck]);

  useEffect(() => {
    try {
      const stringCardState = JSON.stringify(cardState);

      localStorage.setItem('cardState', stringCardState);
    } catch {}
  }, [cardState]);

  useEffect(() => {
    localStorage.setItem('deckCount', deckCount);
  }, [deckCount]);

  return (
    <Fragment>
      {Object.entries(deck).map(([suit, collection]) => {
        return (
          <div key={suit} className='suit'>
            {collection.map(cardName => {
              const CardImage = cardImageMapper[cardName];

              return (
                <div
                  className={`shadow${cardState[suit][cardName].selected ? ' selected' : ''}${
                    cardState[suit][cardName].outside ? ' outside' : ''
                  }${cardState[suit][cardName].inEnemy ? ' in-enemy' : ''}`}
                  key={cardName}
                >
                  <div className='card' onClick={() => handleCardClick(suit, cardName)}>
                    <ButtonBase className='card-button'>
                      <CardImage className='card-image' />
                    </ButtonBase>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <ButtonGroup style={{ gap: '15px' }}>
        <Button
          variant='contained'
          color='secondary'
          onClick={handleOutsideClick}
          style={{ flex: 1, background: 'white', color: 'black' }}
        >
          Бито
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleInEnemyClick}
          style={{ flex: 1, background: '#9F0E03' }}
        >
          У противника
        </Button>
        <Button
          variant='outlined'
          onClick={handleResetClick}
          style={{ flex: 1, color: 'white', border: '1px solid white' }}
        >
          Очистить
        </Button>
        <Select
          value={deckCount}
          label='Кол-во карт'
          onChange={event => setDeckCount(event.target.value)}
          style={{ color: 'white' }}
          variant='filled'
        >
          <MenuItem value={36}>36</MenuItem>
          <MenuItem value={52}>52</MenuItem>
        </Select>
        <Button onClick={() => setCardState(deckSelectedMapper)}>
          <ReplayIcon />
        </Button>
      </ButtonGroup>
    </Fragment>
  );
};

export default Deck;
