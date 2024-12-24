import  { useEffect, useState } from "react";
import { fetchPlants, addPlant, Plant } from "../RESTAPI";


// interface Plant is now imported from RESTAPI

function Mongo() {
  const [plants, setPlants] = useState<Plant[]>([]);

  const [newPlant, setNewPlant] = useState<Plant>({
    name: "",
    location: "",
    type: "",
  });

useEffect(() => {
  const getPlants = async () => {
    const data: Plant[] = await fetchPlants();
    setPlants(data);
  };
  getPlants();
}, []);


const handleAddPlant = async () => {
  await addPlant(newPlant);
  const updatedPlants = await fetchPlants();
  setPlants(updatedPlants);
};

return (
  <div>
    <h1>PlantFlow</h1>
    <ul>
      {plants.map((plant, index) => (
        <li key={index}>
          {plant.name} ({plant.type}) - {plant.location}
        </li>
      ))}
    </ul>
    <div>
      <input
        placeholder="Name"
        value={newPlant.name}
        onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
      />
      <input
        placeholder="Type"
        value={newPlant.type}
        onChange={(e) => setNewPlant({ ...newPlant, type: e.target.value })}
      />
      <input
        placeholder="Location"
        value={newPlant.location}
        onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
      />
      <button onClick={handleAddPlant}>Add Plant</button>
    </div>
  </div>
);
}

export default Mongo;