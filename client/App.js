import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import IslToAlpha from './pages/IslToAlpha';
import IslToText from './pages/IslToText';
import TextToISL from './pages/TextToISL';
import VideoCall from './pages/VideoCall';
import Account from './pages/Account';


const Stack = createStackNavigator();

const { width, height } = Dimensions.get('window'); // Get screen width

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <LottieView
        source={require('./assets/infinity-loop.json')}
        autoPlay
        loop
        style={styles.lottieBackground}
      />

      <Image
        source={require('./assets/heading.png')}
        style={{ width: width * 0.6, height: 100 }}
        contentFit="contain"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ISLtoText')}
      >
        <Icon name="albums-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>  ISL to Text</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ISLAlpha')}
      >
        <Icon name='folder-outline' size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>  ISL to Text (Alpha)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('TextToISL')}
      >
        <Icon name="body-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>  Text to ISL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('VideoCall')}
      >
        <Icon name="call-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>  Video Call</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Account')}
      >
        <Icon name="person-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>  Account</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© Made for SIH 2024 🇮🇳</Text>
      </View>

    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ISLtoText" component={IslToText} options={{ title: 'ISL to Text' }} />
        <Stack.Screen name="ISLAlpha" component={IslToAlpha} options={{ title: 'ISL to Text (Alpha)' }} />
        <Stack.Screen name="TextToISL" component={TextToISL} options={{ title: 'Text to ISL' }} />
        <Stack.Screen name="VideoCall" component={VideoCall} options={{ title: 'ISL Video Call' }} />
        <Stack.Screen name="Account" component={Account} options={{ title: 'Account Page' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dce1f4',
  },
  heading: {
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#1554ed',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lottieBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: 150,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    opacity:.4,
  },
  footerText: {
    fontSize: 14,
    color: 'black',
  },
});
