import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SentimentChart = ({ data, width, height }) => {
  return (
    <div style={styles.mainDiv}>
    <p style={styles.componentHeader}>
        {'Real-Time Customer Sentiment'}
    </p>
    <div style={styles.divider}></div>
    <LineChart
      width={width}
      height={height}
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
      {/* <Legend /> */}
      {/* <Line type="monotone" dataKey="agent" stroke="#000000" activeDot={{ r: 8 }} /> */}
      <Line type="monotone" dataKey="customer" stroke="#2184e1" />
    </LineChart>
    </div>
  );
};

const styles = {
  mainDiv: {
    backgroundColor: 'white',
    borderRadius: '8px',
    borderStyle: 'none',
    boxShadow: '0px 8px 4px #0000001a',
    maxHeight: 500,
    overflowY: 'scroll',
    paddingTop: 10,
    paddingBottom: 10,
    margin: 10,
  },
  componentHeader: {
      color: '#3d3d3d',
      fontSize: 16,
      fontWeight: 600,
      paddingRight: 20,
      paddingLeft: 25,
      flexDirection: 'row',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  divider: {
    width: '100%', 
    height: 2, 
    backgroundColor: '#00000010', 
    marginTop: 0, 
    marginBottom: 10, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center'
},
}

export default SentimentChart;
