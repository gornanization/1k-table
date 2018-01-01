import { isTrickPostion } from './components/Position';

export function getRandomDeg() {
    const sign = !!Math.floor(Math.random() * 2);
    const random =  Math.ceil(Math.random() * 5);

    return sign ? random : -random;
}

export function findCardByRandAndSuit(cards, rank, suit) {
    return cards.find((card) => rank === card.rank && suit === card.suit);
}

export function getTotalCardsInTrick(cards) {
    return cards.filter(card => isTrickPostion(card.position)).length;
}

export function getRankAndSuitByPattern(pattern) {
    const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

    const result = CARD_PATTERN_REGEX.exec(pattern);
    const [, rank, suit] = result;
    return [rank, suit];
}

export function isBomb(pointValue) {
    return null === pointValue;
}

export function getTotalBombsByPoints(pointValues) {
    return _.chain(pointValues).filter(isBomb).value().length;
}