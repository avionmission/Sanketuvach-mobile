import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    // Simulate a signup process (replace this with API call)
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
      // Navigate to login page after signup
      navigation.navigate('LoginPage');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        label="Name"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
      >
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('LoginPage')}
        style={styles.link}
      >
        Already have an account? Log In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  link: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default Signup;
