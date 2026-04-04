import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Home } from "./pages/Home";
import { Gallery } from "./pages/Gallery";
import {Visualization } from "./pages/Visualization";
import { HashRouter, Routes, Route } from "react-router";

function App() {
    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen">
                <div className="flex flex-1">
                    <div className="sticky top-0 self-start h-screen">
                        <Sidebar />
                    </div>
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/visualization" element={<Visualization />} />
                        </Routes>
                    </main>
                </div>
                <Footer />
            </div>
        </HashRouter>
    );
}

export default App;