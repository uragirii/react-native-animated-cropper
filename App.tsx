import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ImageCropper from './ImageCropper';

const App = () => {
  return (
    <View style={styles.container}>
      <Text>Parent Component</Text>
      <ImageCropper url="https://i.imgur.com/4Us2AYk.jpg" />
      <Text>Parent Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
