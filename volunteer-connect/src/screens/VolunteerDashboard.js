import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config/api';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const VolunteerDashboard = () => {
  const navigation = useNavigation();
  const { userProfile } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch events
      const eventsResponse = await fetch(`${API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
      });
      const eventsData = await eventsResponse.json();
      
      if (eventsResponse.ok) {
        setEvents(eventsData.data);
        
        // Calculate stats
        const now = new Date();
        const upcoming = eventsData.data.filter(event => new Date(event.date) > now);
        const completed = eventsData.data.filter(event => new Date(event.date) <= now);
        
        setStats({
          totalEvents: eventsData.data.length,
          upcomingEvents: upcoming.length,
          completedEvents: completed.length
        });
      } else {
        throw new Error(eventsData.message || 'Failed to fetch events');
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
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventOrganization}>{item.organization?.organizationName}</Text>
        <Text style={styles.eventDate}>
          {new Date(item.date).toLocaleDateString()} • {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <View style={styles.eventFooter}>
          <Text style={styles.eventCategory}>{item.category}</Text>
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
          <Text style={styles.welcomeText}>Welcome back, {userProfile?.name || 'Volunteer'}!</Text>
          <Text style={styles.subWelcomeText}>Find your next volunteering opportunity</Text>
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
            <MaterialCommunityIcons name="calendar-star" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.completedEvents}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Badges')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.badgesContainer}
        >
          <View style={styles.badge}>
            <FontAwesome name="star" size={24} color="#FFD700" />
            <Text style={styles.badgeText}>First Timer</Text>
          </View>
          <View style={styles.badge}>
            <FontAwesome name="trophy" size={24} color="#CD7F32" />
            <Text style={styles.badgeText}>5 Events</Text>
          </View>
          <View style={styles.badge}>
            <FontAwesome name="heart" size={24} color="#E91E63" />
            <Text style={styles.badgeText}>Community Hero</Text>
          </View>
        </ScrollView>

        {/* Upcoming Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
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
          <Text style={styles.emptyText}>No upcoming events found</Text>
        )}

        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.exploreButtonText}>Explore More Events</Text>
        </TouchableOpacity>
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
  badgesContainer: {
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  badgeText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#333',
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
  eventOrganization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
  eventCategory: {
    backgroundColor: '#e0f7fa',
    color: '#00838f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventVolunteers: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VolunteerDashboard;