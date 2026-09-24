import { createContext } from 'react';

import type { CardType } from '../types/CardType';

export const CardsContext = createContext<CardType[]>([]);
