import React, { useState } from 'react'

export default function App() {
  const [path, setPath] = useState('example.py')
  const [code, setCode] = useState("def hello():\n    print('Hello world')\n")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runReview() {
    setLoading(true)
    setResult(null)
    try {
      console.log('Sending code for review:', code);
      const resp = await fetch('http://localhost:8000/api/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          files: [{ 
            path, 
            content: code 
          }] 
        })
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP error! status: ${resp.status}, message: ${errorText}`);
      }
      
      const data = await resp.json();
      console.log('Review results:', data);
      setResult(data.review);
    } catch(e) {
      console.error('Error during review:', e);
      setResult({
        error: `Error: ${e.message}. Make sure the backend server is running on http://localhost:8000`
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:20, maxWidth:900, fontFamily:'system-ui, Arial'}}>
      <h1>AI Code Reviewer — React Demo</h1>
      <label>File path:<br/>
        <input value={path} onChange={e=>setPath(e.target.value)} style={{width:'100%'}} />
      </label>
      <p/>
      <label>Code:<br/>
        <textarea value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', height:240, fontFamily:'monospace'}} />
      </label>
      <p/>
      <button onClick={runReview} disabled={loading}>{loading? 'Reviewing...':'Review'}</button>
      <h2>Results</h2>
      {result && result.error && <pre style={{color:'red'}}>{result.error}</pre>}
      {result && !result.error && (
        <>
          {result.results.map((f, idx) => (
            <div key={idx} style={{border:'1px solid #ddd', padding:12, marginBottom:10, borderRadius:6}}>
              <strong>{f.path}</strong>
              <p><strong>Security</strong>: {f.security.length? <ul>{f.security.map((s,i)=><li key={i}>{s}</li>)}</ul>: <em>OK</em>}</p>
              <p><strong>Best practices</strong>: {f.best_practices.length? <ul>{f.best_practices.map((s,i)=><li key={i}>{s}</li>)}</ul>: <em>OK</em>}</p>
              <p><strong>Refactor</strong>: {f.refactor_suggestions.length? <ul>{f.refactor_suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>: <em>None</em>}</p>
            </div>
          ))}
          <div style={{border:'1px solid #444', padding:12, borderRadius:6}}>
            <strong>AI Summary</strong>
            <pre>{result.ai_summary}</pre>
          </div>
        </>
      )}
    </div>
  )
}
