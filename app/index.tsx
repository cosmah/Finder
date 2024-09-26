import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import { Button, Image, StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

export default function CameraApp() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState('off');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Ensure the photos directory exists
    const ensureDirExists = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'photos');
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos', { intermediates: true });
        }
      } catch (error) {
        console.error('Error ensuring photos directory exists:', error);
      }
    };
    ensureDirExists();
  }, []);

  useEffect(() => {
    // Request location permissions and get current location
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };
    getLocation();
  }, []);

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
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        const fileName = `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`;
        await FileSystem.moveAsync({
          from: photo.uri,
          to: fileName,
        });
        setPhotoUri(fileName);
        console.log('Photo taken and saved to:', fileName);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  }

  async function openPhotoDirectory() {
    try {
      const dirUri = FileSystem.documentDirectory + 'photos';
      const dirInfo = await FileSystem.getInfoAsync(dirUri);
      if (dirInfo.exists) {
        Linking.openURL(dirUri);
      } else {
        Alert.alert('Directory does not exist');
      }
    } catch (error) {
      console.error('Error opening photo directory:', error);
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
            <TouchableOpacity style={styles.thumbnailContainer} onPress={openPhotoDirectory}>
              <Image source={{ uri: photoUri }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
      <View style={styles.locationContainer}>
        {errorMsg ? <Text>{errorMsg}</Text> : <Text>Location: {location ? `${location.coords.latitude}, ${location.coords.longitude}` : 'Fetching location...'}</Text>}
      </View>
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
  locationContainer: {
    padding: 20,
    alignItems: 'center',
  },
});