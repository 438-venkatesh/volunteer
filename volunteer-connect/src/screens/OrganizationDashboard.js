import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  refreshing,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const OrganizationDashboard = () => {
  const navigation = useNavigation();
  const { userProfile } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  const [token, setToken] = useState('');
  const [orgName, setOrgName] = useState('');
  const [rating, setRating] = useState(0);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    avgRating: 4.5
  });

  useEffect(() => {
    fetchData();
  }, []);


 


  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedOrg = await AsyncStorage.getItem('organizationData');
      setToken(storedToken);
      
      if (storedOrg) {
        const org = JSON.parse(storedOrg);
        setOrgName(org.organizationName);
        setRating(org.rating || 0);
      }
      
      fetchEvents(storedToken);
    };
    loadData();
  }, []);
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch organization's events
      const response = await fetch(`${API_URL}/events/organization/me`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.data);
        
        // Calculate stats
        const now = new Date();
        const upcoming = data.data.filter(event => new Date(event.date) > now);
        const completed = data.data.filter(event => new Date(event.date) <= now);
        
        setStats({
          totalEvents: data.data.length,
          upcomingEvents: upcoming.length,
          completedEvents: completed.length,
          avgRating: 4.5 // This would come from your rating system
        });
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('ManageEvent', { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(item.date).toLocaleDateString()} • {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <View style={styles.eventFooter}>
          <Text style={[
            styles.eventStatus,
            item.status === 'active' && styles.eventStatusActive,
            item.status === 'upcoming' && styles.eventStatusUpcoming,
            item.status === 'completed' && styles.eventStatusCompleted,
          ]}>
            {item.status}
          </Text>
          <Text style={styles.eventVolunteers}>
            {item.volunteersRegistered?.length || 0}/{item.volunteersNeeded} volunteers
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome, {orgName || userProfile?.organizationName || 'Organization'}!</Text>
          <Text style={styles.subWelcomeText}>Manage your volunteering events</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <MaterialCommunityIcons name="plus-circle" size={32} color="#4CAF50" />
            <Text style={styles.actionText}>Create Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EventList')}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={32} color="#2196F3" />
            <Text style={styles.actionText}>View All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('EventList')}
          >
            <MaterialCommunityIcons name="account-group" size={32} color="#9C27B0" />
            <Text style={styles.actionText}>Groups</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {events.length > 0 ? (
          <FlatList
            data={events.slice(0, 3)}
            renderItem={renderEventItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't created any events yet</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Text style={styles.createButtonText}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subWelcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  eventStatusActive: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  eventStatusUpcoming: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  eventStatusCompleted: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  },
  eventVolunteers: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrganizationDashboard;