import { useState, useEffect, useRef } from 'react';
import { apiUrl } from '../config/api';

interface VideoPlayerProps {
  onButtonEnable: () => void;
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

function VideoPlayer({ onButtonEnable }: VideoPlayerProps) {
  const [videoConfig, setVideoConfig] = useState<VideoConfig | null>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<any>(null);
  const saveProgressIntervalRef = useRef<any>(null);
  const trackingStartedRef = useRef<boolean>(false);
  const hudOverlayTimeoutRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string>('');
  const hasTriedAutoplayRef = useRef<boolean>(false);
  const documentClickListenerRef = useRef<any>(null);

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

  const triggerPlay = () => {
    if (videoConfig?.video_type === 'local' && localVideoRef.current) {
      localVideoRef.current.play().catch(console.error);
      localVideoRef.current.muted = false;
    } else if (playerRef.current && playerRef.current.playVideo && !isVideoStarted) {
      playerRef.current.playVideo();
      
      setTimeout(() => {
        if (playerRef.current) {
          if (playerRef.current.unMute) playerRef.current.unMute();
          if (playerRef.current.setVolume) playerRef.current.setVolume(100);
        }
      }, 100);
    }
  };

  const setupDocumentClickListener = () => {
    if (documentClickListenerRef.current) return;
    
    const handleAnyInteraction = () => {
      triggerPlay();
      
      if (documentClickListenerRef.current) {
        document.removeEventListener('click', documentClickListenerRef.current, true);
        document.removeEventListener('touchstart', documentClickListenerRef.current, true);
        document.removeEventListener('keydown', documentClickListenerRef.current, true);
        document.removeEventListener('scroll', documentClickListenerRef.current, true);
        documentClickListenerRef.current = null;
      }
    };
    
    documentClickListenerRef.current = handleAnyInteraction;
    
    document.addEventListener('click', handleAnyInteraction, true);
    document.addEventListener('touchstart', handleAnyInteraction, true);
    document.addEventListener('keydown', handleAnyInteraction, true);
    document.addEventListener('scroll', handleAnyInteraction, true);
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
      if (documentClickListenerRef.current) {
        document.removeEventListener('click', documentClickListenerRef.current, true);
        document.removeEventListener('touchstart', documentClickListenerRef.current, true);
        document.removeEventListener('keydown', documentClickListenerRef.current, true);
        document.removeEventListener('scroll', documentClickListenerRef.current, true);
      }
    };
  }, []);

  useEffect(() => {
    if (videoConfig) {
      if (videoConfig.video_type === 'local') {
        currentVideoIdRef.current = videoConfig.video_path || videoConfig.video_url;
        setupLocalVideo();
      } else if (videoConfig.video_type === 'google_drive') {
        const fileId = getGoogleDriveFileId(videoConfig.video_url);
        if (fileId) {
          currentVideoIdRef.current = fileId;
          setupGoogleDriveVideo();
        }
      } else if (videoConfig.video_type === 'vimeo') {
        const videoId = getVimeoVideoId(videoConfig.video_url);
        if (videoId) {
          currentVideoIdRef.current = videoId;
          setupVimeoVideo();
        }
      } else {
        const videoId = getYouTubeVideoId(videoConfig.video_url);
        if (videoId) {
          currentVideoIdRef.current = videoId;
          loadYouTubePlayer(videoId);
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

  const setupLocalVideo = () => {
    if (!localVideoRef.current || !videoConfig) return;

    const video = localVideoRef.current;
    const savedTime = getSavedProgress(currentVideoIdRef.current);
    
    if (savedTime > 0) {
      video.currentTime = savedTime;
    }

    video.muted = true;
    video.play().then(() => {
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.muted = false;
        }
      }, 500);
    }).catch(() => {
      setupDocumentClickListener();
    });
  };

  const [googleDriveStarted, setGoogleDriveStarted] = useState(false);
  const googleDriveClickedRef = useRef(false);

  const triggerGoogleDrivePlay = () => {
    if (googleDriveClickedRef.current) return;
    googleDriveClickedRef.current = true;

    const iframe = document.getElementById('google-drive-player') as HTMLIFrameElement;
    if (iframe) {
      iframe.focus();
      
      try {
        iframe.contentWindow?.postMessage({ action: 'play' }, '*');
      } catch (e) {}
      
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true
      });
      iframe.dispatchEvent(spaceEvent);
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      iframe.dispatchEvent(enterEvent);
      
      setTimeout(() => {
        setGoogleDriveStarted(true);
        setIsVideoStarted(true);
      }, 1000);
    }
  };

  const setupGoogleDriveVideo = () => {
    if (!videoConfig) return;
    
    hudOverlayTimeoutRef.current = setTimeout(() => {
      setShowHudOverlay(false);
    }, 5000);

    const handleFirstInteraction = () => {
      triggerGoogleDrivePlay();
      document.removeEventListener('click', handleFirstInteraction, true);
      document.removeEventListener('touchstart', handleFirstInteraction, true);
      document.removeEventListener('scroll', handleFirstInteraction, true);
      document.removeEventListener('mousemove', handleFirstInteraction, true);
      document.removeEventListener('keydown', handleFirstInteraction, true);
    };

    document.addEventListener('click', handleFirstInteraction, true);
    document.addEventListener('touchstart', handleFirstInteraction, true);
    document.addEventListener('scroll', handleFirstInteraction, true);
    document.addEventListener('mousemove', handleFirstInteraction, true);
    document.addEventListener('keydown', handleFirstInteraction, true);

    setTimeout(() => {
      triggerGoogleDrivePlay();
    }, 100);
    
    trackGoogleDriveProgress();
  };

  const setupVimeoVideo = () => {
    if (!videoConfig) return;
    
    setIsVideoStarted(true);
    
    hudOverlayTimeoutRef.current = setTimeout(() => {
      setShowHudOverlay(false);
    }, 5000);
    
    setTimeout(() => {
      const iframe = document.getElementById('vimeo-player') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"method":"setVolume","value":1}', '*');
        iframe.contentWindow.postMessage('{"method":"setMuted","value":false}', '*');
      }
    }, 500);
    
    trackVimeoProgress();
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
    setIsVideoStarted(true);
    
    if (documentClickListenerRef.current) {
      document.removeEventListener('click', documentClickListenerRef.current, true);
      document.removeEventListener('touchstart', documentClickListenerRef.current, true);
      document.removeEventListener('keydown', documentClickListenerRef.current, true);
      document.removeEventListener('scroll', documentClickListenerRef.current, true);
      documentClickListenerRef.current = null;
    }
    
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
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const getVimeoEmbedUrl = (url: string): string | null => {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&background=0&controls=0&title=0&byline=0&portrait=0`;
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
        mute: 1,
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
          
          setTimeout(() => {
            if (!hasTriedAutoplayRef.current) {
              hasTriedAutoplayRef.current = true;
              
              const state = player.getPlayerState ? player.getPlayerState() : -1;
              
              if (state !== 1) {
                setupDocumentClickListener();
              } else {
                setTimeout(() => {
                  if (player.unMute) player.unMute();
                  if (player.setVolume) player.setVolume(100);
                }, 500);
              }
            }
          }, 1000);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsVideoStarted(true);
            
            if (documentClickListenerRef.current) {
              document.removeEventListener('click', documentClickListenerRef.current, true);
              document.removeEventListener('touchstart', documentClickListenerRef.current, true);
              document.removeEventListener('keydown', documentClickListenerRef.current, true);
              document.removeEventListener('scroll', documentClickListenerRef.current, true);
              documentClickListenerRef.current = null;
            }
            
            setTimeout(() => {
              if (playerRef.current) {
                if (playerRef.current.unMute) playerRef.current.unMute();
                if (playerRef.current.setVolume) playerRef.current.setVolume(100);
              }
            }, 300);
            
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
            className="absolute inset-0 w-full h-full"
          >
            {videoConfig.video_type === 'local' ? (
              <video
                ref={localVideoRef}
                src={videoConfig.video_url}
                className="w-full h-full object-cover"
                playsInline
                loop
                onPlay={handleLocalVideoPlay}
                onEnded={handleLocalVideoEnded}
                onPause={handleLocalVideoPause}
              />
            ) : videoConfig.video_type === 'google_drive' ? (
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  id="google-drive-player"
                  src={`${getGoogleDriveEmbedUrl(videoConfig.video_url) || ''}`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  frameBorder="0"
                  style={{ 
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
              </div>
            ) : videoConfig.video_type === 'vimeo' ? (
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  id="vimeo-player"
                  src={getVimeoEmbedUrl(videoConfig.video_url) || ''}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  style={{ 
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
              </div>
            ) : (
              <div id="youtube-player" className="w-full h-full"></div>
            )}
          </div>
          
          {(videoConfig.video_type !== 'google_drive' || googleDriveStarted) && videoConfig.video_type !== 'vimeo' && (
            <div 
              className="absolute inset-0 z-30 cursor-default"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => e.preventDefault()}
              onDoubleClick={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            ></div>
          )}
          {videoConfig.video_type === 'vimeo' && (
            <div 
              className="absolute inset-0 z-30 cursor-default pointer-events-none"
            ></div>
          )}
          
          <div 
            className="absolute top-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-700"
            style={{
              width: '100%',
              height: '120px',
              background: 'linear-gradient(to bottom, rgb(2, 2, 15) 0%, rgb(2, 2, 15) 70%, rgba(2, 2, 15, 0.5) 85%, transparent 100%)',
              opacity: showHudOverlay ? 1 : 0,
            }}
          ></div>
          
          <div 
            className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-700"
            style={{
              height: '40px',
              background: 'linear-gradient(to top, rgb(2, 2, 15) 0%, rgb(2, 2, 15) 30%, rgba(2, 2, 15, 0.5) 60%, transparent 100%)',
              opacity: showHudOverlay ? 1 : 0,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
