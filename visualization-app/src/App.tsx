import Sidebar from './components/Sidebar';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { Visualization } from './pages/Visualization';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import ProjectDetails from './components/ProjectDetails';

function App() {
    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
                <div className="flex flex-1">
                    <div className="sticky top-0 self-start h-screen">
                        <Sidebar />
                    </div>
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" replace />} />
                            <Route path="home" element={<Home />} />
                            <Route path="gallery" element={<Gallery />} />
                            <Route path="visualization" element={<Visualization />} />
                            <Route path="/gallery/:id" element={<ProjectDetails />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
