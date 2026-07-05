type LabelProps = {
    text: string;
    type?: 'keyword' | 'tag' | 'technology' | 'semestr';
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
            {(() => {
                const replaced = text.replace(/_/g, ' ').replace(/podzim/gi, 'autumn');
                return replaced.charAt(0).toUpperCase() + replaced.slice(1).toLowerCase();
            })()}
        </span>
    );
}

export default Label;
