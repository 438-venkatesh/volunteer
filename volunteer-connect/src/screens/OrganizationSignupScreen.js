import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import API_URL from '../config/api';

const OrganizationSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
   
    phone: '',
    address: '',
    website: '',
    description: '',
    
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const causeAreas = [
    'Environment', 'Education', 'Health', 'Animals', 'Community',
    'Arts', 'Elderly', 'Children', 'Disability', 'Homelessness'
  ];

  const pickLogo = async () => {
    try {
      setImageUploading(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.cancelled) {
        const base64 = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setFormData(prev => ({
          ...prev,
          logo: `data:image/jpeg;base64,${base64}`
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick logo');
    } finally {
      setImageUploading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.organizationName) {
      Alert.alert('Error', 'Please enter organization name');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (!formData.phone) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!formData.address) {
      Alert.alert('Error', 'Please enter address');
      return false;
    }
    
    return true;
  };

  // In OrganizationSignupScreen.js, update the handleSubmit function:
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: 'organization',
          organizationName: formData.organizationName,
        logo: formData.logo,
        
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        description: formData.description,
        
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

    // Store the complete organization data including the ID from the response
    cons// Only store if we have valid data
    if (data.token) await AsyncStorage.setItem('token', data.token);
    if (data.role) await AsyncStorage.setItem('userRole', data.role);
    
    // For volunteer/organization data
    const profileData = {
      _id: data.data?._id,
      ...formData
    };
    
    // Ensure we're not storing null/undefined
    if (profileData) {
      await AsyncStorage.setItem('organizationData', JSON.stringify(profileData));
    }
    

      navigation.navigate('verify', { 
        email: formData.email,
        name: formData.organizationName,
        role: 'organization'
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Organization Sign Up</Text>
        
        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickLogo}>
          {formData.logo ? (
            <Image source={{ uri: formData.logo }} style={styles.logoImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>+ Add Logo</Text>
            </View>
          )}
          {imageUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="white" />
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Organization Name"
          value={formData.organizationName}
          onChangeText={(text) => handleChange('organizationName', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
        />
        
        
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Website (optional)"
          keyboardType="url"
          value={formData.website}
          onChangeText={(text) => handleChange('website', text)}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Organization Description"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
        />
        
        
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  imageUploadContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePlaceholderText: {
    color: '#666',
    textAlign: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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

export default OrganizationSignupScreen;