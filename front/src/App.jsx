import { useState } from 'react'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [rate,setRate] =useState(0);
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'supercrabtree', 
          repo: 'k'
        })
      });
      const result = await response.json();
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Error fetching data");
    }
    setLoading(false);
  }
  const handleRateLimit = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/rate-limit');
    const data = await res.json(); 

    setRate(data.remaining); 
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div style={{ padding: 20 }}>
      <h1>PR Visualizer</h1>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Test Backend Connection'}
      </button>
      {data && (
        <pre style={{ textAlign: 'left', marginTop: 20, background: '#f0f0f0', padding: 10 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App