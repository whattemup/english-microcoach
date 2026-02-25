import { Audio } from 'expo-av';

export const recordAudio = async (): Promise<{ stop: () => Promise<string> }> => {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();

  return {
    stop: async () => {
      await recording.stopAndUnloadAsync();
      return recording.getURI() ?? '';
    }
  };
};
