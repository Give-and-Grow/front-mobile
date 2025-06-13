import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import ipAdd from "../scripts/helpers/ipAddress"; 
const SkillsSection = () => {
  const [mySkills, setMySkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [profileSkillsText, setProfileSkillsText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMySkills = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/user-skills/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMySkills(res.data.skills);
      const skillsString = res.data.skills.map(s => s.name).join("\n");
      setProfileSkillsText(skillsString);
    } catch (err) {
      Alert.alert("Error", "Failed to load my skills");
    }
  };

  const fetchAvailableSkills = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/user-skills/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSkills(res.data.available_skills);
    } catch (err) {
      Alert.alert("Error", "Failed to load available skills");
    }
  };

  const loadData = async () => {
    const savedToken = await AsyncStorage.getItem('userToken');
    if (savedToken) {
      await fetchMySkills(savedToken);
      await fetchAvailableSkills(savedToken);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addSkill = async (skillId, skillName) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      await axios.post(
        `${ipAdd}:5000/user-skills/add/${skillId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadData();
      setSelectedSkillId(null);
    } catch {
      Alert.alert("Error", "Could not add skill");
    }
  };

  const removeSkill = async (skillId, skillName) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      await axios.delete(
        `${ipAdd}:5000/user-skills/remove/${skillId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadData();
    } catch {
      Alert.alert("Error", "Could not remove skill");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Skills</Text>

      <View style={styles.skillsContainer}>
        {mySkills.map((skill) => (
          <View key={skill.id} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill.name}</Text>
            <TouchableOpacity
              onPress={() => removeSkill(skill.id, skill.name)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>Add a New Skill</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSkillId}
          onValueChange={(itemValue, itemIndex) => {
            const selected = availableSkills.find(s => s.id === itemValue);
            if (selected) {
              addSkill(selected.id, selected.name);
            }
          }}
        >
          <Picker.Item label="Select a skill" value={null} />
          {availableSkills.map(skill => (
            <Picker.Item key={skill.id} label={skill.name} value={skill.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.textArea}>{profileSkillsText || "No skills selected"}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2e7d32",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#388e3c",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  skillBadge: {
    flexDirection: "row",
    backgroundColor: "#a5d6a7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "#1b5e20",
  },
  removeButton: {
    marginLeft: 8,
  },
  removeText: {
    fontWeight: "bold",
    color: "red",
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    color: "#333",
    fontFamily: "monospace",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SkillsSection;
