'use client';

import { useState, useEffect } from 'react';
import { ZoomMtg } from '@zoom/meetingsdk';

// Set the Zoom JS library path
ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.2/lib', '/av');

export default function Home() {
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [botCount, setBotCount] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Preload WASM and prepare SDK only once on mount
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    // Load CSS files dynamically
    const loadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    loadCSS('https://source.zoom.us/2.18.2/css/bootstrap.css');
    loadCSS('https://source.zoom.us/2.18.2/css/react-select.css');
  }, []);

  const joinMeeting = async (meetingNumber: string, pass: string, botName: string) => {
    try {
      const response = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role: 0 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const { signature } = data;

      if (!signature) {
        throw new Error('No signature returned from API');
      }

      ZoomMtg.init({
        leaveUrl: 'http://localhost:3000',
        success: () => {
          ZoomMtg.join({
            sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY!,
            signature,
            meetingNumber,
            passWord: pass,
            userName: botName,
            success: () => setStatus(`${botName} joined successfully`),
            error: (err: any) => setStatus(`Join error for ${botName}: ${err}`),
          });
        },
        error: (err: any) => setStatus(`Init error: ${err}`),
      });
    } catch (error) {
      console.error('Join meeting error:', error);
      setStatus(`Error for ${botName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Starting bots...');
    for (let i = 1; i <= botCount; i++) {
      const botName = `Bot${i}`;
      joinMeeting(meetingId, password, botName);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Zoom Bot App</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Meeting ID:</label>
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Number of Bots:</label>
          <input
            type="number"
            min="1"
            value={botCount}
            onChange={(e) => setBotCount(parseInt(e.target.value))}
            required
          />
        </div>
        <button type="submit">Start Bots</button>
      </form>
      <p>{status}</p>
    </div>
  );
}