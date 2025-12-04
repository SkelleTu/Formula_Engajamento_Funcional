declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: any) => any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
