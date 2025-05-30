// frontend/src/App.jsx
import axios from 'axios';
import { useState } from 'react';

function App() {
  const [step, setStep] = useState('setup');
  const [userId, setUserId] = useState(null);
  const [whys, setWhys] = useState(['']);
  const [motivation, setMotivation] = useState('');

  const handleSetup = async () => {
    const response = await axios.post('http://localhost:3001/api/users', {
      name: 'User',
      whys: whys.filter(w => w.trim()),
    });
    setUserId(response.data.id);
    setStep('generate');
  };

  const generateMotivation = async () => {
    const response = await axios.post(
      `http://localhost:3001/api/generate-motivation/${userId}`
    );
    setMotivation(response.data.motivation);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Motivation Generator</h1>
        
        {step === 'setup' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl mb-4">Tell us your "whys"</h2>
            {whys.map((why, index) => (
              <input
                key={index}
                type="text"
                className="w-full p-2 border rounded mb-2"
                placeholder={`Why #${index + 1}`}
                value={why}
                onChange={(e) => {
                  const newWhys = [...whys];
                  newWhys[index] = e.target.value;
                  setWhys(newWhys);
                }}
              />
            ))}
            <button
              onClick={() => setWhys([...whys, ''])}
              className="text-blue-500 mb-4"
            >
              + Add another why
            </button>
            <button
              onClick={handleSetup}
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Create Profile
            </button>
          </div>
        )}
        
        {step === 'generate' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <button
              onClick={generateMotivation}
              className="w-full bg-green-500 text-white p-3 rounded mb-4"
            >
              Generate Motivation
            </button>
            {motivation && (
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-lg">{motivation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;