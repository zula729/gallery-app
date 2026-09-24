import Counter from '../components/Counter';
import { useCards } from '../hooks/useCards';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useMemo } from 'react';

export function Home() {
    const cards = useCards();
    const count = cards.length;
    const { semester } = useFilterOptions(cards);

    const latestYear = useMemo(() => {
        const years = semester
            .map((s) => parseInt(s.match(/\d{4}/)?.[0] ?? '', 10))
            .filter((y) => !Number.isNaN(y));
        return years.length > 0 ? Math.max(...years) : '—';
    }, [semester]);
    return (
        <main className="flex-1 ml-4 min-h-screen relative">
            <div>
                <div className="p-8">
                    <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
                        Welcome
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">FI MU · Brno</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 max-w-8/10 space-y-6 pt-4">
                        A showcase of student visualization projects from Masaryk University. Browse
                        projects, explore the technologies used, and discover what students have
                        accomplished each semester.
                    </p>
                    <div className="flex flex-row gap-4 mb-6 pr-10 max-w-8/10">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 basis-md">
                            <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                                {semester.length}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                Semesters
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 basis-md">
                            <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                                FI MU
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Faculty</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 basis-md">
                            <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                                {latestYear}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                Latest cohort
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 basis-md">
                            <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                                <Counter
                                    from={0}
                                    to={count}
                                    separator=","
                                    direction="up"
                                    duration={1}
                                    className="count-up-text"
                                    delay={0}
                                />
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                Projects number
                            </p>
                        </div>
                    </div>
                </div>
                <a
                    href="https://is.muni.cz/predmet/fi/PV251"
                    className="block p-5 border-l-4 border-amber-700 dark:border-amber-500 hover:border-l-6 duration-100 mb-4"
                >
                    <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-1 text-lg">
                        PV251 Visualization
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-8/10 space-y-6">
                        The goal is to provide students with an overview of the field of
                        visualization and its principles and methods. Students will be acquainted
                        with various interaction techniques for data manipulation and practical
                        applications of visualization in medicine, art, and more.
                    </p>
                </a>
            </div>
        </main>
    );
}

export default Home;
