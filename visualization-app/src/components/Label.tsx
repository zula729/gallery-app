type LabelProps = {
    text: string;
    type?: "keyword" | "tag" | "technology";
}

const colorMap = {
    keyword:    "bg-blue-100 text-blue-700",
    tag:        "bg-amber-100 text-amber-700",
    technology: "bg-green-100 text-green-700",
}

function Label({ text, type = "keyword" }: LabelProps) {
    return (
        <span className={`rounded-xl flex items-center p-0.5 pl-2 pr-2 ${colorMap[type]}`}>
            {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/_/g, " ")}
        </span>
    );
}

export default Label;
