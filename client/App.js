import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import { Camera, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

export default function App() {
  
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const cameraRef = useRef(null);

  // Backend API base URL
  const API_BASE_URL = 'http://192.168.0.102:8000';

  useEffect(()=> {
    // Request camera permissions
    (async () => {
      const {status} = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status == 'granted');
    })
  })

  const takePicture = async () => {
    if(cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      
      //Resize image to reduce fill size
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 640 } }],
        { format: 'jpeg', compress: 0.7 }
      );

      setCapturedImage(manipResult);
      await predictSign(manipResult);
    }
  }

  const predictSign = async (image) => {
    try{
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
        type: 'image/jpeg',
        name: 'sign_image.jpg'
      });
      formData.append('language', 'English');

      // Send prediction request
      const response = await axios.post(
        `${API_BASE_URL}/predict`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setPrediction(response.data);
    } catch(error) {
      console.error('Prediction error: ', error);
      alert('Failed to predic sign')
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setPrediction(null);
  }


  if(hasPermission == false) {
    return <Text>No access to camera</Text>
  }


  return (
    <View style={styles.container}>
      {/* Camera View */}
      {!capturedImage ? (
        <CameraView 
          style={styles.camera}
          facing={'front'}
          ref={cameraRef}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Text style={styles.buttonText}>Capture Sign</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.resultContainer}>
          <Image 
            source={{ uri: capturedImage.uri }} 
            style={styles.capturedImage} 
          />
          
          {prediction && (
            <View style={styles.predictionBox}>
              <Text style={styles.predictionText}>
                Predicted Character: {prediction.predicted_char}
              </Text>
              <Text style={styles.translationText}>
                Translation: {prediction.translated_text}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetCapture}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
  },
  languagePicker: {
    width: '80%',
    marginBottom: 20,
  },
  camera: {
    width: '90%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  captureButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '90%',
    height: '60%',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 20,
  },
  predictionBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  translationText: {
    fontSize: 16,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
});
