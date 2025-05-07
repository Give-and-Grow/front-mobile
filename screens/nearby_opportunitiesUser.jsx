import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from '../scripts/helpers/ipAddress';
const NearbyOpportunitiesUser = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('Token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${ipAdd}:5000/opportunities/nearby_opportunities`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.opportunities) {
          setOpportunities(data.opportunities);
        } else {
          setError(data.msg || "No nearby opportunities found.");
        }
      } catch (err) {
        setError("Failed to fetch opportunities.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Handle booking an opportunity
  const handleBooking = (applicationLink) => {
    if (applicationLink) {
      Linking.openURL(applicationLink);
    } else {
      alert("No application link available for this opportunity.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Opportunities</Text>
      {loading && <ActivityIndicator size="large" color="#2e7d32" />}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {opportunities.map((opp) => (
          <View key={opp.id} style={styles.card}>
            {opp.image_url && (
              <Image source={{ uri: opp.image_url }} style={styles.cardImage} />
            )}
            <Text style={styles.cardTitle}>{opp.title}</Text>
            <Text style={styles.cardText}>Type: {opp.opportunity_type}</Text>
            <Text style={styles.cardText}>Distance: {opp.distance_km} km</Text>
            <Text style={styles.cardText}>{opp.description}</Text>
            <Text style={styles.cardText}>Location: {opp.location}</Text>
            <Text style={styles.cardText}>Start Date: {opp.start_date}</Text>
            <Text style={styles.cardText}>End Date: {opp.end_date}</Text>
            <Text style={styles.cardText}>Contact: {opp.contact_email}</Text>

            {/* Button to book the opportunity */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleBooking(opp.application_link)}
            >
              <Text style={styles.buttonText}>Apply for this Opportunity</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7e9",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 20,
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderColor: "#a5d6a7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6, // Adds shadow for Android
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#388e3c",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#388e3c",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default NearbyOpportunitiesUser;
