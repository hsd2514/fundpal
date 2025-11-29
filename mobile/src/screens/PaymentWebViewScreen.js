import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import api from '../api/client';

const PaymentWebViewScreen = ({ route, navigation }) => {
  const { paymentLink, orderId } = route.params;
  const [loading, setLoading] = useState(true);

  const handleNavigationStateChange = (navState) => {
    // Cashfree redirects to the return_url (e.g., google.com) on success/failure
    // We intercept this to know payment is done
    if (navState.url.includes('google.com')) {
      // Payment likely completed (or cancelled)
      // Verify with backend
      verifyPayment();
    }
  };

  const verifyPayment = async () => {
    try {
      const res = await api.post(`/payment/verify?order_id=${orderId}`);
      // Silently verify and navigate back
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      console.error("Verification failed", error);
      // Even if verification fails (e.g. network), go back to dashboard
      navigation.navigate('Main', { screen: 'Home' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Secure Payment</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <WebView
        source={{ uri: paymentLink }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={{ flex: 1 }}
      />
      
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50, // Safe area
    backgroundColor: '#18181b',
  },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PaymentWebViewScreen;
