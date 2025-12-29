// Notification sound player utility

// Sound URLs - you can replace these with your actual sound files
const SOUND_URLS = {
  default: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  newOrder: '/sounds/new-order.mp3',
  orderComplete: '/sounds/order-complete.mp3',
  earning: '/sounds/coin.mp3',
  message: '/sounds/message.mp3'
};

// Cache for audio objects
const audioCache = {};

// Preload sounds
export const preloadSounds = () => {
  Object.entries(SOUND_URLS).forEach(([key, url]) => {
    if (!audioCache[key]) {
      audioCache[key] = new Audio(url);
      audioCache[key].preload = 'auto';
    }
  });
};

// Play notification sound
export const playNotificationSound = (type = 'default', volume = 0.5) => {
  try {
    // Get sound type based on notification type
    let soundType = 'default';
    
    if (type.includes('order_placed') || type.includes('new_order_assignment')) {
      soundType = 'newOrder';
    } else if (type.includes('delivered') || type.includes('completed')) {
      soundType = 'orderComplete';
    } else if (type.includes('earning') || type.includes('bonus')) {
      soundType = 'earning';
    } else if (type.includes('success') || type.includes('confirmed')) {
      soundType = 'success';
    } else if (type.includes('failed') || type.includes('cancelled') || type.includes('error')) {
      soundType = 'error';
    } else if (type.includes('warning') || type.includes('alert')) {
      soundType = 'warning';
    }

    // Get or create audio object
    let audio = audioCache[soundType];
    
    if (!audio) {
      const url = SOUND_URLS[soundType] || SOUND_URLS.default;
      audio = new Audio(url);
      audioCache[soundType] = audio;
    }

    // Reset and play
    audio.currentTime = 0;
    audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp between 0 and 1
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Sound play failed:', error);
        // Sound play was prevented (usually due to user interaction requirement)
      });
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Play custom sound
export const playCustomSound = (url, volume = 0.5) => {
  try {
    const audio = new Audio(url);
    audio.volume = Math.min(Math.max(volume, 0), 1);
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Custom sound play failed:', error);
      });
    }
  } catch (error) {
    console.error('Error playing custom sound:', error);
  }
};

// Stop all sounds
export const stopAllSounds = () => {
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
};

// Enable/disable sounds
let soundsEnabled = true;

export const enableSounds = () => {
  soundsEnabled = true;
  localStorage.setItem('notificationSoundsEnabled', 'true');
};

export const disableSounds = () => {
  soundsEnabled = false;
  localStorage.setItem('notificationSoundsEnabled', 'false');
  stopAllSounds();
};

export const areSoundsEnabled = () => {
  if (soundsEnabled !== undefined) return soundsEnabled;
  
  const stored = localStorage.getItem('notificationSoundsEnabled');
  soundsEnabled = stored !== 'false'; // Default to true
  return soundsEnabled;
};

// Play sound only if enabled
export const playSound = (type = 'default', volume = 0.5) => {
  if (areSoundsEnabled()) {
    playNotificationSound(type, volume);
  }
};

// Volume control
export const setVolume = (volume) => {
  const clampedVolume = Math.min(Math.max(volume, 0), 1);
  localStorage.setItem('notificationVolume', clampedVolume.toString());
  
  // Update volume for all cached audio
  Object.values(audioCache).forEach(audio => {
    audio.volume = clampedVolume;
  });
};

export const getVolume = () => {
  const stored = localStorage.getItem('notificationVolume');
  return stored ? parseFloat(stored) : 0.5;
};

// Initialize sounds on load
if (typeof window !== 'undefined') {
  // Check if sounds are enabled from localStorage
  areSoundsEnabled();
  
  // Preload sounds after user interaction
  let preloaded = false;
  const preloadOnInteraction = () => {
    if (!preloaded) {
      preloadSounds();
      preloaded = true;
      
      // Remove event listeners after preloading
      document.removeEventListener('click', preloadOnInteraction);
      document.removeEventListener('keydown', preloadOnInteraction);
    }
  };
  
  document.addEventListener('click', preloadOnInteraction, { once: true });
  document.addEventListener('keydown', preloadOnInteraction, { once: true });
}

export default {
  playNotificationSound,
  playCustomSound,
  playSound,
  stopAllSounds,
  preloadSounds,
  enableSounds,
  disableSounds,
  areSoundsEnabled,
  setVolume,
  getVolume
};