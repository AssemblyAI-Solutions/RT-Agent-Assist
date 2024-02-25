import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SentimentChart = ({ data, width, height }) => {
  return (
    <div style={{backgroundColor: 'white', borderRadius: 10, margin: 10, fontSize: 12}}>
    <LineChart
      width={750}
      height={300}
      data={data}
      margin={{
        top: 20,
        // right: 30,
        // left: 20,
        bottom: 20,
      }}
    >
      <CartesianGrid strokeDasharray="2 2" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="agent" stroke="#000000" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="customer" stroke="red" />
    </LineChart>
    </div>
  );
};

export default SentimentChart;
