import { useParams } from 'react-router';
import { useCards } from '../hooks/useCards';
import { useMemo, useState } from 'react';
import Label from './Label';
import ReactMarkdown from 'react-markdown';
import Default from '../assets/default.png';
import remarkGfm from 'remark-gfm';

// Vytažené mimo komponentu - reference se nemění mezi rendery
function MarkdownLink({ href, children }: { href?: string; children?: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 underline ml-2"
        >
            {children}
        </a>
    );
}

const markdownComponents = { a: MarkdownLink };

function ProjectDetails() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { id } = useParams<{ id: string }>();
    const cards = useCards();
    const card = useMemo(() => cards.find((c) => c.id === id), [cards, id]);
    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    if (!card) {
        return <div>No project</div>;
    }

    return (
        <main className="flex-1 p-8 ml-4">
            <h2 className="text-4xl font-semibold mb-8 text-gray-900 dark:text-gray-100">
                Gallery/{card.name ?? ''}
            </h2>
            <div className="w-full max-w-5xl">
                <div className="relative w-full h-150 rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                    <img
                        src={card.images?.[currentImageIndex] ?? Default}
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 brightness-100"
                    />

                    <img
                        src={card.images?.[currentImageIndex] ?? Default}
                        alt={`carousel-image-${currentImageIndex}`}
                        className="relative max-w-full max-h-full object-contain"
                    />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                    {(card.images ?? []).map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`shrink-0 rounded-lg overflow-hidden border-3 cursor-pointer transition ${
                                currentImageIndex === index
                                    ? 'border-amber-200 dark:border-amber-600 opacity-100'
                                    : 'border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={image}
                                alt={`thumbnail-${index}`}
                                className="w-32 h-24 object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl">
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</p>
                <div className="flex flex-wrap gap-2 ml-2 mb-6">
                    {(card.tags ?? []).map((tags) => (
                        <Label key={tags} text={tags} type={'tag'}></Label>
                    ))}
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Technologies</p>
                <div className="flex flex-wrap gap-2 ml-2 mb-6">
                    {(card.technology ?? []).map((technology) => (
                        <Label key={technology} text={technology} type={'technology'}></Label>
                    ))}
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Semester</p>
                <div className="flex flex-wrap gap-2 ml-2 mb-6">
                    <Label key={card.semester} text={card.semester} type={'semester'}></Label>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2 ml-2 mb-6">
                    {(card.keywords ?? []).map((keyword) => (
                        <Label key={keyword} text={keyword} type={'keyword'}></Label>
                    ))}
                </div>
                {card.link && (
                    <>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Link</p>
                        <div className="prose dark:prose-invert max-w-none mb-6 ml-2">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            >
                                {card.link}
                            </ReactMarkdown>
                        </div>
                    </>
                )}
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Authors</p>
                <div className="flex flex-row gap-4 mb-6 ml-2">
                    {(card.author ?? []).map((author, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full border border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-xs font-bold text-amber-800 dark:text-amber-300">
                                {getInitials(author)}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {author}
                            </span>
                        </div>
                    ))}
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">About</p>
                <div className="prose dark:prose-invert max-w-none mt-2 mb-6 ml-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {card.text || 'No description provided'}
                    </ReactMarkdown>
                </div>
            </div>
        </main>
    );
}

export default ProjectDetails;
