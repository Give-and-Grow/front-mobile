// InviteUsersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation, useRoute } from "@react-navigation/native";
import ipAdd from '../scripts/helpers/ipAddress';

const API_URL = `${ipAdd}:5000`; // replace with actual IP for physical device

const InviteUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [invitedIds, setInvitedIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const opportunityId = route.params?.opportunityId;

  const fetchUsers = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!opportunityId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/invite/opportunity/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedUsers = response.data.invited_users || [];
      setUsers(fetchedUsers);
      setSelectedUserIds(fetchedUsers.map((u) => u.id));
    } catch (err) {
      setMessage("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendInvites = async () => {
    if (selectedUserIds.length === 0) {
      Alert.alert("Validation", "Please select at least one user.");
      return;
    }
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_URL}/invite/opportunity/${opportunityId}`,
        { user_ids: selectedUserIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.msg || "Invitations sent successfully.");
      setInvitedIds((prev) => [...prev, ...selectedUserIds]);
      setSelectedUserIds([]);
     setTimeout(() => navigation.navigate("homepage"), 1000);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.msg || "Error sending invitations.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [opportunityId]);

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
        <View>
          <Text style={styles.name}><Icon name="user" /> {item.first_name} {item.last_name}</Text>
          <Text style={styles.meta}><Icon name="city" /> {item.city}</Text>
          <Text style={styles.meta}><Icon name="globe" /> {item.country}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => toggleUser(item.id)}
        disabled={invitedIds.includes(item.id)}
        style={[styles.checkbox, invitedIds.includes(item.id) && styles.disabledCheckbox]}
      >
        <Icon
          name={selectedUserIds.includes(item.id) ? "check-square" : "square"}
          size={24}
          color={invitedIds.includes(item.id) ? "gray" : "#43a047"}
        />
      </TouchableOpacity>
    </View>
  );

  if (!opportunityId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Please select an opportunity first.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backLink}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}><Icon name="envelope-open-text" /> Invite Users</Text>

      <TextInput
        style={styles.searchBox}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {message !== "" && <Text style={styles.message}>{message}</Text>}

      {loading ? (
        <ActivityIndicator color="#43a047" size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={[styles.inviteButton, selectedUserIds.length === 0 && styles.disabledButton]}
        onPress={sendInvites}
        disabled={selectedUserIds.length === 0}
      >
        <Icon name="user-plus" color="#fff" size={16} />
        <Text style={styles.buttonText}> Invite Users</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InviteUsersScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4", // خلفية خضراء فاتحة مريحة
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 20,
    textAlign: "center",
  },
  searchBox: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0", // إطار أخضر فاتح
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#c8e6c9",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2e7d32",
  },
  meta: {
    fontSize: 14,
    color: "#66bb6a",
  },
  checkbox: {
    padding: 10,
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43a047",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#cfd8dc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  message: {
    color: "#1b5e20",
    backgroundColor: "#d9fdd3",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backLink: {
    marginTop: 14,
    color: "#388e3c",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
