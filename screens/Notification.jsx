import React, { useEffect, useState } from "react";
import { View, FlatList, RefreshControl, StyleSheet ,ScrollView} from "react-native";
import { List, Text, Badge, Button } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from "../scripts/helpers/ipAddress";
import { Image } from "react-native";
import BottomTabBar from './BottomTabBar';
export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [token, setToken] = useState(null);
const [selectedNotification, setSelectedNotification] = useState(null);
const handleProfilePress = () => {
    navigation.navigate('Notification');
  };
   const [activeTab, setActiveTab] = useState('Notification');
const handleNotificationPress = (notification) => {
  setSelectedNotification(notification);
  if (!notification.seen) {
    markAsSeen(notification.id);
  }
};
  // جلب التوكين من AsyncStorage
  useEffect(() => {
    const loadTokenAndFetch = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          setToken(savedToken);
          await fetchNotifications(savedToken);
          await fetchUnseenCount(savedToken);
        }
      } catch (error) {
        console.error("Error loading token or fetching notifications", error);
      }
    };
    loadTokenAndFetch();
  }, []);

  const fetchNotifications = async (authToken) => {
    setLoading(true);
    try {
      const res = await axios.get(`${ipAdd}:5000/notifications/list`, {
        headers: {
          Authorization: `Bearer ${authToken || token}`,
        },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnseenCount = async (authToken) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/notifications/unseen-count`, {
        headers: {
          Authorization: `Bearer ${authToken || token}`,
        },
      });
      setUnseenCount(res.data.unseen_count);
    } catch (error) {
      console.error("Error fetching unseen count:", error);
    }
  };

  const markAsSeen = async (notificationId) => {
    try {
      await axios.post(
        `${ipAdd}:5000/notifications/mark-seen`,
        { notification_id: notificationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications();
      fetchUnseenCount();
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await axios.post(
        `${ipAdd}:5000/notifications/mark-all-seen`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications();
      fetchUnseenCount();
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  const renderItem = ({ item }) => (
  <List.Item
    title={item.title}
    description={`${item.body}\n${new Date(item.created_at).toLocaleString()}`}
    onPress={() => handleNotificationPress(item)}
    style={item.seen ? styles.seenNotification : styles.unseenNotification}
    titleStyle={item.seen ? styles.seenTitle : styles.unseenTitle}
    descriptionStyle={item.seen ? styles.seenDescription : styles.unseenDescription}
    right={() => (!item.seen ? <Badge style={styles.badge}>New</Badge> : null)}
  />
);

  return (
   
     <View style={{ flex: 1 }}>
       <ScrollView contentContainerStyle={{ ...styles.container, flexGrow: 1, paddingBottom: 100 }}>
    <View style={styles.container}>
      <Text style={styles.header}>Notifications ({unseenCount} new)</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchNotifications()} colors={[styles.refreshColor.color]} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications found</Text>}
      />
{selectedNotification && (
  <View style={styles.detailsContainer}>
    <Button mode="outlined" onPress={() => setSelectedNotification(null)} style={styles.backButton}>
      Back
    </Button>
    <Text style={styles.detailsTitle}>{selectedNotification.title}</Text>
    <Text style={styles.detailsBody}>{selectedNotification.body}</Text>
    {selectedNotification.type === "discount_code" && (
      <View style={styles.discountSection}>
{selectedNotification.type === "discount_code" && (
  <View style={styles.discountSection}>
   
    
  </View>
)}




    
      </View>
    )}
    {selectedNotification.type === "opportunity_status" && (
      <Text style={styles.detailsInfo}>
        From: {selectedNotification.from_user_name} {"\n"}
        Date: {new Date(selectedNotification.created_at).toLocaleString()}
      </Text>
    )}
  </View>
)}

      <Button mode="contained" onPress={markAllAsSeen} style={styles.button}>
        Mark All as Seen
      </Button>
    </View>
     </ScrollView>
     <BottomTabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleProfilePress={handleProfilePress}
            />
    </View>
   
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // لون خلفية أفتح ومريح للعين
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#2e7d32", // أخضر غامق
  },
  unseenNotification: {
    backgroundColor: "#c8e6c9", // أخضر فاتح متوسط
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  seenNotification: {
    backgroundColor: "#f1f8e9", // أخضر فاتح جداً
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  unseenTitle: {
    color: "#1b5e20", // أخضر داكن للعناوين غير المقروءة
    fontWeight: "700",
  },
  seenTitle: {
    color: "#4caf50", // أخضر متوسط للعناوين المقروءة
  },
  unseenDescription: {
    color: "#2e7d32", // أخضر متوسط للوصف غير المقروء
  },
  seenDescription: {
    color: "#81c784", // أخضر فاتح للوصف المقروء
  },
  badge: {
    alignSelf: "center",
    marginRight: 10,
    backgroundColor: "#43a047", // أخضر غني
    color: "white",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 18,
    color: "#4caf50",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#388e3c",
  },
  refreshColor: {
    color: "#2e7d32",
  },
  detailsContainer: {
  backgroundColor: "#ffffff",
  padding: 15,
  borderRadius: 10,
  marginTop: 10,
  elevation: 3,
},
backButton: {
  marginBottom: 10,
  borderColor: "#2e7d32",
},
detailsTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#2e7d32",
  marginBottom: 5,
},
detailsBody: {
  fontSize: 16,
  color: "#4caf50",
  marginBottom: 10,
},
detailsInfo: {
  fontSize: 14,
  color: "#388e3c",
},
discountSection: {
  alignItems: "center",
  marginTop: 10,
},
discountImage: {
  width: "100%",
  height: 200,
  borderRadius: 10,
  marginBottom: 10,
},


});
