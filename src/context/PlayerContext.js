import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [error, setError] = useState('');

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch((reason) => setError(reason?.message || 'Não foi possível configurar o áudio.'));
  }, []);

  async function playTrack(track, nextQueue = []) {
    if (!track?.streamUrl) {
      setError('Esta faixa não possui uma transmissão autorizada.');
      return;
    }
    try {
      const url = new URL(track.streamUrl);
      if (url.protocol !== 'https:') throw new Error('A reprodução exige uma conexão HTTPS.');
      const list = nextQueue.length ? nextQueue : [track];
      const index = Math.max(0, list.findIndex((item) => item.id === track.id));
      setQueue(list);
      setQueueIndex(index);
      setCurrentTrack(track);
      setError('');

      // A sessão de mídia e os controles da tela bloqueada mantêm o serviço ativo no Android.
      player.setActiveForLockScreen(true, {
        title: track.title,
        artist: track.artist || 'Artista desconhecido',
        albumTitle: track.album || 'NovaStream',
        ...(track.artworkUrl ? { artworkUrl: track.artworkUrl } : {}),
      }, {
        showNextTrack: index < list.length - 1,
        showPreviousTrack: index > 0,
      });

      player.replace({
        uri: url.toString(),
        name: track.title,
        artist: track.artist || 'Artista desconhecido',
      });
      player.play();
    } catch (reason) {
      setError(reason?.message || 'Não foi possível iniciar a reprodução.');
    }
  }

  async function playAt(index) {
    const track = queue[index];
    if (!track) return;
    await playTrack(track, queue);
  }

  function togglePlayback() {
    if (status.playing) player.pause();
    else if (currentTrack) player.play();
  }

  function seekTo(seconds) {
    if (Number.isFinite(seconds)) player.seekTo(Math.max(0, seconds));
  }

  function next() {
    if (queueIndex >= 0 && queueIndex < queue.length - 1) {
      playTrack(queue[queueIndex + 1], queue);
    }
  }

  function previous() {
    if (status.currentTime > 3) {
      player.seekTo(0);
      return;
    }
    if (queueIndex > 0) playTrack(queue[queueIndex - 1], queue);
  }

  const value = useMemo(() => ({
    player, status, currentTrack, queue, queueIndex, error,
    playTrack, playAt, togglePlayback, seekTo, next, previous,
    canPlay: Boolean(currentTrack?.streamUrl),
  }), [player, status, currentTrack, queue, queueIndex, error]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error('usePlayer deve ser usado dentro de PlayerProvider.');
  return value;
}
