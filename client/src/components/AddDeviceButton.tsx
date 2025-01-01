import React, { useState } from "react";
import axios from "axios";
import { Plus, Clock } from "lucide-react";

interface AddDeviceButtonProps {
  onAddDevice: (device: { id: string; name: string; topic: string; status: boolean }) => void;
}

const AddDeviceButton: React.FC<AddDeviceButtonProps> = ({ onAddDevice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [mqttTopic, setMqttTopic] = useState("");
  const [status, setStatus] = useState(false);
  
  // State untuk jadwal
  const [schedules, setSchedules] = useState([{
    waktu: "",
    hari: [] as string[],
    action: "on" as "on" | "off"
  }]);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const handleSubmit = async () => {
    try {
      const newDevice = {
        id: deviceId,
        name: deviceName,
        topic: mqttTopic,
        status: status
      };
      
      onAddDevice(newDevice);

      // Tambahkan jadwal jika ada
      const validSchedules = schedules.filter(schedule => 
        schedule.waktu && schedule.hari.length > 0
      );

      if (validSchedules.length > 0) {
        for (const schedule of validSchedules) {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/jadwal`, {
            devices: [deviceId],
            name: `${deviceName} - ${schedule.action === 'on' ? 'Nyala' : 'Mati'} - ${schedule.waktu}`,
            waktu: schedule.waktu,
            hari: schedule.hari,
            action: schedule.action,
            payload: schedule.action === 'on' ? '1' : '0'
          });
        }
      }
      
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving device and schedules:', error);
      alert('Gagal menyimpan perangkat dan jadwal');
    }
  };

  const resetForm = () => {
    setDeviceId("");
    setDeviceName("");
    setMqttTopic("");
    setStatus(false);
    setSchedules([{
      waktu: "",
      hari: [],
      action: "on"
    }]);
  };

  const addSchedule = () => {
    setSchedules([...schedules, {
      waktu: "",
      hari: [],
      action: "on"
    }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value
    };
    setSchedules(newSchedules);
  };

  const toggleDay = (scheduleIndex: number, day: string) => {
    const schedule = schedules[scheduleIndex];
    const newDays = schedule.hari.includes(day)
      ? schedule.hari.filter(d => d !== day)
      : [...schedule.hari, day];
    
    updateSchedule(scheduleIndex, 'hari', newDays);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-16 right-2 w-14 h-14 bg-green-500 text-white rounded-full 
          shadow-lg hover:bg-green-600 transition-all duration-300 
          flex items-center justify-center z-40
          hover:scale-110 active:scale-95
          hover:shadow-green-500/50"
      >
        <Plus size={24} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[32rem] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Tambah Perangkat Baru</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Device Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Device ID</label>
                  <input
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Masukkan Device ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Perangkat</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Masukkan Nama Perangkat"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MQTT Topic</label>
                  <input
                    type="text"
                    value={mqttTopic}
                    onChange={(e) => setMqttTopic(e.target.value)}
                    className="w-full p-2 border rounded mt-2"
                    placeholder="Masukkan MQTT Topic"
                    required
                  />
                </div>
              </div>

              {/* Schedules */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Jadwal</h3>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Plus size={20} /> Tambah Jadwal
                  </button>
                </div>

                {schedules.map((schedule, index) => (
                  <div key={index} className="p-4 border rounded-lg mb-4 bg-gray-50">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium">Jadwal #{index + 1}</h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Waktu</label>
                        <input
                          type="time"
                          value={schedule.waktu}
                          onChange={(e) => updateSchedule(index, 'waktu', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(index, day)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                                ${schedule.hari.includes(day)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Aksi</label>
                        <select
                          value={schedule.action}
                          onChange={(e) => updateSchedule(index, 'action', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="on">Nyala</option>
                          <option value="off">Mati</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDeviceButton;
