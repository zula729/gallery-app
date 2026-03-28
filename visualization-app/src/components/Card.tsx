import image from "../assets/image.png"
import Label from "./Label";

import type { CardType  } from "../types/CardType";

import { useState } from "react";

type CardProps = {
  card: CardType 
}

const MAX_LABELS = 5;

function Card({ card } : CardProps) {
  const [expanded, setExpanded] = useState(false)
  const allLabels = [
    ...(card.keywords ?? []).sort((a, b) => a.localeCompare(b)),
    ...(card.tags ?? []).sort((a, b) => a.localeCompare(b)),
    ...(card.technology ?? []).sort((a, b) => a.localeCompare(b)),
].filter(label => label && label.trim() !== "")
  const visibleLabels = expanded ? allLabels : allLabels.slice(0, MAX_LABELS);

  return (
    <div className="rounded-2xl bg-white">
      <div className="flex flex-col">
        <div className={`border border-gray-400 shadow-lg/20 rounded-xl w-80 pb-3 transition-all duration-300 ${expanded ? "h-auto" : "h-85"}`}>
          <img className="object-cover rounded-t-xl w-full h-30"src={image}/>
          <div className="flex flex-col pl-2 pr-2 pt-2">
            <h2 className="text-xl font-semibold">{card.name}</h2>
            <p className="text-sm text-gray-500">{card.author}</p>
            <p className="text-m">{card.semestr}</p>
            <hr className="mt-3 mb-2 border-gray-300"></hr>
            <div className={`flex flex-row pt-2 gap-1 flex-wrap overflow-hidden transition-all duration-300 `}>
              {visibleLabels.map((label) => (
                <Label key={label} text={label}/>
                ))}
                {allLabels.length > MAX_LABELS && (
                  <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    {expanded ? "↑ less" : `+${allLabels.length - MAX_LABELS} more`}
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;