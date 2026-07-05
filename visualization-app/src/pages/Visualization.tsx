import StackedBarChart from '../visualizations/StackedBarChart';
import { TAGS, TECHNOLOGY } from '../types/filterOptions';

export function Visualization() {
    return (
        <main className="flex-1 p-8 ml-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
                        Visualization
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Overview of technology and tag distribution across projects
                    </p>
                </div>
            </div>
            <div className="space-y-6 pt-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                        Technology Distribution
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        Frequency of tehcnologies used across projects
                    </p>
                    <StackedBarChart
                        options={TECHNOLOGY}
                        cardField="technology"
                        dataKey="tech"
                        minTotal={5}
                        height={500}
                    />
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                        Tag Distribution
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        Frequency of tags across projects
                    </p>
                    <StackedBarChart
                        options={TAGS}
                        cardField="tags"
                        dataKey="tag"
                        height={500}
                        yAxisStep={10}
                    />
                </div>
            </div>
        </main>
    );
}

export default Visualization;
