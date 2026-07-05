type SearchbarProps = {
    value: string;
    onChange: (value: string) => void;
};

function Searchbar({ value, onChange }: SearchbarProps) {
    return (
        <input
            name="myInput"
            className="rounded-lg border-solid border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 flex items-center p-1 w-full text-gray-500 dark:text-gray-300 font-normal"
            placeholder="Search for projects..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

export default Searchbar;
