import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
const execAsync = promisify(exec);
export async function convertVideo(inputFile: string) {
  if (fs.existsSync(inputFile)) {
    const parsed = path.parse(inputFile);
    const outputFile = path.join(parsed.dir, `${parsed.name}.m3u8`);
    const ffmpegPath = ffmpegInstaller.path;
    const ffprobePath = ffprobeInstaller.path;
    const commandCheck = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${inputFile}"`;
    let codec: string;
    try {
      const check = await execAsync(commandCheck);
      codec = check.stdout.trim();
    } catch (err) {
      codec = '';
    }
    let command: tring;
    if (codec == 'h264') {
      command = `${ffmpegPath} -i "${inputFile}" -c copy -bsf:v h264_mp4toannexb -start_number 0 -hls_time 60 -hls_list_size 0 -f hls "${outputFile}"`;
    } else {
      command = `${ffmpegPath} -i "${inputFile}" -profile:v baseline -level 3.0 -start_number 0 -hls_time 60 -hls_list_size 0 -f hls "${outputFile}"`;
    }
    await execAsync(command);
    return outputFile.replace('/app/', '');
  }
  return 'File not found';
}
