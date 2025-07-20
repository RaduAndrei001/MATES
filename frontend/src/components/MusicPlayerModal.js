import React, { useEffect, useRef, useState } from 'react';
import './MusicPlayerModal.css';

/* format mm:ss */
const fmt = (s) => {
  if (!s) return '0:00';
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
};

/**
 * Props:
 *   open           – bool, afișează / ascunde
 *   onClose        – func, închide modalul
 *   onTitleSelect  – func(title) ⇒ notifică numele fișierului ales
 */

export default function MusicPlayerModal({ open, onClose, onTitleSelect }) {
  const picker   = useRef(null);
  const mediaRef = useRef(null);

  const [file, setFile] = useState(null);
  const [src,  setSrc]  = useState(null);
  const [mKey, setKey]  = useState(0);          // for remount

  const [title, setTitle] = useState('');
  const [time,  setTime]  = useState({ cur: 0, dur: 0 });
  const [vol,   setVol]   = useState(1);
  const [play,  setPlay]  = useState(false);

  /* pick file */
  const choose = () => picker.current?.click();
  const onPick = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (src) URL.revokeObjectURL(src);
    const url   = URL.createObjectURL(f);
    const fname = f.name.replace(/\.[^/.]+$/, '');

    setFile(f);
    setSrc(url);
    setTitle(fname);
    setTime({ cur: 0, dur: 0 });
    setVol(1);
    setPlay(false);
    setKey((k) => k + 1);

    onTitleSelect?.(fname);      // trimite spre părinte
  };

  /* reset la redeschidere */
  useEffect(() => {
    if (open) {
      setPlay(false);
      setTime({ cur: 0, dur: 0 });
      setKey((k) => k + 1);
    }
  }, [open]);

  /* sync cu elementul media */
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const upd = () => setTime({ cur: el.currentTime, dur: el.duration || 0 });

    el.addEventListener('timeupdate', upd);
    el.addEventListener('loadedmetadata', () => {
      upd();
      el.volume = vol;
    });
    el.addEventListener('play',  () => setPlay(true));
    el.addEventListener('pause', () => setPlay(false));
    el.addEventListener('volumechange', () => setVol(el.volume));

    return () => el.removeEventListener('timeupdate', upd);
  }, [src, vol, mKey]);

  if (!open) return null;
  const isVideo = file?.type.startsWith('video');

  return (
    <div className="mpm-backdrop" onClick={onClose}>
      <div className="mpm-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mpm-header">
          <button className="mpm-icon-btn" onClick={onClose}>❮</button>
          <div className="mpm-toggle"><button className="active">Local</button></div>
          
        </div>

        {/* Corp */}
        {!src ? (
          <div style={{ textAlign: 'center' }}>
            <button className="mpm-url-input" onClick={choose}>
              Alege fișier audio / mp4
            </button>
          </div>
        ) : isVideo ? (
          <video
            key={mKey}
            ref={mediaRef}
            src={src}
            autoPlay
            controls={false}
            style={{ width: '100%', borderRadius: 8 }}
          />
        ) : (
          <>
            <audio key={mKey} ref={mediaRef} src={src} autoPlay />
            <div
              className="mpm-album-art"
              style={{ background: 'linear-gradient(135deg,#333,#000)' }}
            />
          </>
        )}

        {/* Info & Controls */}
        {src && (
          <>
            <div className="mpm-title">{title}</div>
            <div className="mpm-artists">Local {isVideo ? 'video' : 'audio'}</div>

            {/* progress */}
            <input
              type="range"
              className="mpm-slider"
              min="0"
              max={time.dur || 0}
              value={time.cur}
              onChange={(e) => { if (mediaRef.current) mediaRef.current.currentTime = +e.target.value; }}
            />
            <div className="mpm-time-row">
              <span>{fmt(time.cur)}</span><span>{fmt(time.dur)}</span>
            </div>

            {/* volume */}
            <input
              type="range"
              className="mpm-slider"
              min="0"
              max="1"
              step="0.01"
              value={vol}
              onChange={(e) => { const v = +e.target.value; setVol(v); if (mediaRef.current) mediaRef.current.volume = v; }}
            />

            {/* transport */}
            <div className="mpm-controls">
              <button onClick={() => { if (mediaRef.current) mediaRef.current.currentTime = 0; }}>⏮</button>
              <button
                className="play"
                onClick={() => { if (!mediaRef.current) return; play ? mediaRef.current.pause() : mediaRef.current.play(); }}
              >
                {play ? '⏸' : '▶️'}
              </button>
              <button onClick={choose}>📂</button>
            </div>
          </>
        )}

        {/* file picker hidden */}
        <input
          ref={picker}
          type="file"
          accept="audio/*,video/mp4"
          style={{ display: 'none' }}
          onChange={onPick}
        />
      </div>
    </div>
  );
}
