import axios from "axios";

const API_URL = "http://localhost:5000/api";


export const fetchPlants = async (): Promise<Plant[]> => {
  const response = await axios.get<Plant[]>(`${API_URL}/plants`);
  return Array.isArray(response.data)? response.data : [];
};

export const addPlant = async (plant: Plant): Promise<Plant> => {
  const response = await axios.post<Plant>(`${API_URL}/plants`, plant);
  return response.data;
};

export interface Plant {
  name: string;
  type: string;
  location: string;
}
