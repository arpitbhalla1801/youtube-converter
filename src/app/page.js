'use client';

import { useState } from 'react';

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setDownloadUrl(data.fileUrl);  // Set the file URL from the backend response
      } else {
        alert(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>YouTube Video Downloader</h1>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleDownload} disabled={loading}>
        {loading ? 'Downloading...' : 'Download'}
      </button>

      {downloadUrl && (
        <div>
          <a href={downloadUrl} download>
            Click here to download the video
          </a>
        </div>
      )}
    </div>
  );
}
