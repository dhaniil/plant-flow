import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import JadwalErrorBoundary from '../components/JadwalErrorBoundary';


interface Device {
    _id: string;
    device_id: string;
    name: string;
    mqtt_topic: string;
}

interface Jadwal {
    _id: string;
    devices: string[];
    name: string;
    waktu: string;
    hari: string[];
    action: "on" | "off";
    status: "active" | "inactive";
    payload: string;
}

const Jadwal = () => {
    const { isAdmin } = useAdmin();
    const [jadwal, setJadwal] = useState<Jadwal[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

    // State untuk form dengan nilai default yang aman
    const [formData, setFormData] = useState({
        devices: [] as string[],
        name: "",
        waktu: "",
        hari: [] as string[],
        action: "on" as "on" | "off",
        payload: "1"
    });

    const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    // Fetch data jadwal dan devices dengan error handling
    useEffect(() => {
        fetchJadwal();
        fetchDevices();
    }, []);

    const fetchJadwal = async () => {
        try {
            console.log('Fetching jadwal...');
            const token = localStorage.getItem('adminToken');
            const baseUrl = import.meta.env.VITE_BACKEND_URL;
            
            if (!baseUrl) {
                throw new Error('Backend URL tidak ditemukan di environment');
            }
            
            if (!token) {
                throw new Error('Token tidak ditemukan');
            }

            console.log('Attempting to fetch from:', `${baseUrl}/api/jadwal`);
            
            const response = await axios.get(`${baseUrl}/api/jadwal`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000 // Tambahkan timeout
            });

            console.log('Response received:', response.data);

            if (response.data.success) {
                setJadwal(response.data.data || []);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            let errorMessage = 'Gagal mengambil data jadwal';
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Tidak dapat terhubung ke server. Pastikan server berjalan.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Sesi telah berakhir. Silakan login kembali.';
                // Redirect ke login jika perlu
            }
            
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status
            });
            
            alert(errorMessage);
            setJadwal([]);
        }
    };

    const fetchDevices = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/devices`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDevices(response.data || []); // Pastikan selalu array
        } catch (error) {
            console.error("Error fetching devices:", error);
            setDevices([]); // Set empty array jika error
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validasi form sebelum submit
        if (!formData.name || !formData.waktu || formData.hari.length === 0 || selectedDevices.length === 0) {
            alert('Semua field harus diisi');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                ...formData,
                devices: selectedDevices.map(device => device.device_id),
                status: 'active'
            };

            let response;
            
            if (editingJadwal) {
                // Update existing jadwal
                response = await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/jadwal/${editingJadwal._id}`,
                    payload,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Create new jadwal
                response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/jadwal`,
                    payload,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            if (response.data.success) {
                setIsModalOpen(false);
                setEditingJadwal(null);
                resetForm();
                await fetchJadwal();
            } else {
                throw new Error(response.data.message || 'Gagal menyimpan jadwal');
            }
        } catch (error: any) {
            console.error('Error saving jadwal:', error.response || error);
            alert(error.response?.data?.message || 'Gagal menyimpan jadwal');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.delete(
                    `${import.meta.env.VITE_BACKEND_URL}/api/jadwal/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data.success) {
                    await fetchJadwal();
                } else {
                    throw new Error(response.data.message || 'Gagal menghapus jadwal');
                }
            } catch (error: any) {
                console.error("Error deleting jadwal:", error);
                alert(error.response?.data?.message || 'Gagal menghapus jadwal');
            }
        }
    };

    const handleEdit = (jadwal: Jadwal) => {
        if (!jadwal) return;

        try {
            setEditingJadwal(jadwal);
            
            // Pastikan jadwal.devices adalah array
            const deviceIds = Array.isArray(jadwal.devices) ? jadwal.devices : [];
            
            // Temukan device-device yang terkait dengan jadwal dengan safe check
            const selectedDevs = (devices || []).filter(device => 
                device && deviceIds.includes(device.device_id)
            );

            // Update state dengan nilai default yang aman
            setSelectedDevices(selectedDevs);
            setFormData({
                devices: deviceIds,
                name: jadwal.name || '',
                waktu: jadwal.waktu || '',
                hari: Array.isArray(jadwal.hari) ? jadwal.hari : [],
                action: jadwal.action || 'on',
                payload: jadwal.payload || '1'
            });
            
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error in handleEdit:", error);
            alert('Terjadi kesalahan saat mengedit jadwal');
        }
    };

    const resetForm = () => {
        setFormData({
            devices: [],
            name: '',
            waktu: '',
            hari: [],
            action: 'on',
            payload: '1'
        });
        setSelectedDevices([]);
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            hari: prev.hari.includes(day)
                ? prev.hari.filter(d => d !== day)
                : [...prev.hari, day]
        }));
    };

    const handleDeviceToggle = (device: Device, event?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
        if (event) {
            // Hentikan event bubbling
            event.stopPropagation();
        }

        if (!device?.device_id) {
            console.error('Device ID tidak valid:', device);
            return;
        }

        const isSelected = formData.devices.includes(device.device_id);
        
        console.log('Toggle device:', {
            device_id: device.device_id,
            isSelected,
            currentDevices: formData.devices
        });

        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                devices: prev.devices.filter(id => id !== device.device_id)
            }));
            setSelectedDevices(prev => prev.filter(d => d.device_id !== device.device_id));
        } else {
            setFormData(prev => ({
                ...prev,
                devices: [...prev.devices, device.device_id]
            }));
            setSelectedDevices(prev => [...prev, device]);
        }
    };

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            payload: prev.action === 'on' ? '1' : '0'
        }));
    }, [formData.action]);

    // Filter devices dengan safe check
    const filteredDevices = (devices || []).filter(device => 
        (device?.name?.toLowerCase() || '').includes((searchQuery || '').toLowerCase()) ||
        (device?.device_id?.toLowerCase() || '').includes((searchQuery || '').toLowerCase())
    );

    // Render jadwal dengan safe checks
    const renderJadwal = () => {
        if (!Array.isArray(jadwal)) return null;

        return jadwal.map((jadwal) => {
            if (!jadwal) return null;

            const deviceNames = (jadwal.devices || [])
                .map(deviceId => {
                    const device = (devices || []).find(d => d?.device_id === deviceId);
                    return device?.name || deviceId;
                })
                .filter(Boolean)
                .join(", ");

            return (
                <motion.div
                    key={jadwal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-green-700">{jadwal.name}</h3>
                            <p className="text-gray-600">Perangkat: {deviceNames || 'Tidak ada perangkat'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Clock size={16} className="text-green-600" />
                                <span>{jadwal.waktu}</span>
                                <Calendar size={16} className="text-green-600 ml-2" />
                                <span>{(jadwal.hari || []).join(", ")}</span>
                            </div>
                            <div className="mt-2">
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    jadwal.action === 'on' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {jadwal.action === 'on' ? 'Nyala' : 'Mati'}
                                </span>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(jadwal)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(jadwal._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            );
        }).filter(Boolean);
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-green-800 mb-6">Jadwal Perangkat</h1>

                {/* Tombol Tambah Jadwal */}
                {isAdmin && (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="fixed bottom-20 right-4 z-10 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
                    >
                        <Plus size={24} />
                    </button>
                )}

                {/* Daftar Jadwal */}
                <div className="grid gap-4">
                    {renderJadwal()}
                </div>

                {/* Modal Form */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingJadwal ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Perangkat</label>
                                    <div className="mt-1 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Cari perangkat..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        />
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedDevices.map(device => (
                                                <span 
                                                    key={device.device_id}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                >
                                                    {device.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeviceToggle(device)}
                                                        className="ml-1 text-green-600 hover:text-green-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="max-h-40 overflow-y-auto border rounded-md">
                                            {filteredDevices.map(device => (
                                                <div
                                                    key={device._id}
                                                    className={`p-2 hover:bg-gray-50 ${
                                                        formData.devices.includes(device.device_id)
                                                            ? 'bg-green-50'
                                                            : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.devices.includes(device.device_id)}
                                                            onChange={(e) => handleDeviceToggle(device, e)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mr-2 cursor-pointer"
                                                        />
                                                        <div 
                                                            className="flex-1 cursor-pointer"
                                                            onClick={(e) => handleDeviceToggle(device, e)}
                                                        >
                                                            <div className="font-medium">{device.name}</div>
                                                            <div className="text-sm text-gray-500">{device.device_id}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Jadwal</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Waktu</label>
                                    <input
                                        type="time"
                                        value={formData.waktu}
                                        onChange={(e) => setFormData({...formData, waktu: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hari</label>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleDayToggle(day)}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    formData.hari.includes(day)
                                                        ? 'bg-green-500 text-white'
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
                                        value={formData.action}
                                        onChange={(e) => setFormData({...formData, action: e.target.value as "on" | "off"})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                        required
                                    >
                                        <option value="on">Nyala</option>
                                        <option value="off">Mati</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Payload (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.payload}
                                        onChange={(e) => setFormData({...formData, payload: e.target.value})}
                                        placeholder={formData.action === 'on' ? '1' : '0'}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Default: {formData.action === 'on' ? '1' : '0'}
                                    </p>
                                </div>

                                <div className="flex gap-2 justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        {editingJadwal ? "Simpan Perubahan" : "Tambah Jadwal"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Wrap komponen dengan Error Boundary
const JadwalWithErrorBoundary = () => {
    return (
        <JadwalErrorBoundary>
            <Jadwal />
        </JadwalErrorBoundary>
    );
};

export default JadwalWithErrorBoundary;