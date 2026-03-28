
function Label({text} : {text: string}) {
    return (
        <div className="rounded-xl bg-gray-200 flex items-center p-0.5 pl-2 pr-2">
            {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/_/g, " ")}
        </div>
    );
}

export default Label;