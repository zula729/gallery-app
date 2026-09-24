import { formatLabel } from '../utils/formatLabel';

export type LabelType = 'keyword' | 'tag' | 'technology' | 'semestr';

type LabelProps = {
    text: string;
    type?: LabelType;
};

const colorMap = {
    keyword:
        'bg-gray-100 text-gray-600 border dark:bg-transparent dark:text-gray-100 dark:border-gray-500',
    tag: 'bg-amber-50 text-amber-600 border dark:bg-transparent dark:text-gray-100 dark:border-amber-500',
    technology:
        'bg-green-50 text-green-600 border dark:bg-transparent dark:text-gray-100 dark:border-teal-500',
    semestr:
        'bg-blue-50 text-blue-600 border dark:bg-transparent dark:text-gray-100 dark:border-blue-500'
};

function Label({ text, type = 'keyword' }: LabelProps) {
    return (
        <span
            className={`rounded-full text-sm font-medium flex items-center p-1 pl-2 pr-2 ${colorMap[type]}`}
        >
            {formatLabel(text)}
        </span>
    );
}

export default Label;
