import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [previousExperience, setPreviousExperience] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/events/${eventId}`);
        const result = await response.json();
        
        if (result.success) {
          setEvent(result.data);
        } else {
          Alert.alert('Error', result.error || 'Failed to fetch event details');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Failed to fetch event details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!name || !skills) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
  
    setRegistering(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        Alert.alert('Error', 'User not authenticated. Please login again.');
        navigation.navigate('Login');
        return;
      }
  
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          volunteerId: userId,
          name,
          skills: skills.split(',').map(skill => skill.trim()),
          previousExperience
        })
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to register for event');
      }
  
      Alert.alert(
        'Success', 
        'Registration submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', error.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register for {event.title}</Text>
      
      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Your full name"
        value={name}
        onChangeText={setName}
      />
      
      <Text style={styles.label}>Skills * (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Communication, First Aid, Teamwork"
        value={skills}
        onChangeText={setSkills}
      />
      
      <Text style={styles.label}>Previous Volunteer Experience (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your previous volunteer experience"
        value={previousExperience}
        onChangeText={setPreviousExperience}
        multiline
        numberOfLines={4}
      />
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={registering}
      >
        {registering ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Submit Registration</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>* Required fields</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EventRegistrationScreen;