import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';

export const SessionChart = () => {
  const chartData = [
    { day: 'Monday\n13-Oct', inSession: 120, notInSession: 30 },
    { day: 'Tuesday\n14-Oct', inSession: 125, notInSession: 30 },
    { day: 'Wednesday\n15-Oct', inSession: 30, notInSession: 30 },
    { day: 'Thursday\n16-Oct', inSession: 60, notInSession: 30 },
    { day: 'Friday\n17-Oct', inSession: 90, notInSession: 30 },
    { day: 'Saturday\n18-Oct', inSession: 0, notInSession: 0 },
    { day: 'Sunday\n19-Oct', inSession: 0, notInSession: 0 },
  ];

  return (
    <div className='bg-white p-4 rounded-lg shadow-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Session - By Grade
        </h2>
        <select className='border border-gray-300 rounded-md p-1 text-sm'>
          <option>9th Grade</option>
          <option>10th Grade</option>
          <option>11th Grade</option>
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width='100%' height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          barCategoryGap='25%' // controls gap between groups
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis dataKey='day' tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend
            iconType='circle'
            iconSize={10}
            wrapperStyle={{
              paddingTop: '10px',
              display: 'flex',
              justifyContent: 'center',
              gap: '40px', // ✅ spacing between legend items
            }}
          />

          {/* Two separate bars, not stacked */}
          <Bar
            dataKey='inSession'
            fill='#144fbe'
            radius={[8, 8, 0, 0]} // rounded top corners
            barSize={10} // thinner bar width
            name='Students in Session'
            activeBar={<Rectangle fill='#144fbe' stroke='#144fbe' />}
          />
          <Bar
            dataKey='notInSession'
            fill='#f3745a'
            radius={[8, 8, 0, 0]}
            barSize={10}
            name='Students Not in Session'
            activeBar={<Rectangle fill='#f3745a' stroke='#f3745a' />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
