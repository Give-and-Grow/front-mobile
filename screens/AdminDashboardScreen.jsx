import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ipAdd from "../scripts/helpers/ipAddress";
import LayoutWithFiltersAdmin from './LayoutWithFiltersAdmin';
import BottomTabBar from './BottomTabBar';
// مكون مخصص للموديل لإعادة استخدامه
const CustomModal = ({ visible, title, children, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
          <TouchableOpacity style={[styles.cardButton, { marginTop: 10 }]} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminDashboardScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('dashbord');
      
    const handleProfilePress = () => {
      navigation.navigate('AdminDashboardScreen');
    };
  const [token, setToken] = useState("");
  const [filter, setFilter] = useState("dashboard");
  const [userInfo, setUserInfo] = useState({});
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    name: "",
    role_level: "admin",
  });
  const [resetEmail, setResetEmail] = useState(""); // لحفظ البريد الإلكتروني في حالة إعادة تعيين كلمة المرور
  const [resetCode, setResetCode] = useState(""); // لحفظ الكود المدخل
  const [newPassword, setNewPassword] = useState(""); // لحفظ كلمة المرور الجديدة
  const [year, setYear] = useState("");
  const [users, setUsers] = useState([]);
 
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(""); // Variable for verification code
  
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  useEffect(() => {
    initializeToken();
  }, []);

  const initializeToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("userToken");
      if (savedToken) {
        setToken(savedToken);
        fetchStatus(savedToken);
      } else {
        Alert.alert("Error", "No token found, please log in again.");
        navigation.navigate("LoginScreen");
      }
    } catch (err) {
      console.error("Error retrieving token", err);
    }
  };

  const getToken = async () => {
    try {
      return (await AsyncStorage.getItem("userToken")) || null;
    } catch (e) {
      console.error("Failed to retrieve token", e);
      return null;
    }
  };

  const fetchStatus = async (token) => {
    try {
      const res = await fetch(`${ipAdd}:5000/auth/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user info");
      const data = await res.json();
      setUserInfo(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch user info.");
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      Alert.alert("Error", "Email, password, and name are required.");
      return;
    }
    try {
      const t = await getToken();
      if (!t) {
        Alert.alert("Error", "No token found");
        return;
      }
      const res = await fetch(`${ipAdd}:5000/auth/admin/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      Alert.alert("Result", data.msg || "New Admin Created. Please check email for verification.");
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to create admin.");
    }
  };

  const handleGetUsers = async () => {
    try {
      const t = await getToken();
      if (!t) {
        Alert.alert("Error", "No token found");
        return;
      }
      const res = await fetch(`${ipAdd}:5000/auth/users/${year}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to fetch users.");
    }
  };

  const handleResetPasswordRequest = async () => {
    try {
      const t = await getToken();
      if (!t) {
        Alert.alert("Error", "No token found");
        return;
      }
      const res = await fetch(`${ipAdd}:5000/auth/reset-password-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      Alert.alert("Password Reset", data.message || "Password reset request sent");
      setCurrentAction("enterCode"); // بعد ارسال الرمز نعرض الجزء الثاني من الفورم
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to reset password.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const t = await getToken();
      if (!t) {
        Alert.alert("Error", "No token found");
        return;
      }
      const res = await fetch(`${ipAdd}:5000/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({
          code: resetCode,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      Alert.alert("Password Reset", data.message || "Password successfully reset");
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to reset password.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const t = await getToken();
      if (!t) {
        Alert.alert("Error", "No token found");
        return;
      }
      const res = await fetch(`${ipAdd}:5000/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ email: verifyEmail, code: verificationCode }), // Including verification code
      });
      const data = await res.json();
      Alert.alert("Email Verification", data.message || "Email verified");
      setModalVisible(false);
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to verify email.");
    }
  };

  const openModal = (action) => {
    setCurrentAction(action);
    setModalVisible(true);
  };

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("userToken");
          navigation.navigate("LoginScreen");
        },
      },
    ]);
  };
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
    <LayoutWithFiltersAdmin onFilterSelect={handleFilterSelect} initialFilter="dashboard">
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Admin</Text>
          <TouchableOpacity style={styles.cardButton} onPress={() => openModal("createAdmin")}>
            <Text style={styles.buttonText}>Create Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Year"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.cardButton} onPress={handleGetUsers}>
            <Text style={styles.buttonText}>Get Users </Text>
          </TouchableOpacity>
          <View style={styles.usersList}>
            {users.length > 0 ? (
              users.map((user, index) => <Text key={index}>{user.username}</Text>)
            ) : (
              <Text>No users found for this year.</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reset Password</Text>
          <TouchableOpacity style={styles.cardButton} onPress={() => openModal("resetPassword")}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify Email</Text>
          <TouchableOpacity style={styles.cardButton} onPress={() => openModal("verifyEmail")}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomModal
  visible={modalVisible}
  title={currentAction === "createAdmin" ? "Create New Admin" :
         currentAction === "resetPassword" ? "Reset Password" : 
         currentAction === "verifyEmail" ? "Verify Email" : ""}
  onClose={() => setModalVisible(false)}
>
  {currentAction === "createAdmin" && (
    <>
      <TextInput
        style={styles.input}
        placeholder="Admin Name"
        value={newAdmin.name}
        onChangeText={(text) => setNewAdmin({ ...newAdmin, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        value={newAdmin.email}
        onChangeText={(text) => setNewAdmin({ ...newAdmin, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Admin Password"
        value={newAdmin.password}
        onChangeText={(text) => setNewAdmin({ ...newAdmin, password: text })}
        secureTextEntry
      />
      <TouchableOpacity style={styles.cardButton} onPress={handleCreateAdmin}>
        <Text style={styles.buttonText}>Create Admin</Text>
      </TouchableOpacity>
    </>
  )}

  {currentAction === "resetPassword" && (
    <>
      {currentAction === "resetPassword" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={resetEmail}
            onChangeText={setResetEmail}
          />
          <TouchableOpacity style={styles.cardButton} onPress={handleResetPasswordRequest}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter reset code"
        value={resetCode}
        onChangeText={setResetCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity style={styles.cardButton} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </>
  )}

  {currentAction === "verifyEmail" && (
    <>
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={verifyEmail}
        onChangeText={setVerifyEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />
      <TouchableOpacity style={styles.cardButton} onPress={handleVerifyEmail}>
        <Text style={styles.buttonText}>Verify Email</Text>
      </TouchableOpacity>
    </>
  )}
</CustomModal>

    </ScrollView>
    <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
    </LayoutWithFiltersAdmin>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f1f8f1", // خلفية فاتحة بدرجة خضراء
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      backgroundColor: "#4caf50", // خلفية رأسية بدرجة أخضر مميزة
      padding: 10,
      borderRadius: 8,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff", // النص باللون الأبيض
    },
    logoutText: {
      color: "#d32f2f", // اللون الأحمر للـ Logout
      fontWeight: "bold",
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    card: {
      flex: 1,
      marginRight: 10,
      marginLeft: 10,
      backgroundColor: "#e8f5e9", // خلفية كرت باللون الأخضر الفاتح
      padding: 20,
      borderRadius: 8,
      shadowColor: "#388e3c", // ظل بدرجة أخضر داكنة
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    cardTitle: {
      fontSize: 18,
      marginBottom: 10,
      color: "#388e3c", // عنوان الكرت بلون أخضر داكن
    },
    cardButton: {
      backgroundColor: "#388e3c", // زر بلون أخضر داكن
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
    },
    buttonText: { color: "white", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, width: "100%" },
    usersList: {
      marginTop: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 8,
      width: "80%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#388e3c", // عنوان المودال باللون الأخضر الداكن
    },
    header: {
      marginBottom: 20,
      alignItems: "center",
      backgroundColor: "#388e3c", // نفس اللون في رأس الصفحة
      padding: 15,
      borderRadius: 8,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff", // النص باللون الأبيض في الرأس
    },
  });
  
