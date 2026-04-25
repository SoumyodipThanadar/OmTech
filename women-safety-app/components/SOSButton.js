import { Button, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function SOSButton() {

  const sendSOS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert("Permission denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    Alert.alert("SOS Sent!", `Location: ${latitude}, ${longitude}`);

    // You can later send this to server or SMS
  };

  return <Button title="🚨 SOS" onPress={sendSOS} />;
}