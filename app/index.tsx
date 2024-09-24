import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

export default function CameraApp() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is not granted</Text>
        <Button onPress={requestPermission} title="Request permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      console.log(photo);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flashMode={flash}
        ref={cameraRef}
      >
        {/* Button Container for Camera Controls */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Icon name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Icon name="camera" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleFlash}>
            <Icon name={flash === 'off' ? "flash-off" : "flash"} size={32} color="white" />
          </TouchableOpacity>
          {photoUri && (
            <TouchableOpacity style={styles.thumbnailContainer} onPress={() => console.log('Open photo viewer')}>
              <Image source={{ uri: photoUri }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distributes space evenly between buttons
    alignItems: 'center',
    position: 'absolute', // Positions the buttons at the bottom
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
    flex: 1, // Allows buttons to take equal space
    justifyContent: 'center',
  },
  thumbnailContainer: {
    alignItems: 'center', // Centers the thumbnail in its column
    justifyContent: 'center',
    marginLeft: -10, // Adjusts the margin for better alignment if needed
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});
