import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import API_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Environment');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [volunteersNeeded, setVolunteersNeeded] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
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

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCreateEvent = async () => {
    if (!title || !description || !startTime || !endTime || !location || 
        !address || !category || !skillsRequired || !volunteersNeeded) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title,
        description,
        date,
        startTime,
        endTime,
        location,
        address,
        category,
        skillsRequired: skillsRequired.split(',').map(skill => skill.trim()),
        volunteersNeeded: parseInt(volunteersNeeded),
        image: image || 'https://via.placeholder.com/150'
      };

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Success', 
          'Event created successfully!',
          [{ text: 'OK', onPress: () => navigation.navigate('Explore') }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create New Event</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Event description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Text style={styles.label}>Date *</Text>
      <TouchableOpacity 
        style={styles.datePickerButton} 
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{formatDate(date)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Start Time *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 9:00 AM"
        value={startTime}
        onChangeText={setStartTime}
      />

      <Text style={styles.label}>End Time *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 12:00 PM"
        value={endTime}
        onChangeText={setEndTime}
      />

      <Text style={styles.label}>Location *</Text>
      <TextInput
        style={styles.input}
        placeholder="Event location"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="Full address"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Skills Required * (comma separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Communication, Teamwork, First Aid"
        value={skillsRequired}
        onChangeText={setSkillsRequired}
      />

      <Text style={styles.label}>Volunteers Needed *</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of volunteers"
        value={volunteersNeeded}
        onChangeText={setVolunteersNeeded}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Image URL (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={image}
        onChangeText={setImage}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleCreateEvent}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Event</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEventScreen;
