// import React, { useState } from "react";
// import { useMqtt } from "../../PubSub";

// const MQTT: React.FC = () => {
//     const topic = "hydro/sched/tes"
//     const { message, publish } = useMqtt(topic);
//     const [input, setInput] = useState("");

//     const handlePublish = () => {
//         publish(input);
//         setInput("");
//     };

//     return (
//         <div>
//             <div>
//                 <h1>Pub/Sub Demo</h1>
//                 <p>
//                 <strong>Subscribe ke topic:</strong> {topic}
//                 </p>
//                 <p>
//                     <strong>Pesan diterima:</strong>{message || "Belum ada pesan"}
//                 </p>
//             </div>
//             <div>
//                 <input type="text" value={input} onChange={(e) => setInput(e.target.value)}placeholder="Pesan" />
//                 <button onClick={handlePublish}>Kirim</button>
//             </div>
//         </div>
//     );
// };

// export default MQTT;