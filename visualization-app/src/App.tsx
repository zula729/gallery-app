import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Searchbar from "./Searchbar"
import type { CardType  } from "./types/CardType ";
import Card from "./Card"; 
import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

function App() {
    const [card, setCard] = useState<CardType []>([]);
    const [search, setSearch] = useState("");
    const filtered = card.filter(c =>
        c.author?.toLowerCase().includes(search.toLowerCase()) ||
        c.keywords?.some(kw => kw.toLowerCase().includes(search.toLowerCase())) ||
        c.technology?.some(tech => tech.toLowerCase().includes(search.toLowerCase())) ||
        c.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );  
    useEffect(() => {
    const cardsRef = ref(db, "Keywords from projects"); 

    const unsubscribe = onValue(cardsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsed: CardType [] = Object.entries(data).map(([id, entry]: any) => ({
                    id,
                    author: entry.author,
                    keywords: entry.keywords,
                    semestr: entry.semester,
                    tags: entry.tags,
                    technology: entry.technology,
                }));
                setCard(parsed);
            } else {
                setCard([]); 
            }
        });
        return () => unsubscribe();
    }, []);
    
    return (
    <div className="flex flex-col min-h-screen">
        <Header />
            <div className="flex flex-1"> 
                <div className="sticky top-0 self-start h-screen">
                    <Sidebar />
                </div>
                <main className="flex-1 p-2 ml-4">
                    <h2 className="text-4xl font-semibold ">Gallery</h2>
                    <div> <Searchbar value={search} onChange={setSearch} /> </div>
                    <div className="flex flex-row pt-2 gap-8 flex-wrap mt-4">
                        {filtered.map(c => (
                            <Card key={c.id} card={c} />
                        ))}
                        </div>
                </main>
            </div>
        <Footer />
    </div>
  );
}

export default App;