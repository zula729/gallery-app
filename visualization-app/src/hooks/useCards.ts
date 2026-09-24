import { useContext } from 'react';
import { CardsContext } from '../context/CardsContext';

export function useCards() {
    return useContext(CardsContext);
}
