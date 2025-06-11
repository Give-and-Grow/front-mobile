import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ipAdd from "../scripts/helpers/ipAddress";

const roles = ["", "admin", "user", "organization"];

const iconMap = {
  total_accounts: <MaterialIcons name="people" size={32} color="#22c55e" />,
  active_accounts: <MaterialIcons name="check-circle" size={32} color="#16a34a" />,
  inactive_accounts: <MaterialIcons name="person-outline" size={32} color="#4ade80" />,
  admin_accounts: <MaterialIcons name="assignment-ind" size={32} color="#15803d" />,
  new_accounts: <MaterialIcons name="trending-up" size={32} color="#22c55e" />,
};

export default function AccountsDashboard() {
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function loadToken() {
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          setToken(savedToken);
        } else {
          showToast("No token found, please login", "error");
        }
      } catch (error) {
        showToast("Failed to load token", "error");
      }
    }
    loadToken();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

 const fetchAccounts = async () => {
  if (!token) return;
  setLoading(true);
  try {
    let queryParams = `search=${search}&page=${page}`;
    if (role) queryParams += `&role=${role}`;
    if (isActive) queryParams += `&is_active=${isActive}`;

    const url = `${ipAdd}:5000/admin/accounts/?${queryParams}`;
    console.log("Fetching URL:", url);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAccounts(data.accounts);
    setPages(data.pages);
  } catch (error) {
    showToast("Failed to fetch accounts", "error");
  } finally {
    setLoading(false);
  }
};

  const verifyOrganization = async (orgId) => {
    if (!token) return;
    try {
      await fetch(`${ipAdd}:5000/admin/organizations/proof/${orgId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });
      showToast("Organization verification updated");
      fetchAccounts();
    } catch (error) {
      showToast("Failed to verify organization", "error");
    }
  };

  const verifyUser = async (userId) => {
    if (!token) return;
    try {
      await fetch(`${ipAdd}:5000/admin/users/identity/${userId}/verification`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });
      showToast("User verification updated");
      fetchAccounts();
    } catch (error) {
      showToast("Failed to verify user", "error");
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${ipAdd}:5000/admin/accounts/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      showToast("Failed to fetch stats", "error");
    }
  };

  useEffect(() => {
    if (token) {
      fetchAccounts();
      fetchStats();
    }
  }, [search, role, isActive, page, token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Accounts</Text>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons name="search" size={24} color="#22c55e" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

       
      </View>

     <ScrollView style={styles.scrollArea}>
  <View style={styles.statsGrid}>
    {Object.entries(stats).map(([key, value]) => (
      <View key={key} style={styles.statsCard}>
        {iconMap[key] || <MaterialIcons name="bar-chart" size={32} color="#22c55e" />}
        <Text style={styles.statsKey}>{key.replace(/_/g, " ")}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
    ))}
  </View>
</ScrollView>


      {/* Accounts Table */}
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={[styles.cell, styles.headerCell]}>Email</Text>
              <Text style={[styles.cell, styles.headerCell]}>Username</Text>
              <Text style={[styles.cell, styles.headerCell]}>Role</Text>
              <Text style={[styles.cell, styles.headerCell]}>Verified</Text>
              
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item.email}</Text>
              <Text style={styles.cell}>{item.username}</Text>
              <Text style={styles.cell}>{item.role}</Text>
              
              <View style={[styles.cell, { flexDirection: "row", justifyContent: "center" }]}>
                {item.is_email_verified ? (
                  <Text style={{ color: "#16a34a", fontWeight: "600" }}>Yes</Text>
                ) : item.role === "user" ? (
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => verifyUser(item.id)}
                  >
                    <Text style={styles.verifyBtnText}>Verify User</Text>
                  </TouchableOpacity>
                ) : item.role === "organization" ? (
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => verifyOrganization(item.id)}
                  >
                    <Text style={styles.verifyBtnText}>Verify Org</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: "#dc2626", fontWeight: "600" }}>No</Text>
                )}
              </View>
              
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Pagination */}
      <View style={styles.pagination}>
       <TouchableOpacity
  onPress={() => setPage((p) => Math.max(p - 1, 1))}
  disabled={page === 1}
  style={[styles.pageBtn, page === 1 && styles.disabledBtn]}
>
  <Text style={styles.pageBtnText}>
    <MaterialIcons name="arrow-back-ios" size={16} color="#22c55e" /> Previous
  </Text>
</TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {page} of {pages}
        </Text>

       <TouchableOpacity
  onPress={() => setPage((p) => Math.min(p + 1, pages))}
  disabled={page === pages}
  style={[styles.pageBtn, page === pages && styles.disabledBtn]}
>
  <Text style={styles.pageBtnText}>
    Next{' '}
    <MaterialIcons name="arrow-forward-ios" size={16} color="#22c55e" />
  </Text>
</TouchableOpacity>
      </View>
    </View>
  );
}

function PickerRN({ selectedValue, onValueChange, items, placeholder = "Select", labels }) {
  return (
    <View style={styles.pickerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
        {[placeholder, ...items.filter(i => i !== "")].map((item, idx) => {
          const label = labels ? (labels[idx] || item) : item;
          const value = idx === 0 ? "" : items[idx - 1];
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.pickerItem,
                selectedValue === value && styles.pickerItemSelected,
              ]}
              onPress={() => onValueChange(value)}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  selectedValue === value && styles.pickerItemTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E8F5E9",  // لون خلفية فاتح جدا مريح للعين
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#16a34a", // أخضر داكن أكثر ثباتاً وحداثة
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 1,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  pickerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    backgroundColor: "#e7f5e9",  // أخضر باهت ناعم للخلفية
    padding: 6,
    borderRadius: 12,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 6,
    backgroundColor: "#d1fae5",  // أخضر فاتح جداً مع تأثير بارز قليل
    borderRadius: 8,
    shadowColor: "#10b981",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerItemSelected: {
    backgroundColor: "#16a34a",
  },
  pickerItemText: {
    fontSize: 14,
    color: "#065f46",
  },
  pickerItemTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },

  scrollArea: {
    maxHeight: 180,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  statsCard: {
    width: 170,
    backgroundColor: "#dcfce7",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#059669",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statsKey: {
    marginTop: 10,
    fontSize: 15,
    color: "#065f46",
    textAlign: "center",
  },
  statsValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#047857",
  },

  list: {
    marginTop: 12,
    maxHeight: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  listHeader: {
    flexDirection: "row",
    backgroundColor: "#d1fae5",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 6,
    textAlign: "center",
    fontSize: 15,
    color: "#374151",
  },
  headerCell: {
    fontWeight: "700",
    color: "#065f46",
    fontSize: 16,
  },
  verifyBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "center",
    shadowColor: "#059669",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  verifyBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  pageBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#059669",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pageBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  pageInfo: {
    fontSize: 15,
    color: "#4b5563",
  },
  disabledBtn: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
  },
});

