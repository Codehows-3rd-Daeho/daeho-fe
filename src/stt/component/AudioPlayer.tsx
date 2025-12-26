import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Box } from '@mui/material';
import { BASE_URL } from '../../config/httpClient';
import type { STTWithRecording } from '../page/TabSTT';

interface AudioPlayerProps {
    stts: STTWithRecording[]
    sttId: number | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ stts, sttId }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(stts.find(s => s.id === sttId)?.recordingTime || 0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime ?? stts.find(s => s.id === sttId)?.recordingTime ?? 0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (typeof time !== "number" || isNaN(time) || !isFinite(time)) return "--";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if(sttId == null) return;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <audio ref={audioRef} src={`${BASE_URL}${stts.find(s => s.id === sttId)?.file?.path}`} preload="metadata" />
      
      <IconButton onClick={togglePlay} size="small">
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      
      <Typography variant="body2" sx={{ minWidth: 40 }}>
        {formatTime(currentTime)}
      </Typography>
      
      <Slider
        size="small"
        value={currentTime}
        max={duration}
        onChange={(_, value) => {
          audioRef.current!.currentTime = value as number;
        }}
        sx={{ flex: 1, mx: 1 }}
      />
      
      <Typography variant="body2" sx={{ minWidth: 40 }}>
        {formatTime(currentTime)}
      </Typography>
    </Box>
  );
};

export default AudioPlayer;
