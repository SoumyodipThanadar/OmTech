import { View, Text, StyleSheet } from 'react-native';
import SOSButton from '../components/SOSButton';
import Recorder from '../components/Recorder';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Women Safety App</Text>

      <SOSButton />
      <Recorder />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  }
});