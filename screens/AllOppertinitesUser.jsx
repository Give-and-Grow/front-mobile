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
import ScreenLayout from '../screens/ScreenLayout'; 
import BottomTabBar from './BottomTabBar';

const AllOppertinitesUser = () => {
  const [showFilters, setShowFilters] = React.useState(false);

  const [selectedStartTime, setSelectedStartTime] = useState(""); // فارغ بالبداية
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState(""); // مثل "morning", "afternoon", "evening"
  
  const [summaries, setSummaries] = useState({});
const [summaryLoading, setSummaryLoading] = useState({});

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participationStatus, setParticipationStatus] = useState({});
  const [filter, setFilter] = useState("All");
  const locations = [
    "All",
    "Nablus",
    "Ramallah",
    "Hebron",
    "Jenin",
    "Tulkarm",
    "Qalqilya",
    "Salfit",
    "Jericho",
    "Bethlehem",
    "Gaza",
  ];
  const isTimeOverlap = (oppStart, oppEnd, filterStart, filterEnd) => {
    if (!oppStart || !oppEnd) return true; // اعتبرها مطابقة لو الوقت ناقص
  
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };
  
    const oppStartMin = toMinutes(oppStart);
    const oppEndMin = toMinutes(oppEnd);
  
    const filterStartMin = toMinutes(filterStart);
    const filterEndMin = toMinutes(filterEnd);
  
    return oppStartMin < filterEndMin && oppEndMin > filterStartMin;
  };
  
  
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchLocation = selectedLocation ? opp.location === selectedLocation : true;
    const matchType = selectedType ? opp.opportunity_type === selectedType : true;
  
    const matchDay = (selectedDay && selectedDay !== "All")
      ? (opp.volunteer_days
          ? (typeof opp.volunteer_days === "string"
              ? opp.volunteer_days.split(",").map(d => d.trim().toLowerCase()).includes(selectedDay.toLowerCase())
              : Array.isArray(opp.volunteer_days)
                ? opp.volunteer_days.map(d => d.toLowerCase()).includes(selectedDay.toLowerCase())
                : false)
          : false)
      : true;
  
    // هنا تستخدم فترة الوقت من اختيار المستخدم، مثلاً:
    // selectedStartTime و selectedEndTime: سلاسل نصية "HH:MM" من الفلتر (الواجهة)
    let matchTime = true;
  if (selectedTimeRange && selectedTimeRange !== "All") {
    let filterStart, filterEnd;
    if (selectedTimeRange === "morning") {
      filterStart = "05:00";
      filterEnd = "12:00";
    } else if (selectedTimeRange === "afternoon") {
      filterStart = "12:00";
      filterEnd = "17:00";
    } else if (selectedTimeRange === "evening") {
      filterStart = "17:00";
      filterEnd = "22:00";
    }

    matchTime = isTimeOverlap(opp.start_time, opp.end_time, filterStart, filterEnd);
  }
  
  
    return matchLocation && matchType && matchDay && matchTime;
  });
  
  
  const handleProfilePress = () => {
    navigation.navigate('AllOppertinitesUser');
  
  };
  const [activeTab, setActiveTab] = useState('oppuser');
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('Token not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${ipAdd}:5000/opportunities/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.opportunities) {
          setOpportunities(data.opportunities);
        } else {
          setError(data.msg || "No opportunities found.");
        }
      } catch (err) {
        setError("Failed to fetch opportunities.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
    
  }, []);

  const handleJoinOpportunity = async (oppId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('Please login first');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/user-participation/${oppId}/join`, {
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
      const response = await fetch(`${ipAdd}:5000/user-participation/${oppId}/withdraw`, {
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
  const resetFilters = () => {
    setSelectedLocation("All");
    setSelectedType("All");
    setSelectedDay("All");
    setSelectedTimeRange("All");
  };
  
  const fetchSummary = async (oppId) => {
    if (summaries[oppId]) {
      // التلخيص موجود، نرجعه فوراً
      return summaries[oppId];
    }
  
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      alert('Please login first');
      return;
    }
  
    setSummaryLoading((prev) => ({ ...prev, [oppId]: true }));
  
    try {
      const response = await fetch(`${ipAdd}:5000/opportunities/summary/${oppId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Summary data for oppId", oppId, data);
  
      if (response.ok && data.summary) {
        setSummaries((prev) => ({ ...prev, [oppId]: data.summary }));
        return data.summary;  // ترجع التلخيص اللي جاك من السيرفر
      } else {
        alert(data.msg || 'Failed to fetch summary');
        return null;
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      alert('An error occurred while fetching summary');
      return null;
    } finally {
      setSummaryLoading((prev) => ({ ...prev, [oppId]: false }));
    }
  };
  
  const FilterDropdown = ({ options, selected, onSelect }) => (
    <View style={styles.dropdownContainer}>
      {options.map((option) => {
        const isSelected = selected === option || (!selected && option === "All");
        return (
          <TouchableOpacity
            key={option}
            style={[styles.dropdownItem, isSelected && styles.selectedDropdownItem]}
            onPress={() => onSelect(option === "All" ? "" : option)}
          >
            <Text style={[styles.dropdownText, isSelected && styles.selectedDropdownText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
 
  
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  
  return (
   
    <ScreenLayout onFilterSelect={handleFilterSelect} initialFilter="All">
      
     
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Opportunities</Text>
      {loading && <ActivityIndicator size="large" color="#2e7d32" />}
      {error !== "" && <Text style={styles.error}>{error}</Text>}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
      <TouchableOpacity
    style={styles.toggleFilterButton}
    onPress={() => setShowFilters(!showFilters)}
  >
    <Text style={styles.toggleFilterButtonText}>
      {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
    </Text>
  </TouchableOpacity>
  {showFilters && (
      <View style={styles.filterCard}>
  <Text style={styles.filterCardTitle}>🔍 Filter Opportunities</Text>

  <FilterDropdown
  options={locations}
  selected={selectedLocation}
  onSelect={setSelectedLocation}
/>


  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>🕒 Type</Text>
    <FilterDropdown
      options={["All", "job", "volunteer"]}
      selected={selectedType}
      onSelect={setSelectedType}
    />
  </View>

  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>📆 Day</Text>
    <FilterDropdown
      options={["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}
      selected={selectedDay}
      onSelect={setSelectedDay}
    />
  </View>

  <View style={styles.filterRow}>
    <Text style={styles.filterLabel}>⏰ Time</Text>
    <FilterDropdown
      options={["All", "morning", "afternoon", "evening"]}
      selected={selectedTimeRange}
      onSelect={setSelectedTimeRange}
    />
  </View>
  <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
  <Text style={styles.resetButtonText}>↺ Reset Filters</Text>
</TouchableOpacity>

</View>
  )}

        {filteredOpportunities.map((opp) => (
          <View key={opp.id} style={styles.card}>
            {opp.image_url && (
              <Image source={{ uri: opp.image_url }} style={styles.cardImage} />
            )}
            <Text style={styles.cardTitle}>🎯 {opp.title}</Text>
  
             <Text style={styles.cardLabel}>🏢 Organization name : </Text>
             <Text style={styles.cardText}> {opp.organization_name}</Text>
             <View style={styles.separator} />
             {opp.volunteer_days && opp.volunteer_days.length > 0 && (
  <>
    <Text style={styles.cardLabel}>📆 Volunteer Days:</Text>
    <Text style={styles.cardText}>{opp.volunteer_days.join(", ")}</Text>
  </>
)}
   <View style={styles.separator} />
<Text style={styles.cardLabel}>🕓 Time:</Text>
<Text style={styles.cardText}>
  From {opp.start_time} to {opp.end_time}
</Text>
       
 
            {/* Badges */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badge}>📍 {opp.location}</Text>
              <Text style={styles.badge}>🕒 {opp.opportunity_type}</Text>
            </View>

            <Text style={styles.cardLabel}>📝 Description: </Text>
            <Text style={styles.cardText}>{opp.description}</Text>
            <View style={{ marginTop: 10 }}>
  {summaryLoading[opp.id] ? (
    <ActivityIndicator size="small" color="#388e3c" />
  ) : summaries[opp.id] ? (
    <View style={{ backgroundColor: '#e8f5e9', padding: 10, borderRadius: 10 }}>
      <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>📌 Summary:</Text>
      <Text style={{ color: '#1b5e20' }}>{summaries[opp.id].summary}</Text>

    </View>
  ) : (
    <TouchableOpacity
      style={{ backgroundColor: '#a5d6a7', padding: 10, borderRadius: 10, marginTop: 5 }}
      onPress={() => fetchSummary(opp.id)}
    >
      <Text style={{ color: '#1b5e20', fontWeight: 'bold', textAlign: 'center' }}>
        ✨ View Summary
      </Text>
    </TouchableOpacity>
  )}
</View>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>📅 Start: </Text>
            <Text style={styles.cardText}>{opp.start_date}</Text>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>📅 End: </Text>
            <Text style={styles.cardText}>{opp.end_date}</Text>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>✉️ Contact: </Text>
            <Text style={styles.cardText}>{opp.contact_email}</Text>

            <View style={styles.separator} />

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
  container: {
    flex: 1,
    backgroundColor: '#f4f9f4',
    padding: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 15,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  cardsContainer: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // android shadow
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 6,
  },
  cardLabel: {
    fontWeight: '600',
    color: '#4caf50',
    marginTop: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginTop: 4,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#a5d6a7',
    color: '#1b5e20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  filterCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterCardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#2e7d32',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#388e3c',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#c8e6c9',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedDropdownItem: {
    backgroundColor: '#2e7d32',
  },
  dropdownText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  selectedDropdownText: {
    color: 'white',
  },
  resetButton: {
    marginTop: 8,
    alignSelf: 'center',
    backgroundColor: '#a5d6a7',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  actionButton: {
    marginTop: 15,
    backgroundColor: '#43a047',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase", // جعل النص بحروف كبيرة
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  toggleFilterButton: {
    backgroundColor: "#2e7d32",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "center",
  },
  toggleFilterButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});



export default AllOppertinitesUser;
