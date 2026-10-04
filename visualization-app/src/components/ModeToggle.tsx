import type { FilterMode } from '../types/filterType';

type ModeToggleProps = {
    mode: FilterMode;
    onChange: (mode: FilterMode) => void;
};

const MODES: FilterMode[] = ['OR', 'AND'];

function ModeToggle({ mode, onChange }: ModeToggleProps) {
    return (
        <div className="flex text-xs font-medium bg-gray-100 dark:bg-dark-surface rounded-full p-0.5 gap-0.5">
            {MODES.map((m) => (
                <button
                    key={m}
                    onClick={() => onChange(m)}
                    className={`px-3 py-0.5 rounded-full transition-all duration-200 ${
                        mode === m
                            ? 'bg-white dark:bg-[#3d3d3d] text-gray-800 dark:text-[#ADADAD] shadow-sm'
                            : 'text-gray-400 dark:text-[#5C5C5C] hover:text-gray-600 dark:hover:text-dark-text cursor-pointer'
                    }`}
                >
                    {m}
                </button>
            ))}
        </div>
    );
}

export default ModeToggle;
