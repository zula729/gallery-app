import Label from './Label';

import type { CardType } from '../types/CardType';

import { useState, useRef, useEffect } from 'react';

import Default from '../assets/default.png';

type CardProps = {
    card: CardType;
};

type LabelWithType = {
    text: string;
    type: 'keyword' | 'tag' | 'technology';
};

function Card({ card }: CardProps) {
    const [expanded, setExpanded] = useState(false);
    const allLabels: LabelWithType[] = [
        ...(card.tags ?? [])
            .sort((a, b) => a.localeCompare(b))
            .map((tag) => ({ text: tag, type: 'tag' as const })),
        ...(card.technology ?? [])
            .sort((a, b) => a.localeCompare(b))
            .map((tech) => ({ text: tech, type: 'technology' as const })),
        ...(card.keywords ?? [])
            .sort((a, b) => a.localeCompare(b))
            .map((kw) => ({ text: kw, type: 'keyword' as const }))
    ].filter((label) => label !== undefined && label.text && label.text.trim() !== '');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const labelsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = labelsRef.current;
        if (!el) return;
        el.style.maxHeight = 'none';
        const fullHeight = el.scrollHeight;
        el.style.maxHeight = '';

        setIsOverflowing(fullHeight > 72);
    }, [allLabels]);

    return (
        <div className="rounded-2xl bg-white dark:bg-gray-800">
            <div className="flex flex-col">
                <div
                    className={`border border-gray-400 dark:border-gray-600 shadow-lg/20 rounded-2xl w-90 pb-3`}
                >
                    <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
                        <img
                            src={card.images?.[0] ?? Default}
                            aria-hidden
                            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 brightness-100"
                        />
                        <img
                            src={card.images?.[0] ?? Default}
                            className="relative z-10 w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col pl-2 pr-2 pt-2">
                        <div className="h-25">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {card.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {card.author.map((author, index) => (
                                    <span key={index}>
                                        {author}
                                        {index < card.author.length - 1 && ', '}
                                    </span>
                                ))}
                            </p>
                            <p className="text-m text-gray-700 dark:text-gray-300">
                                {(() => {
                                    const replaced = card.semestr
                                        .replace(/_/g, ' ')
                                        .replace(/podzim/gi, 'autumn');
                                    return (
                                        replaced.charAt(0).toUpperCase() +
                                        replaced.slice(1).toLowerCase()
                                    );
                                })()}
                            </p>
                        </div>
                        <hr className="mt-3 mb-2 border-gray-300 dark:border-gray-600"></hr>
                        <div>
                            <div className="relative">
                                <div
                                    ref={labelsRef}
                                    className={`flex flex-row pt-2 gap-1 flex-wrap overflow-hidden transition duration-300 
        ${expanded ? 'max-h-screen' : 'max-h-18'}`}
                                >
                                    {allLabels.map((label) => (
                                        <Label
                                            key={label.text}
                                            text={label.text}
                                            type={label.type}
                                        />
                                    ))}
                                </div>
                                {!expanded && isOverflowing && (
                                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white dark:from-gray-800 to-transparent" />
                                )}
                            </div>
                            <div className="h-5 mt-1">
                                {(isOverflowing || expanded) && (
                                    <button
                                        onClick={() => setExpanded((prev) => !prev)}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer text-left"
                                    >
                                        {expanded ? '↑ less' : 'more ↓'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;
