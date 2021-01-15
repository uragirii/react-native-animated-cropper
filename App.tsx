import React, {useRef} from 'react';
import {View, StyleSheet, Text, Button} from 'react-native';
import ImageCropper, {ImageCropper as CropperType} from './ImageCropper';

const App = () => {
  const cropperRef = useRef<CropperType>(null);
  return (
    <View style={styles.container}>
      <Text>Parent Component</Text>
      <ImageCropper url="https://i.imgur.com/4Us2AYk.jpg" ref={cropperRef} />
      <Text>Parent Component</Text>
      <Button
        title="Crop"
        onPress={() =>
          cropperRef.current.getCroppedData().then((data) => {
            console.log(data);
          })
        }
      />
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
