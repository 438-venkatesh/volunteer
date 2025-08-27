import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

const CompleteProfileScreen = ({ route, navigation }) => {
  const { role, initialData } = route.params;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    organizationName: '',
    contactPerson: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    causeArea: '',
    logo: null
  });

  const handleCompleteProfile = async () => {
    if (!formData.organizationName || !formData.contactPerson ||
        !formData.phone || !formData.address ||
        !formData.description || !formData.causeArea) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete profile');
      }

      await AsyncStorage.setItem('organizationData', JSON.stringify(data.profile));
      await AsyncStorage.setItem('userId', data.profile._id);

      navigation.replace('OrganizationDashboard');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your {role} Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Organization Name"
        value={formData.organizationName}
        onChangeText={(text) => setFormData({ ...formData, organizationName: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Contact Person"
        value={formData.contactPerson}
        onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Website (optional)"
        value={formData.website}
        onChangeText={(text) => setFormData({ ...formData, website: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Organization Description"
        multiline
        numberOfLines={4}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Cause Area"
        value={formData.causeArea}
        onChangeText={(text) => setFormData({ ...formData, causeArea: text })}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCompleteProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Complete Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompleteProfileScreen;
