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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from "../scripts/helpers/ipAddress";
import ScreenLayout from '../screens/ScreenLayout'; 
import BottomTabBar from './BottomTabBar';
const NearbyOpportunitiesUser = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [filter, setFilter] = useState("add_volunteer");
  const [participationStatus, setParticipationStatus] = useState({});
  const [activeTab, setActiveTab] = useState('nearbody');
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setError("Token not found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${ipAdd}:5000/opportunities/nearby_opportunities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.opportunities) {
          setOpportunities(data.opportunities);
          data.opportunities.forEach((opp) =>
            fetchParticipationStatus(opp.id, token)
          );
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

  const fetchParticipationStatus = async (id, token) => {
    try {
      const response = await fetch(
        `${ipAdd}:5000/opportunity-participants/opportunities/${id}/check-participation`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setParticipationStatus((prev) => ({
        ...prev,
        [id]: data.is_participating,
      }));
    } catch (error) {
      console.error("Error checking participation:", error);
    }
  };

  const handleJoinOpportunity = async (oppId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/opportunity-participants/opportunities/${oppId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Successfully joined the opportunity');
        setParticipationStatus((prevStatus) => ({
          ...prevStatus,
          [oppId]: 'joined',
        }));
      } else {
        alert('Failed to join the opportunity');
      }
    } catch (err) {
      alert('An error occurred while joining');
    }
  };

  const handleWithdrawOpportunity = async (oppId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/opportunity-participants/opportunities/${oppId}/withdraw`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Successfully withdrew from the opportunity');
        setParticipationStatus((prevStatus) => ({
          ...prevStatus,
          [oppId]: 'not joined',
        }));
      } else {
        alert('Failed to withdraw from the opportunity');
      }
    } catch (err) {
      alert('An error occurred while withdrawing');
    }
  };
  const handleProfilePress = () => {
    navigation.navigate('nearby_opportunitiesUser');
  };
  const handleCheckParticipation = async (oppId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('Please login first');
      return;
    }
  
    try {
      const response = await fetch(`${ipAdd}:5000/opportunity-participants/opportunities/${oppId}/check-participation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.is_participating) {
          setParticipationStatus((prevStatus) => ({
            ...prevStatus,
            [oppId]: 'joined',
          }));
          alert('You are already participating in this opportunity.');
        } else {
          setParticipationStatus((prevStatus) => ({
            ...prevStatus,
            [oppId]: 'not joined',
          }));
          alert('You are not participating in this opportunity.');
        }
      } else {
        alert(data.msg || 'Failed to check participation');
      }
    } catch (err) {
      alert('An error occurred while checking participation');
    }
  };
  const handleBooking = (applicationLink) => {
    if (applicationLink) {
      Linking.openURL(applicationLink);
    } else {
      alert("No application link available for this opportunity.");
    }
  };
  
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
    <ScreenLayout onFilterSelect={handleFilterSelect} initialFilter="Nearby">
    <View style={styles.container}>
      <Text style={styles.title}>🌍 Nearby Opportunities</Text>
      {loading && <ActivityIndicator size="large" color="#2e7d32" />}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {opportunities.map((opp) => (
          <View key={opp.id} style={styles.card}>
            {opp.image_url && (
              <Image source={{ uri: opp.image_url }} style={styles.cardImage} />
            )}
            <Text style={styles.cardTitle}>🎯 {opp.title}</Text>

            <View style={styles.badgeContainer}>
              <Text style={styles.badge}>📍 {opp.location}</Text>
              <Text style={styles.badge}>🕒 {opp.opportunity_type}</Text>
              <Text style={styles.badge}>📏 {opp.distance_km} km</Text>
            </View>

            <Text style={styles.cardLabel}>📝 Description:</Text>
            <Text style={styles.cardText}>{opp.description}</Text>

            <Text style={styles.cardLabel}>📅 Start Date:</Text>
            <Text style={styles.cardText}>{opp.start_date}</Text>

            <Text style={styles.cardLabel}>📅 End Date:</Text>
            <Text style={styles.cardText}>{opp.end_date}</Text>

            <Text style={styles.cardLabel}>✉️ Contact:</Text>
            <Text style={styles.cardText}>{opp.contact_email}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleBooking(opp.application_link)}
            >
              <Text style={styles.buttonText}>🚀 Apply Now</Text>
            </TouchableOpacity>

            {/* Join/Withdraw buttons */}
                       <View style={styles.row}>
                         {participationStatus[opp.id] === "joined" ? (
                           <TouchableOpacity
                             style={styles.button}
                             onPress={() => handleWithdrawOpportunity(opp.id)}
                           >
                             <Text style={styles.buttonText}>🚫 Withdraw</Text>
                           </TouchableOpacity>
                         ) : (
                           <TouchableOpacity
                             style={styles.button}
                             onPress={() => handleJoinOpportunity(opp.id)}
                           >
                             <Text style={styles.buttonText}>✅ Join</Text>
                           </TouchableOpacity>
                         )}
                         <TouchableOpacity
                           style={styles.button}
                           onPress={() => handleCheckParticipation(opp.id)}
                         >
                           <Text style={styles.buttonText}>🔍 Check Participation</Text>
                         </TouchableOpacity>
                       </View>
 
          </View>
        ))}
      </ScrollView>
 
    </View>
    <View>
    <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
    </View>
    </ScreenLayout>
    
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,  // أقل padding يمين ويسار لتجنب القطع
    justifyContent: 'space-between',
    width: '100%',
  },
  
  
  container: {
  width: '100%',
    flex: 1,
    backgroundColor: "#f1fdf5",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderColor: "#a5d6a7",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "#c8e6c9",
    color: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  cardLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1b5e20",
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#a5d6a7",
    paddingBottom: 2,
    marginBottom: 2,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#4a873d", // الأخضر
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, // تعديل الزوايا ليصبح الشكل أكثر سلاسة
    marginTop: 12,
    alignItems: "center",
    elevation: 5, // تأثير الظل
    shadowColor: "#388e3c", // إضافة لون ظل أخضر
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: "100%", // توسيع الأزرار لتأخذ العرض بالكامل
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default NearbyOpportunitiesUser;
