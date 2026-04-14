import SimpleBarChart from '../visualizations/SimpleBarChart';
import SpecifiedDomainRadarChart from '../visualizations/SpecifiedDomainRadarChart';

export function Visualization() {
    return (
        <main className="flex-1 p-2 ml-4">
            <h2 className="text-4xl font-semibold ">Visualization</h2>
            <SimpleBarChart />
            <SpecifiedDomainRadarChart />
        </main>
    );
}
export default Visualization;
