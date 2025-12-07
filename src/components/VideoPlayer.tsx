import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { apiUrl } from '../config/api';

interface VideoPlayerProps {
  onButtonEnable: () => void;
  onPlayStart?: () => void;
}

interface VideoConfig {
  id: number;
  video_url: string;
  video_type: string;
  video_path?: string;
  button_delay_seconds: number;
}

const DEFAULT_VIDEO_URL = 'https://vimeo.com/1142286537';
const DEFAULT_VIDEO_TYPE = 'vimeo';
const DEFAULT_BUTTON_DELAY = 180;

const STORAGE_KEY = 'video_progress';

function VideoPlayer({ onButtonEnable, onPlayStart }: VideoPlayerProps) {
  const [videoConfig, setVideoConfig] = useState<VideoConfig | null>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<any>(null);
  const saveProgressIntervalRef = useRef<any>(null);
  const trackingStartedRef = useRef<boolean>(false);
  const hudOverlayTimeoutRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string>('');
  const videoConfigRef = useRef<VideoConfig | null>(null);

  const getSavedProgress = (videoId: string): number => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${videoId}`);
      if (saved) {
        const data = JSON.parse(saved);
        return data.time || 0;
      }
    } catch (e) {}
    return 0;
  };

  const saveProgress = (videoId: string, time: number) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${videoId}`, JSON.stringify({ time, timestamp: Date.now() }));
    } catch (e) {}
  };

  const clearProgress = (videoId: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${videoId}`);
    } catch (e) {}
  };

  useEffect(() => {
    loadVideoConfig();
    
    return () => {
      if (hudOverlayTimeoutRef.current) {
        clearTimeout(hudOverlayTimeoutRef.current);
      }
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoConfig) {
      videoConfigRef.current = videoConfig;
      
      if (videoConfig.video_type === 'local') {
        currentVideoIdRef.current = videoConfig.video_path || videoConfig.video_url;
      } else if (videoConfig.video_type === 'google_drive') {
        const fileId = getGoogleDriveFileId(videoConfig.video_url);
        if (fileId) {
          currentVideoIdRef.current = fileId;
        }
      } else if (videoConfig.video_type === 'vimeo') {
        const videoId = getVimeoVideoId(videoConfig.video_url);
        if (videoId) {
          currentVideoIdRef.current = videoId;
        }
      } else {
        const videoId = getYouTubeVideoId(videoConfig.video_url);
        if (videoId) {
          currentVideoIdRef.current = videoId;
        }
      }
    }
  }, [videoConfig]);


  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoConfig?.video_type === 'local' && localVideoRef.current && currentVideoIdRef.current) {
        const time = localVideoRef.current.currentTime;
        if (time > 0) {
          saveProgress(currentVideoIdRef.current, time);
        }
      } else if (playerRef.current && playerRef.current.getCurrentTime && currentVideoIdRef.current) {
        const time = playerRef.current.getCurrentTime();
        if (time > 0) {
          saveProgress(currentVideoIdRef.current, time);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [videoConfig]);

  const loadVideoConfig = async () => {
    try {
      const response = await fetch(apiUrl('/api/video/current'));
      const data = await response.json();
      
      if (data.video) {
        setVideoConfig(data.video);
      } else {
        setVideoConfig({
          id: 0,
          video_url: DEFAULT_VIDEO_URL,
          video_type: DEFAULT_VIDEO_TYPE,
          button_delay_seconds: DEFAULT_BUTTON_DELAY
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de vídeo:', error);
      setVideoConfig({
        id: 0,
        video_url: DEFAULT_VIDEO_URL,
        video_type: DEFAULT_VIDEO_TYPE,
        button_delay_seconds: DEFAULT_BUTTON_DELAY
      });
    }
  };

  const handleManualPlay = () => {
    setShowPlayOverlay(false);
    
    if (onPlayStart) {
      onPlayStart();
    }
    
    if (videoConfig?.video_type === 'local') {
      setupLocalVideo();
    } else if (videoConfig?.video_type === 'google_drive') {
      setupGoogleDriveVideo();
    } else if (videoConfig?.video_type === 'vimeo') {
      startVimeoManually();
    } else {
      const videoId = getYouTubeVideoId(videoConfig?.video_url || '');
      if (videoId) {
        loadYouTubePlayer(videoId);
      }
    }
  };

  const setupLocalVideo = () => {
    if (!localVideoRef.current || !videoConfig) return;

    const video = localVideoRef.current;
    const savedTime = getSavedProgress(currentVideoIdRef.current);
    
    if (savedTime > 0) {
      video.currentTime = savedTime;
    }

    video.muted = false;
    video.play().then(() => {
      sessionStorage.setItem('video_sound_authorized', 'true');
      
      hudOverlayTimeoutRef.current = setTimeout(() => {
        setShowHudOverlay(false);
      }, 5000);
      
      trackLocalVideoProgress();
      startSavingLocalProgress();
    }).catch((err) => {
      console.error('Erro ao iniciar vídeo:', err);
    });
  };

  const setupGoogleDriveVideo = () => {
    if (!videoConfig) return;
    
    hudOverlayTimeoutRef.current = setTimeout(() => {
      setShowHudOverlay(false);
    }, 5000);
    
    trackGoogleDriveProgress();
  };

  const startVimeoManually = () => {
    const iframe = document.getElementById('vimeo-player') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage('{"method":"play"}', '*');
      iframe.contentWindow.postMessage('{"method":"setVolume","value":1}', '*');
      iframe.contentWindow.postMessage('{"method":"setMuted","value":false}', '*');
      sessionStorage.setItem('video_sound_authorized', 'true');
      
      hudOverlayTimeoutRef.current = setTimeout(() => {
        setShowHudOverlay(false);
      }, 5000);
      
      trackVimeoProgress();
    }
  };

  const trackVimeoProgress = () => {
    if (trackingStartedRef.current) return;
    trackingStartedRef.current = true;
    
    const startTime = Date.now();
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (videoConfig) {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        
        if (elapsedSeconds >= videoConfig.button_delay_seconds && !buttonEnabled) {
          setButtonEnabled(true);
          onButtonEnable();
        }
      }
    }, 300);
  };

  const trackGoogleDriveProgress = () => {
    if (trackingStartedRef.current) return;
    trackingStartedRef.current = true;
    
    const startTime = Date.now();
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (videoConfig) {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        
        if (elapsedSeconds >= videoConfig.button_delay_seconds && !buttonEnabled) {
          setButtonEnabled(true);
          onButtonEnable();
        }
      }
    }, 300);
  };

  const handleLocalVideoPlay = () => {
    sessionStorage.setItem('video_sound_authorized', 'true');
    
    hudOverlayTimeoutRef.current = setTimeout(() => {
      setShowHudOverlay(false);
    }, 5000);
    
    trackLocalVideoProgress();
    startSavingLocalProgress();
  };

  const handleLocalVideoEnded = () => {
    clearProgress(currentVideoIdRef.current);
    if (localVideoRef.current) {
      localVideoRef.current.currentTime = 0;
      localVideoRef.current.play();
    }
  };

  const handleLocalVideoPause = () => {
    if (localVideoRef.current && currentVideoIdRef.current) {
      saveProgress(currentVideoIdRef.current, localVideoRef.current.currentTime);
    }
    if (localVideoRef.current) {
      localVideoRef.current.play();
    }
  };

  const trackLocalVideoProgress = () => {
    if (trackingStartedRef.current) return;
    trackingStartedRef.current = true;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (localVideoRef.current && videoConfig) {
        const currentTime = localVideoRef.current.currentTime;
        
        if (currentTime >= videoConfig.button_delay_seconds && !buttonEnabled) {
          setButtonEnabled(true);
          onButtonEnable();
        }
      }
    }, 300);
  };

  const startSavingLocalProgress = () => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }
    
    saveProgressIntervalRef.current = setInterval(() => {
      if (localVideoRef.current && currentVideoIdRef.current) {
        const time = localVideoRef.current.currentTime;
        if (time > 0) {
          saveProgress(currentVideoIdRef.current, time);
        }
      }
    }, 3000);
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getGoogleDriveFileId = (url: string): string | null => {
    const regExp = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const getGoogleDriveEmbedUrl = (url: string): string | null => {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return null;
  };

  const getVimeoVideoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const getVimeoEmbedUrl = (url: string): string | null => {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}?muted=1&loop=1&autopause=0&controls=0&title=0&byline=0&portrait=0&playsinline=1&api=1`;
    }
    return null;
  };

  const loadYouTubePlayer = (videoId: string) => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        createYouTubePlayer(videoId);
      };
    } else {
      createYouTubePlayer(videoId);
    }
  };

  const createYouTubePlayer = (videoId: string) => {
    const savedTime = getSavedProgress(videoId);
    
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        mute: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        widget_referrer: window.location.origin,
        autohide: 1,
        color: 'white',
        loop: 1,
        playlist: videoId,
        vq: 'hd1080',
        start: Math.floor(savedTime),
      },
      events: {
        onReady: (event: any) => {
          const player = event.target;
          
          const iframe = document.querySelector('#youtube-player iframe') as HTMLIFrameElement;
          if (iframe) {
            iframe.style.pointerEvents = 'none';
          }
          
          player.playVideo();
          player.unMute();
          player.setVolume(100);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            sessionStorage.setItem('video_sound_authorized', 'true');
            
            hudOverlayTimeoutRef.current = setTimeout(() => {
              setShowHudOverlay(false);
            }, 5000);
            
            trackVideoProgress();
            startSavingProgress();
          }
          if (event.data === window.YT.PlayerState.ENDED) {
            clearProgress(currentVideoIdRef.current);
            if (playerRef.current && playerRef.current.seekTo) {
              playerRef.current.seekTo(0);
              playerRef.current.playVideo();
            }
          }
          if (event.data === window.YT.PlayerState.PAUSED) {
            if (playerRef.current && playerRef.current.getCurrentTime && currentVideoIdRef.current) {
              saveProgress(currentVideoIdRef.current, playerRef.current.getCurrentTime());
            }
            if (playerRef.current && playerRef.current.playVideo) {
              playerRef.current.playVideo();
            }
          }
        },
        onError: (event: any) => {
          console.log('YouTube Player Error:', event.data);
        }
      }
    });
  };

  const startSavingProgress = () => {
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }
    
    saveProgressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && currentVideoIdRef.current) {
        const time = playerRef.current.getCurrentTime();
        if (time > 0) {
          saveProgress(currentVideoIdRef.current, time);
        }
      }
    }, 3000);
  };

  const trackVideoProgress = () => {
    if (trackingStartedRef.current) {
      return;
    }
    trackingStartedRef.current = true;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const currentTime = playerRef.current.getCurrentTime();

        if (videoConfig && currentTime >= videoConfig.button_delay_seconds && !buttonEnabled) {
          setButtonEnabled(true);
          onButtonEnable();
        }
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }
    };
  }, []);

  if (!videoConfig) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center rounded-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div ref={videoContainerRef} className="relative">
      <div className="relative rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20">
        <div className="aspect-video bg-black relative overflow-hidden">
          <div 
            id="video-player-container" 
            className="w-full h-full relative"
          >
            {videoConfig.video_type === 'local' && videoConfig.video_path && !showPlayOverlay && (
              <video
                ref={localVideoRef}
                src={videoConfig.video_path}
                className="w-full h-full object-contain"
                playsInline
                onPlay={handleLocalVideoPlay}
                onEnded={handleLocalVideoEnded}
                onPause={handleLocalVideoPause}
              />
            )}
            
            {videoConfig.video_type === 'google_drive' && !showPlayOverlay && (
              <iframe
                id="google-drive-player"
                src={getGoogleDriveEmbedUrl(videoConfig.video_url) || ''}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ border: 'none' }}
              />
            )}
            
            {videoConfig.video_type === 'vimeo' && (
              <iframe
                id="vimeo-player"
                src={getVimeoEmbedUrl(videoConfig.video_url) || ''}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ border: 'none' }}
              />
            )}
            
            {videoConfig.video_type === 'youtube' && !showPlayOverlay && (
              <div id="youtube-player" className="w-full h-full"></div>
            )}
            
            {showPlayOverlay && (
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer z-20"
                onClick={handleManualPlay}
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-30"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-pink-500/50 hover:scale-110 transition-transform duration-300">
                    <Play className="w-12 h-12 text-white ml-2" fill="white" />
                  </div>
                </div>
                <p className="text-white text-xl md:text-2xl font-bold text-center px-4 mb-2">
                  Acessar Material - Fórmula Engajamento
                </p>
              </div>
            )}
          </div>
        </div>

        {showHudOverlay && !showPlayOverlay && (
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold text-white">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              AO VIVO
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayer;
