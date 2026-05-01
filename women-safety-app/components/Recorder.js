import { Button } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

export default function Recorder() {

  let recording = null;

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();

    recording = rec;
    console.log("Recording started");
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    console.log("Recorded:", uri);

    sendToServer(uri);
  };

  const sendToServer = async (uri) => {
    let formData = new FormData();

    formData.append("file", {
      uri: uri,
      name: "audio.wav",
      type: "audio/wav"
    });

    const res = await axios.post("http://10.65.53.171/predict", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    alert("Prediction: " + res.data.result);
  };

  return (
    <>
      <Button title="Start Recording" onPress={startRecording} />
      <Button title="Stop & Analyze" onPress={stopRecording} />
    </>
  );
}