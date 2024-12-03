import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import { Camera, CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import throttle from 'lodash/throttle';
import * as Speech from 'expo-speech';

export default function IslToAlpha() {
  const [hasPermission, setHasPermission] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [cache, setCache] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-In");
  const [isSpeakChecked, setSpeakChecked] = useState(false);
  const cameraRef = useRef(null);

  // Backend API base URL
  const API_BASE_URL = 'http://192.168.0.102:8000';

  // Throttled prediction function to limit API calls
  const throttledPredictSign = useCallback(
    throttle(async (image) => {
      if (isProcessing) return;

      try {
        setIsProcessing(true);

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
          `${API_BASE_URL}/predictSymbol`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );

        setCache(prediction.predicted_char)
        setPrediction(response.data);
      } catch (error) {
        console.error('Prediction error: ', error);
      } finally {
        setIsProcessing(false);
      }
    }, 2000), // Throttle to one prediction every 2 seconds
    [isProcessing]
  );

  // Continuous frame processing
  const handleCameraCapture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        // Capture photo without click sound
        const photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true, // Minimize processing to reduce overhead
          quality: 0.1, // Lowest quality to reduce file size
          shutterSound: false
        });

        // Resize image to reduce file size
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 320 } }],
          {
            format: 'jpeg',
            compress: 0.5 // Lower compression
          }
        );

        // Throttled prediction
        throttledPredictSign(manipResult);
      } catch (error) {
        console.error('Capture error:', error);
      }
    }
  };

  // Setup camera permissions and continuous capture
  useEffect(() => {
    let intervalId;

    // Request camera permissions
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Start continuous capture if permissions granted
      if (status === 'granted') {
        intervalId = setInterval(handleCameraCapture, 2000); // Capture every 2 seconds
      }
    })();

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={isSpeakChecked}
          onValueChange={setSpeakChecked}
          tintColors={{ true: '#007BFF', false: '#000' }} // Custom colors for checkbox
        />
        <Text style={styles.label}> Speak</Text>
      </View>

      <CameraView
        style={styles.camera}
        facing={'front'}
        ref={cameraRef}
        animateShutter={false}
      >
      </CameraView>

      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={selectedLanguage}
          onValueChange={(itemValue) =>
            setSelectedLanguage(itemValue)
          }>
          <Picker.Item label="English" value="en-IN" />
          <Picker.Item label="Hindi" value="hi-IN" />
          <Picker.Item label="Bengali" value="bn-IN" />
          <Picker.Item label="Gujarati" value="gu-IN" />
          <Picker.Item label="Kannada" value="kn-IN" />
          <Picker.Item label="Malayalam" value="ml-IN" />
          <Picker.Item label="Marathi" value="mr-IN" />
          <Picker.Item label="Punjabi" value="pa-IN" />
          <Picker.Item label="Tamil" value="ta-IN" />
          <Picker.Item label="Telugu" value="te-IN" />
        </Picker>
      </View>

      {/* Prediction Display */}
      <View style={styles.predictionContainer}>
        {prediction ? (
          <View>
            <Text style={styles.predictionText} 
                  onPress={(prediction.predicted_char != null && cache != prediction.predicted_char && isSpeakChecked) ? Speech.speak(`${prediction.translated_text}`) : {}}>
              Sign: {prediction.predicted_char}
            </Text>
            <Text style={styles.translationText}>
              Translation: {prediction.translated_text}
            </Text>
          </View>
        ) : (
          <Text style={styles.processingText}>
            Loading...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingTop: 25
  },
  camera: {
    width: '90%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 20,
    overflow: 'hidden',
  },
  predictionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    alignItems: 'center',
  },
  predictionText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  translationText: {
    color: 'white',
    fontSize: 20,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#007BFF', // Border color
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 15,
    width: '90%', // Full width
    height: 50, // Fixed height for the picker
    backgroundColor: '#007BFF', // Background color for the picker
    justifyContent: 'center'
  },
  picker: {
    height: 60,
    width: '100%',
    color: '#FFFFFF', // Text color inside the picker
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  }
});