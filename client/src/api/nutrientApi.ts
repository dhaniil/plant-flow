const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchNutrientTopics = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/nutrient/topics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.nutrients;
  } catch (error) {
    console.error('Error fetching nutrient topics:', error);
    throw error;
  }
}; 