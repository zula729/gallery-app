type LabelProps = {
    text: string;
    type?: 'keyword' | 'tag' | 'technology' | 'semestr';
};

const colorMap = {
    keyword: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    tag: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    technology: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    semestr: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
};

function Label({ text, type = 'keyword' }: LabelProps) {
    return (
        <span
            className={`rounded-full text-sm font-medium flex items-center p-0.5 pl-2 pr-2 ${colorMap[type]}`}
        >
            {(() => {
                const replaced = text.replace(/_/g, ' ').replace(/podzim/gi, 'autumn');
                return replaced.charAt(0).toUpperCase() + replaced.slice(1).toLowerCase();
            })()}
        </span>
    );
}

export default Label;
