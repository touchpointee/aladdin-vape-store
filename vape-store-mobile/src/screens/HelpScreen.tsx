import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { MessageCircle, Phone, Mail } from '../components/Icons';
import { get } from '../api/client';
import { fontFamily, fontFamilyBold } from '../theme';

const FAQS = [
  { q: 'How do I return an item?', a: 'Returns are accepted within 7 days of delivery if the item is unused and sealed.' },
  { q: 'Where is my order?', a: "You can track your order status in the 'My Orders' section." },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within India.' },
  { q: 'Is Cash on Delivery available?', a: 'Yes, we support COD for all orders.' },
];

export default function HelpScreen() {
  const [whatsapp, setWhatsapp] = useState('');

  React.useEffect(() => {
    get<{ value: string }>('api/settings', { key: 'whatsapp_number' })
      .then((r) => r?.value && setWhatsapp(r.value))
      .catch(() => {});
  }, []);

  const openWhatsApp = () => {
    const num = whatsapp.replace(/\D/g, '');
    if (num) Linking.openURL(`https://wa.me/${num}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.para}>Need help with your order or have questions? Get in touch with us.</Text>

      <View style={styles.contactRow}>
        <TouchableOpacity style={[styles.contactCard, styles.whatsappCard]} onPress={openWhatsApp}>
          <MessageCircle size={28} color="#fff" />
          <Text style={styles.contactCardText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactCard, styles.callCard]} onPress={() => Linking.openURL('tel:+919876543210')}>
          <Phone size={24} color="#fff" />
          <Text style={styles.contactCardText}>Call Us</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.emailCard} onPress={() => Linking.openURL('mailto:support@mrvape.com')}>
        <Mail size={24} color="#6b7280" />
        <Text style={styles.emailText}>support@mrvape.com</Text>
      </TouchableOpacity>

      <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
      {FAQS.map((faq, i) => (
        <View key={i} style={styles.faqCard}>
          <Text style={styles.faqQ}>{faq.q}</Text>
          <Text style={styles.faqA}>{faq.a}</Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  title: { fontSize: 22, fontFamily: fontFamilyBold, color: '#111', marginBottom: 8 },
  para: { fontSize: 14, fontFamily, color: '#6b7280', marginBottom: 24 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  contactCard: { flex: 1, padding: 20, borderRadius: 12, alignItems: 'center', gap: 8 },
  whatsappCard: { backgroundColor: '#22c55e' },
  callCard: { backgroundColor: '#2563eb' },
  contactCardText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 14 },
  emailCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6' },
  emailText: { fontSize: 14, fontFamily: fontFamilyBold, color: '#374151' },
  faqTitle: { fontSize: 12, fontFamily: fontFamilyBold, color: '#374151', marginBottom: 12, textTransform: 'uppercase' },
  faqCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  faqQ: { fontFamily: fontFamilyBold, color: '#111', marginBottom: 8 },
  faqA: { fontSize: 14, fontFamily, color: '#6b7280', lineHeight: 20 },
});
