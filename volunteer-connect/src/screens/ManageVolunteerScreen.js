import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const VolunteerItem = ({ volunteer, status, onUpdateStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'waitlisted': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.volunteerCard}>
      <View style={styles.volunteerHeader}>
        {volunteer.profileImage ? (
          <Image 
            source={{ uri: volunteer.profileImage }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={[styles.profileImage, styles.profilePlaceholder]}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
        <Text style={styles.volunteerName}>{volunteer.name}</Text>
      </View>
      
      <Text style={styles.statusText}>
        Status: <Text style={{ color: getStatusColor() }}>{status}</Text>
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => onUpdateStatus(volunteer._id, 'accepted')}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#F44336' }]}
          onPress={() => onUpdateStatus(volunteer._id, 'rejected')}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statusButton, { backgroundColor: '#FFC107' }]}
          onPress={() => onUpdateStatus(volunteer._id, 'waitlisted')}
        >
          <Text style={styles.buttonText}>Waitlist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ManageVolunteersScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchEventWithVolunteers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_URL}/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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

    fetchEventWithVolunteers();
  }, [eventId]);

  const handleUpdateStatus = async (volunteerId, newStatus) => {
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/events/${eventId}/volunteers/${volunteerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setEvent(prev => ({
          ...prev,
          volunteersRegistered: prev.volunteersRegistered.map(vol => 
            vol.volunteer._id === volunteerId ? { ...vol, status: newStatus } : vol
          )
        }));
      } else {
        Alert.alert('Error', result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
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
    <View style={styles.container}>
      <Text style={styles.title}>Manage Volunteers for {event.title}</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Registered: {event.volunteersRegistered.length}
        </Text>
        <Text style={styles.statsText}>
          Needed: {event.volunteersNeeded}
        </Text>
      </View>
      
      <FlatList
        data={event.volunteersRegistered}
        renderItem={({ item }) => (
          <VolunteerItem 
            volunteer={item.volunteer} 
            status={item.status}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        keyExtractor={(item) => item.volunteer._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No volunteers registered yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  listContent: {
    paddingBottom: 20,
  },
  volunteerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profilePlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ManageVolunteersScreen;