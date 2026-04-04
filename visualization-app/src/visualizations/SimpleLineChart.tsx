import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

export default function Example() {
  return (
    <ResponsiveContainer width="100%" aspect={1.618}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis width={50} stroke="#6b7280" />
        <Tooltip
          cursor={{ stroke: '#d1d5db' }}
          contentStyle={{
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#6366f1"
          dot={{ fill: '#ffffff' }}
          activeDot={{ r: 8, stroke: '#6366f1' }}
        />
        <Line
          type="monotone"
          dataKey="uv"
          stroke="#f59e0b"
          dot={{ fill: '#ffffff' }}
          activeDot={{ r: 6, stroke: '#f59e0b' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}