
type SearchbarProps = {
  value: string;
  onChange: (value: string) => void;
}

function Searchbar({value, onChange} : SearchbarProps) {
    return (
    <input name="myInput" className="rounded-lg border-solid border-2 border-gray-300 flex items-center p-1 w-full text-gray-500 "  
        placeholder="Search for projects..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
    />
    )
}

export default Searchbar;