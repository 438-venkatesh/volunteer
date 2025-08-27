import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      let jsonValue = await AsyncStorage.getItem('organizationData');
      // Ensure we have valid data before parsing
      const data = jsonValue != null ? JSON.parse(jsonValue) : {};
      setUserData(data || {});
      setEditedData(data || {});
    } catch (error) {
      console.error('Failed to fetch user data', error);
      setUserData({});
      setEditedData({});
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('organizationData', JSON.stringify(editedData));
      setUserData(editedData);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data found. Please sign up or log in.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.imageContainer}>
            {userData.logo ? (
              <Image 
                source={{ uri: userData.logo }} 
                style={styles.logoImage} 
              />
            ) : (
              <View style={styles.logoImagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {userData.organizationName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={editedData.organizationName}
              onChangeText={(text) => handleChange('organizationName', text)}
            />
          ) : (
            <Text style={styles.nameText}>{userData.organizationName}</Text>
          )}
          <Text style={styles.emailText}>{userData.email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={editing ? handleSave : handleEdit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.editButtonText}>
                {editing ? 'Save Profile' : 'Edit Profile'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Organization Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Person:</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editedData.contactPerson}
                onChangeText={(text) => handleChange('contactPerson', text)}
              />
            ) : (
              <Text style={styles.detailValue}>{userData.contactPerson}</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editedData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.detailValue}>{userData.phone}</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editedData.address}
                onChangeText={(text) => handleChange('address', text)}
                multiline
              />
            ) : (
              <Text style={styles.detailValue}>{userData.address}</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Website:</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editedData.website}
                onChangeText={(text) => handleChange('website', text)}
                keyboardType="url"
              />
            ) : (
              <Text style={styles.detailValue}>{userData.website || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cause Area:</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editedData.causeArea}
                onChangeText={(text) => handleChange('causeArea', text)}
              />
            ) : (
              <Text style={styles.detailValue}>{userData.causeArea}</Text>
            )}
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            {editing ? (
              <TextInput
                style={[styles.editInput, styles.multilineInput]}
                value={editedData.description}
                onChangeText={(text) => handleChange('description', text)}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.detailValue}>{userData.description || 'Not provided'}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#f44336',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imageContainer: {
    marginBottom: 15,
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  logoImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  detailValue: {
    color: '#666',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ProfileScreen;