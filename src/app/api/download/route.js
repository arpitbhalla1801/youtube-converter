import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
  const { url, format } = await req.json();

  if (!url || !format) {
    return new Response('YouTube URL and format are required', { status: 400 });
  }

  const videoId = url.split("v=")[1]?.split("&")[0];
  if (!videoId) {
    return new Response('Invalid YouTube URL', { status: 400 });
  }

  const cookiesFilePath = '/workspaces/youtube-converter/cookies.txt';
  if (!fs.existsSync(cookiesFilePath)) {
    return new Response('Cookies file not found', { status: 400 });
  }

  const fileName = `${videoId}.${format}`;
  const outputFilePath = path.join(process.cwd(), 'public', 'output', fileName);

  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }


  const command = format === 'mp3'
  ? `yt-dlp --cookies "${cookiesFilePath}" -f bestaudio --extract-audio --audio-format mp3 "${url}" -o "${outputFilePath}"`
  : `yt-dlp --cookies "${cookiesFilePath}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --merge-output-format mp4 "${url}" -o "${outputFilePath}"`;


  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${stderr}`);
        return reject(new Response('Download failed', { status: 500 }));
      }

      console.log(`Download successful: ${stdout}`);
      const fileUrl = `/output/${fileName}`;
      return resolve(new Response(JSON.stringify({ message: 'Download successful', fileUrl }), { status: 200 }));
    });
  });
}
