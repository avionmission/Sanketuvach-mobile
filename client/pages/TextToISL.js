import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
const TextToISL = () => {
  return (
    <View style={styles.container}>
      <WebView
      style={{flex: 1,marginTop: 0}}
      source={{ uri: 'http://192.168.1.4:5000' }}
      scrollEnabled={false}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default TextToISL;
