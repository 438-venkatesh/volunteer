import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const UserTypeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>I am a...</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('VolunteerSignup')}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Volunteer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OrganizationSignup')}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Organization</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
    width: '45%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    marginRight: 5,
    color: '#666',
  },
  loginLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default UserTypeScreen;