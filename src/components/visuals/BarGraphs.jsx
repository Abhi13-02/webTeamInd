import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const BarGraphs = ({ data }) => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="userName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalPaid" fill="#8884d8" name="Total Paid" />
          <Bar dataKey="totalShare" fill="#82ca9d" name="Total Share" />
          <Bar dataKey="settlementCredit" fill="#ffc658" name="Settlement Credit" />
          <Bar dataKey="settlementDebit" fill="#ff8042" name="Settlement Debit" />
          <Bar dataKey="settlementBalance" fill="#8dd1e1" name="Settlement Balance" />
          <Bar dataKey="netBalance" fill="#a4de6c" name="Net Balance" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphs;
