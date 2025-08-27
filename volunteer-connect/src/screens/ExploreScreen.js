import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const EventCard = ({ event, onPress,onRegisterPress }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(event)}>
      <Image
        source={{ uri: event.image || 'https://via.placeholder.com/150' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusBadge, 
            { backgroundColor: 
              event.status === 'upcoming' ? '#4CAF50' : 
              event.status === 'active' ? '#2196F3' : 
              event.status === 'completed' ? '#9E9E9E' : '#F44336' 
            }
          ]}>
            {event.status.toUpperCase()}
          </Text>
          <Text style={styles.category}>{event.category}</Text>
        </View>
        
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(event.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{event.startTime} - {event.endTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
        
        <View style={styles.volunteersRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {event.volunteersRegistered ? event.volunteersRegistered.length : 0} / {event.volunteersNeeded} volunteers
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.volunteersRow}>
        <Ionicons name="people-outline" size={16} color="#666" />
        <Text style={styles.detailText}>
          {event.volunteersRegistered ? event.volunteersRegistered.length : 0} / {event.volunteersNeeded} volunteers
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => onRegisterPress(event)}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ExploreScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Environment',
    'Education',
    'Health',
    'Animals',
    'Community',
    'Arts',
    'Elderly',
    'Children',
    'Disability',
    'Homelessness'
  ];

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
        setFilteredEvents(result.data);
      } else {
        console.error('Failed to fetch events:', result.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedCategory, events]);

  const filterEvents = () => {
    let filtered = [...events];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    setFilteredEvents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (event) => {
    // Navigate to event details screen (not implemented in this code)
    console.log('Event pressed:', event._id);
  };
  
    
// In ExploreScreen.js where you navigate to EventRegistration
const handleRegisterPress = async (event) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRole = await AsyncStorage.getItem('userRole');
    
    if (!token || userRole !== 'volunteer') {
      Alert.alert('Login Required', 'Please login as a volunteer to register for events');
      navigation.navigate('Login');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      throw new Error('User information not found');
    }

    navigation.navigate('EventReg', { eventId: event._id });
  } catch (error) {
    console.error('Error handling registration:', error);
    Alert.alert('Error', 'Failed to initiate registration. Please try again.');
  }
};


  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.categoryButtonTextActive
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Events</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => renderCategoryButton(item)}
        keyExtractor={(item) => item}
        style={styles.categoriesList}
      />

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={handleEventPress}
            onRegisterPress={handleRegisterPress}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  // Add to styles
registerButton: {
  backgroundColor: '#4CAF50',
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 10,
},
registerButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
  createButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  categoriesList: {
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
    marginVertical: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  eventsList: {
    padding: 15,
    paddingTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  category: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  volunteersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  description: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ExploreScreen;
