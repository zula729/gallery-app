export function Home() {
    return (
        <main className="flex-1 p-8 ml-4 max-w-4xl">
            <div className="mb-8">
                <h2 className="text-4xl font-semibold">Welcome</h2>
                {/* <p className="text-gray-400 text-sm mb-8">FI MU · Brno</p>

                <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-xl">
                    A showcase of student visualizations from Masaryk University. Browse projects,
                    explore technologies used, and discover what students accomplished each
                    semester.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xl font-semibold text-amber-600">2</p>
                        <p className="text-gray-400 text-xs mt-1">Semesters</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xl font-semibold text-amber-600">FI MU</p>
                        <p className="text-gray-400 text-xs mt-1">Faculty</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xl font-semibold text-amber-600">2025</p>
                        <p className="text-gray-400 text-xs mt-1">Latest cohort</p>
                    </div>
                </div> */}
            </div>
            <a
                href="https://is.muni.cz/predmet/fi/PV251"
                className="block p-5 border-l-4 border-amber-700 hover:border-l-6 duration-100 mb-4"
            >
                <h4 className="font-medium text-amber-700 mb-1 text-lg">PV251 Visualization</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                    The goal is to provide students with an overview of the field of visualization
                    and its principles and methods. Students will be acquainted with various
                    interaction techniques for data manipulation and practical applications of
                    visualization in medicine, art, and more.
                </p>
            </a>
        </main>
    );
}

export default Home;
