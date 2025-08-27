import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, countdown,Alert ,handleResendEmail,canResend} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_URL from '../config/api';

const VerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, formData } = route.params; // Get formData from route params
  const [loading, setLoading] = useState(false);

  // After successful verification, complete the profile
  const handleVerificationSuccess = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/complete-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete profile');
      }

      // Store organization data
      await AsyncStorage.setItem('organizationData', JSON.stringify(data.profile));
      await AsyncStorage.setItem('userId', data.profile._id);

      // Navigate to dashboard
      navigation.replace('OrganizationDashboard');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        We've sent a verification email to {email}. Please check your inbox and click the verification link to activate your account.
      </Text>

      <TouchableOpacity
        style={[styles.resendButton, !canResend && styles.disabledButton]}
        onPress={handleResendEmail}
        disabled={!canResend || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.resendButtonText}>
            {canResend ? 'Resend Email' : `Resend in ${countdown}s`}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  resendButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  loginButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;