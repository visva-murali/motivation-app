// frontend/src/App.jsx
import axios from 'axios';
import { useState } from 'react';

function App() {
  const [step, setStep] = useState('setup');
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(''); // Added state for user's name
  const [whys, setWhys] = useState(['']);
  const [motivation, setMotivation] = useState('');
  const [error, setError] = useState(''); // Added state for displaying errors

  const handleSetup = async () => {
    setError(''); // Clear previous errors
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/users', {
        name: name, // Use the name from state
        whys: whys.filter(w => w.trim()).length > 0 ? whys.filter(w => w.trim()) : ['No specific whys provided'],
      });
      setUserId(response.data.id);
      setStep('generate');
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(`Failed to create profile: ${err.response?.data?.error || err.message}`);
    }
  };

  const generateMotivation = async () => {
    setError(''); // Clear previous errors
    if (!userId) {
      setError('User ID is missing. Cannot generate motivation.');
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3001/api/generate-motivation/${userId}`
      );
      setMotivation(response.data.motivation);
    } catch (err) {
      console.error("Error generating motivation:", err);
      setError(`Failed to generate motivation: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Motivation Generator</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {step === 'setup' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl mb-4">Tell us your "whys"</h2>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4" // Increased mb
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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