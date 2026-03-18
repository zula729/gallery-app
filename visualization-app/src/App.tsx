import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Card from "./Card";
import Searchbar from "./Searchbar"

function App() {
    return (
    <div className="flex flex-col min-h-screen">
        <Header />
            <div className="flex flex-1"> 
                <Sidebar />
                <main className="flex-1 p-2 ml-4">
                    <h2 className="text-4xl font-semibold ">Gallery</h2>
                    <div> <Searchbar /> </div>
                    <div className="flex flex-row pt-2 gap-8 flex-wrap mt-4">
                        <Card /> <Card /> <Card /> <Card /> <Card />
                    </div>
                </main>
            </div>
        <Footer />
    </div>
  );
}

export default App;