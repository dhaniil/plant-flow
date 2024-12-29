import React, { useState } from "react";

const GrowthTimelapse: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [timeLapse, setTimeLapse] = useState<string>("");

  const calculateTimelapse = () => {
    if (!startDate || !endDate) {
      setTimeLapse("Silakan masukkan tanggal mulai dan tanggal akhir.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setTimeLapse("Tanggal mulai tidak boleh setelah tanggal akhir.");
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setTimeLapse(`${diffDays} hari`);
  };

  return (
    <div className="min-h-screen bg-green-300 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-green-500 mb-6 text-center">
          Hitung Timelapse Pertumbuhan Hidroponik
        </h1>

        <div className="mb-4">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
            Tanggal Mulai
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
            Tanggal Akhir
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <button
          onClick={calculateTimelapse}
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Hitung
        </button>

        {timeLapse && (
          <div className="mt-6 bg-green-100 border border-green-500 text-green-700 p-4 rounded-lg">
            <p>{timeLapse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthTimelapse;
