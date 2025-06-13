import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const HelpScreen = () => {
  const openEmail = () => {
    Linking.openURL('mailto:support@giveandgrow.org?subject=Help%20Request');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Need Help? 🤝</Text>
      <Text style={styles.subtitle}>We’re here to support your journey with Give & Grow.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.question}>How do I join a volunteering opportunity?</Text>
          <Text style={styles.answer}>
            Go to the Discover page, browse opportunities, and click "Join" on one that matches your interests.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Can I volunteer remotely?</Text>
          <Text style={styles.answer}>
            Absolutely! Many organizations offer remote volunteering options. Use the filters on Discover to find them.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>How do I track my impact?</Text>
          <Text style={styles.answer}>
            Your profile shows your earned points, hours volunteered, and feedback from organizations.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📧 Contact Support</Text>
        <Text style={styles.supportText}>
          If you couldn’t find your answer above, feel free to reach out to our support team.
        </Text>
        <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.emailButtonText}>Email Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',   // أخضر فاتح مريح للعين
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#2e7d32', // أخضر غامق
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#388e3c',
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#66bb6a',
    paddingBottom: 6,
  },
  faqItem: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  question: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#2c2c2c',
  },
  answer: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    fontWeight: '500',
  },
  supportText: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 22,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43a047',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.8,
  },
});

export default HelpScreen;
