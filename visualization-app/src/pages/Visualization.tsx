import SimpleLineChart from "../visualizations/SimpleLineChart";
import SimpleRadarChart from "../visualizations/SimpleRadarChart";


export function Visualization() {
    return (
        <main className="flex-1 p-2 ml-4">
            <h2 className="text-4xl font-semibold ">Visualization</h2>
            <SimpleRadarChart/>
            <SimpleLineChart/>
        </main>
  );
}
export default Visualization;