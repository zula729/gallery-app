import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1"> 
        <Sidebar />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold">Hlavní obsah</h2>
          <p></p>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;