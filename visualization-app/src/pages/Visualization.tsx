import { useCards } from '../hooks/useCards';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { ChartCard } from '../components/ChartCard';

export function Visualization() {
    const cards = useCards();
    const { tags, technology, semester } = useFilterOptions(cards);

    return (
        <main className="flex-1 p-8 ml-4">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-dark-text">
                Visualization
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Overview of technology and category distribution across projects
            </p>

            <div className="space-y-6 pt-4">
                <ChartCard
                    title="Technology Distribution"
                    description="Frequency of technologies used across projects"
                    cards={cards}
                    options={technology}
                    semesters={semester}
                    cardField="technology"
                    dataKey="tech"
                    minTotal={5}
                    height={500}
                />
                <ChartCard
                    title="Category Distribution"
                    description="Frequency of categories across projects"
                    cards={cards}
                    options={tags}
                    semesters={semester}
                    cardField="tags"
                    dataKey="tag"
                    height={500}
                    yAxisStep={10}
                />
            </div>
        </main>
    );
}

export default Visualization;
