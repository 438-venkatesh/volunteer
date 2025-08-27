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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';

const VolunteerSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    interests: [],
    skills: '',
    preferredCauses: [],
    availability: {
      startDate: new Date(),
      endDate: new Date(),
    },
    previousExperience: '',
    profileImage: null,
  });

 
  const [selectedInterest, setSelectedInterest] = useState('');
 
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const interests = [
    'Environment', 'Education', 'Health', 'Animals', 'Community',
    'Arts', 'Elderly', 'Children', 'Disability', 'Homelessness'
  ];

 
  const pickImage = async () => {
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
          profileImage: `data:image/jpeg;base64,${base64}`
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 

  const addInterest = () => {
    if (selectedInterest && !formData.interests.includes(selectedInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, selectedInterest]
      }));
      setSelectedInterest('');
    }
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

 

  

 

  const validateForm = () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter your name');
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
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (formData.interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return false;
    }
    if (!formData.skills) {
      Alert.alert('Error', 'Please enter your skills');
      return false;
    }
    return true;
  };

  // In VolunteerSignupScreen.js, update the handleSubmit function:
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
        role: 'volunteer',
        name: formData.name,
        profileImage: formData.profileImage,
        phone: formData.phone,
        interests: formData.interests,
        skills: formData.skills,
        
        previousExperience: formData.previousExperience
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

 


    // Only store if we have valid data
if (data.token) await AsyncStorage.setItem('token', data.token);
if (data.role) await AsyncStorage.setItem('userRole', data.role);

// For volunteer/organization data
const profileData = {
  _id: data.data?._id,
  ...formData
};

// Ensure we're not storing null/undefined
if (profileData) {
  await AsyncStorage.setItem('volunteerData', JSON.stringify(profileData));
}

    
   
      navigation.navigate('verify', { 
        email: formData.email,
      name: formData.name,
      role: 'volunteer'
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Volunteer Sign Up</Text>
        
        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>+ Add Profile Photo</Text>
            </View>
          )}
          {imageUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Form fields */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
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
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedInterest}
              onValueChange={setSelectedInterest}
              style={styles.picker}
            >
              <Picker.Item label="Select an interest" value="" />
              {interests.map((interest) => (
                <Picker.Item key={interest} label={interest} value={interest} />
              ))}
            </Picker>
            <TouchableOpacity style={styles.addButton} onPress={addInterest}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {formData.interests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChangeText={(text) => handleChange('skills', text)}
        />
        
        
        
        
        
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Previous Volunteer Experience (optional)"
          multiline
          numberOfLines={4}
          value={formData.previousExperience}
          onChangeText={(text) => handleChange('previousExperience', text)}
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    borderRadius: 60,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 5,
    color: '#00838f',
  },
  tagRemove: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  dateInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
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

export default VolunteerSignupScreen;