import { CardsContext } from './CardsContext';
import { useEffect, useState, type ReactNode } from 'react';
import { db } from '../hooks/firebase';
import { ref, onValue } from 'firebase/database';
import type { CardType } from '../types/CardType';

export function CardsProvider({ children }: { children: ReactNode }) {
    const [cards, setCards] = useState<CardType[]>([]);

    useEffect(() => {
        const cardsRef = ref(db, 'Keywords from projects');
        const unsubscribe = onValue(cardsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsed: CardType[] = Object.entries(data).map(([id, entry]: any) => ({
                    id,
                    author: Array.isArray(entry.author)
                        ? entry.author
                        : entry.author
                          ? [entry.author]
                          : [],
                    keywords: Array.isArray(entry.keywords) ? entry.keywords : [],
                    name: entry.name ?? '',
                    semestr: entry.semester ?? '',
                    tags: Array.isArray(entry.tags) ? entry.tags.map((t: string) => t.trim()) : [],
                    technology: Array.isArray(entry.technology)
                        ? entry.technology.map((t: string) => t.trim())
                        : [],
                    images: Array.isArray(entry.images) ? entry.images : [],
                    text: entry.text ?? '',
                    link: entry.link ?? ''
                }));
                setCards(parsed);
            } else {
                setCards([]);
            }
        });
        return () => unsubscribe();
    }, []);

    return <CardsContext.Provider value={cards}>{children}</CardsContext.Provider>;
}
