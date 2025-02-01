import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: true,  // Allow parsing JSON payload
  },
};

export async function POST(req) {
  const { url } = await req.json();  // Extract URL from the incoming JSON body

  // Log incoming request for debugging
  console.log('Incoming request body:', { url });

  // Check if the URL is provided
  if (!url) {
    console.log('No URL provided');
    return new Response('YouTube URL is required', { status: 400 });
  }

  // Hardcoded path to the cookies file
  const cookiesFilePath = '/workspaces/youtube-converter/cookies.txt';  // Replace with your actual cookies file path
  console.log('Cookies file path:', cookiesFilePath);

  if (!cookiesFilePath) {
    return new Response('Cookies file path is not set', { status: 400 });
  }

  // Extract the video ID from the URL (basic approach, consider using a regex for more complex cases)
  const videoId = url.split('v=')[1]?.split('&')[0];
  if (!videoId) {
    return new Response('Invalid URL, could not extract video ID', { status: 400 });
  }

  // Set the file name to the video ID (e.g., "abc123.mp3")
  const fileName = `${videoId}.mp3`;  // Using .mp3 extension as default, you can change this if needed
  const outputFilePath = path.join(process.cwd(), 'public', 'output', fileName); // Save in public/output/

  // Ensure the folder exists
  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Execute yt-dlp command with the hardcoded cookies file path
  return new Promise((resolve, reject) => {
    exec(`yt-dlp --cookies ${cookiesFilePath} -f bestaudio ${url} -o ${outputFilePath}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${stderr}`);
        return reject(new Response('Download failed', { status: 500 }));
      }

      console.log(`stdout: ${stdout}`);

      // Return the URL for the frontend to download the file
      const fileUrl = `/output/${fileName}`;  // URL to access the file
      return resolve(new Response(JSON.stringify({ message: 'Download successful', fileUrl }), { status: 200 }));
    });
  });
}
