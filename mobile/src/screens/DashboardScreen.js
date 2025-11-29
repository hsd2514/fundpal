import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Scan, Send, Briefcase, User, Target, CreditCard, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useStore from '../store/useStore';
import api from '../api/client';

const DashboardScreen = ({ navigation }) => {
  const { user } = useStore();
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('salaried');
  
  // Modals
  const [addMoneyVisible, setAddMoneyVisible] = useState(false);
  const [addGoalVisible, setAddGoalVisible] = useState(false);
  const [addDebtVisible, setAddDebtVisible] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);
  const [billVisible, setBillVisible] = useState(false);

  // Form States
  const [amount, setAmount] = useState('');
  const [goalForm, setGoalForm] = useState({ name: '', target: '', deadline: '' });
  const [debtForm, setDebtForm] = useState({ name: '', principal: '', rate: '', emi: '', day: '' });
  
  // Scan & Bill States
  const [scanning, setScanning] = useState(false);
  const [scannedMerchant, setScannedMerchant] = useState(null);
  const [billForm, setBillForm] = useState({ biller: '', type: '', amount: '', category: '' });

  // Date Picker State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('goal'); // 'goal' or 'debt'
  const [tempDate, setTempDate] = useState(new Date());

  const showDatePicker = (mode) => {
    setDatePickerMode(mode);
    setTempDate(new Date());
    setDatePickerVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      if (datePickerMode === 'goal') {
        setGoalForm({ ...goalForm, deadline: formattedDate });
      } else {
        setDebtForm({ ...debtForm, day: formattedDate });
      }
    }
  };



  const fetchData = async () => {
    try {
      const [dashRes, goalsRes, debtsRes] = await Promise.all([
        api.get(`/dashboard?user_id=${user?.id || 'demo'}`),
        api.get(`/goals?user_id=${user?.id || 'demo'}`),
        api.get(`/debts?user_id=${user?.id || 'demo'}`)
      ]);
      setData(dashRes.data);
      setGoals(goalsRes.data);
      setDebts(debtsRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchData();
      }
    }, [user])
  );

  const handleAddMoney = async () => {
    if (!amount) return;
    try {
      setLoading(true);
      const res = await api.post('/payment/create-order', {
        amount: parseFloat(amount),
        user_id: user?.id || 'demo'
      });
      setAddMoneyVisible(false);
      setAmount('');
      setLoading(false);
      if (res.data.payment_link) {
        navigation.navigate('PaymentWebView', {
          paymentLink: res.data.payment_link,
          orderId: res.data.order_id
        });
      }
    } catch (error) {
      console.error("Payment failed", error);
      alert("Failed to initiate payment");
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      await api.post(`/goals?user_id=${user?.id || 'demo'}`, {
        name: goalForm.name,
        target_amount: parseFloat(goalForm.target),
        deadline: goalForm.deadline
      });
      setAddGoalVisible(false);
      setGoalForm({ name: '', target: '', deadline: '' });
      fetchData();
    } catch (error) {
      alert("Failed to create goal");
    }
  };

  const handleCreateDebt = async () => {
    try {
      await api.post(`/debts?user_id=${user?.id || 'demo'}`, {
        name: debtForm.name,
        principal: parseFloat(debtForm.principal),
        interest_rate: parseFloat(debtForm.rate),
        emi_amount: parseFloat(debtForm.emi),
        emi_day: parseInt(debtForm.day)
      });
      setAddDebtVisible(false);
      setDebtForm({ name: '', principal: '', rate: '', emi: '', day: '' });
      fetchData();
    } catch (error) {
      alert("Failed to create debt");
    }
  };

  const startScan = () => {
    setScanVisible(true);
    setScanning(true);
    setScannedMerchant(null);
    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      setScannedMerchant("Starbucks Coffee");
    }, 2000);
  };

  const handleScanPay = async () => {
    if (!amount) return;
    try {
      await api.post(`/bills/pay?user_id=${user?.id || 'demo'}`, {
        biller_name: scannedMerchant,
        amount: parseFloat(amount),
        bill_type: 'merchant',
        category: billForm.category || 'Shopping' // Default to Shopping if not selected
      });
      setScanVisible(false);
      setAmount('');
      setScannedMerchant(null);
      setBillForm({...billForm, category: ''}); // Reset category
      alert(`Paid ₹${amount} to ${scannedMerchant}`);
      fetchData();
    } catch (error) {
      alert("Payment failed");
    }
  };

  const handleBillPay = async () => {
    if (!billForm.amount || !billForm.biller) return;
    try {
      await api.post(`/bills/pay?user_id=${user?.id || 'demo'}`, {
        biller_name: billForm.biller,
        amount: parseFloat(billForm.amount),
        bill_type: billForm.type
      });
      setBillVisible(false);
      setBillForm({ biller: '', type: '', amount: '' });
      alert(`Bill Paid Successfully!`);
      fetchData();
    } catch (error) {
      alert("Bill payment failed");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
            <Text style={styles.subGreeting}>Welcome back</Text>
          </View>
          <TouchableOpacity 
            style={styles.toggleContainer}
            onPress={() => setUserType(prev => prev === 'salaried' ? 'gig' : 'salaried')}
          >
            <View style={[styles.toggleBtn, userType === 'salaried' && styles.toggleActive]}>
              <User size={14} color={userType === 'salaried' ? 'white' : '#71717a'} />
            </View>
            <View style={[styles.toggleBtn, userType === 'gig' && styles.toggleActive]}>
              <Briefcase size={14} color={userType === 'gig' ? 'white' : '#71717a'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#2563eb', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>₹{data?.current_balance?.toLocaleString() || '0'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <ArrowDownLeft size={16} color="#34d399" />
              </View>
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>₹{data?.total_income?.toLocaleString() || '0'}</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <ArrowUpRight size={16} color="#f87171" />
              </View>
              <View>
                <Text style={styles.statLabel}>Expense</Text>
                <Text style={styles.statValue}>₹{data?.total_expense?.toLocaleString() || '0'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <ActionButton 
            icon={Plus} 
            label="Add Money" 
            color="#3b82f6" 
            onPress={() => setAddMoneyVisible(true)} 
          />
          <ActionButton 
            icon={Target} 
            label="Add Goal" 
            color="#a855f7" 
            onPress={() => setAddGoalVisible(true)} 
          />
          <ActionButton 
            icon={CreditCard} 
            label="Add Debt" 
            color="#ef4444" 
            onPress={() => setAddDebtVisible(true)} 
          />
          <ActionButton 
            icon={Scan} 
            label="Scan" 
            color="#f59e0b" 
            onPress={startScan} 
          />
        </View>
        
        {/* Extra Action for Bills */}
        <View style={{ marginTop: -12, marginBottom: 24, alignItems: 'center' }}>
             <TouchableOpacity onPress={() => setBillVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272a', padding: 8, paddingHorizontal: 16, borderRadius: 20 }}>
                <Wallet size={16} color="#f59e0b" style={{ marginRight: 8 }} />
                <Text style={{ color: 'white', fontWeight: '600' }}>Pay Bills</Text>
             </TouchableOpacity>
        </View>

        {/* Goals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Goals</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Target size={20} color="#a855f7" />
              </View>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalAmount}>₹{goal.current_amount || 0} / ₹{goal.target_amount}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((goal.current_amount || 0) / goal.target_amount) * 100}%` }]} />
              </View>
            </View>
          ))}
          {goals.length === 0 && <Text style={styles.emptyText}>No goals yet. Add one!</Text>}
        </ScrollView>

        {/* Debts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Debts</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {debts.map((debt) => (
            <View key={debt.id} style={styles.debtCard}>
              <View style={styles.debtIcon}>
                <CreditCard size={20} color="#ef4444" />
              </View>
              <Text style={styles.goalName}>{debt.name}</Text>
              <Text style={styles.goalAmount}>₹{debt.current_balance}</Text>
              <Text style={styles.emiText}>EMI: ₹{debt.emi_amount}/mo</Text>
            </View>
          ))}
          {debts.length === 0 && <Text style={styles.emptyText}>Debt free! Great job!</Text>}
        </ScrollView>

      </ScrollView>

      {/* Add Money Modal */}
      <CustomModal visible={addMoneyVisible} onClose={() => setAddMoneyVisible(false)} title="Add Money">
        <TextInput
          style={styles.input}
          placeholder="Amount (₹)"
          placeholderTextColor="#71717a"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          autoFocus
        />
        <TouchableOpacity style={styles.confirmBtn} onPress={handleAddMoney}>
          <Text style={styles.btnText}>Add Money</Text>
        </TouchableOpacity>
      </CustomModal>



      {/* Add Goal Modal */}
      <CustomModal visible={addGoalVisible} onClose={() => setAddGoalVisible(false)} title="New Goal">
        <TextInput style={styles.input} placeholder="Goal Name" placeholderTextColor="#71717a" value={goalForm.name} onChangeText={t => setGoalForm({...goalForm, name: t})} />
        <TextInput style={styles.input} placeholder="Target Amount (₹)" placeholderTextColor="#71717a" keyboardType="numeric" value={goalForm.target} onChangeText={t => setGoalForm({...goalForm, target: t})} />
        
        <TouchableOpacity style={styles.dateSelector} onPress={() => showDatePicker('goal')}>
            <Text style={{ color: goalForm.deadline ? 'white' : '#71717a', fontSize: 16 }}>
                {goalForm.deadline || "Select Deadline (YYYY-MM-DD)"}
            </Text>
            <Text style={{ fontSize: 18 }}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.confirmBtn, { marginTop: 16 }]} onPress={handleCreateGoal}>
          <Text style={styles.btnText}>Create Goal</Text>
        </TouchableOpacity>

        {datePickerVisible && datePickerMode === 'goal' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            themeVariant="dark"
          />
        )}
      </CustomModal>

      {/* Add Debt Modal */}
      <CustomModal visible={addDebtVisible} onClose={() => setAddDebtVisible(false)} title="New Debt">
        <TextInput style={styles.input} placeholder="Debt Name" placeholderTextColor="#71717a" value={debtForm.name} onChangeText={t => setDebtForm({...debtForm, name: t})} />
        <TextInput style={styles.input} placeholder="Principal Amount (₹)" placeholderTextColor="#71717a" keyboardType="numeric" value={debtForm.principal} onChangeText={t => setDebtForm({...debtForm, principal: t})} />
        <TextInput style={styles.input} placeholder="Interest Rate (%)" placeholderTextColor="#71717a" keyboardType="numeric" value={debtForm.rate} onChangeText={t => setDebtForm({...debtForm, rate: t})} />
        <TextInput style={styles.input} placeholder="EMI Amount (₹)" placeholderTextColor="#71717a" keyboardType="numeric" value={debtForm.emi} onChangeText={t => setDebtForm({...debtForm, emi: t})} />
        
        <TouchableOpacity style={styles.dateSelector} onPress={() => showDatePicker('debt')}>
            <Text style={{ color: debtForm.day ? 'white' : '#71717a', fontSize: 16 }}>
                {debtForm.day || "Select Start Date (YYYY-MM-DD)"}
            </Text>
            <Text style={{ fontSize: 18 }}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.confirmBtn, { marginTop: 16 }]} onPress={handleCreateDebt}>
          <Text style={styles.btnText}>Add Debt</Text>
        </TouchableOpacity>

        {datePickerVisible && datePickerMode === 'debt' && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            themeVariant="dark"
          />
        )}
      </CustomModal>





      {/* Scan & Pay Modal */}
      <CustomModal visible={scanVisible} onClose={() => setScanVisible(false)} title="Scan & Pay">
        {scanning ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator size="large" color="#a855f7" />
            <Text style={{ color: '#a1a1aa', marginTop: 16 }}>Scanning QR Code...</Text>
          </View>
        ) : (
          <>
            <Text style={{ color: 'white', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Paying: {scannedMerchant}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              placeholderTextColor="#71717a"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />

            <Text style={{ color: '#a1a1aa', marginBottom: 8, marginLeft: 4 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Food', 'Travel', 'Shopping', 'Health', 'Entertainment'].map(cat => (
                    <TouchableOpacity 
                        key={cat}
                        style={{ 
                            padding: 8, 
                            paddingHorizontal: 12,
                            backgroundColor: billForm.category === cat ? '#a855f7' : '#27272a',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: billForm.category === cat ? '#a855f7' : '#3f3f46'
                        }}
                        onPress={() => setBillForm({...billForm, category: cat})}
                    >
                        <Text style={{ color: 'white', fontSize: 12 }}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#a855f7' }]} onPress={handleScanPay}>
              <Text style={styles.btnText}>Pay Now</Text>
            </TouchableOpacity>
          </>
        )}
      </CustomModal>

      {/* Bill Pay Modal */}
      <CustomModal visible={billVisible} onClose={() => setBillVisible(false)} title="Pay Bills">
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Electricity', 'Water', 'Internet'].map(type => (
                <TouchableOpacity 
                    key={type}
                    style={{ 
                        flex: 1, 
                        padding: 8, 
                        backgroundColor: billForm.type === type.toLowerCase() ? '#f59e0b' : '#27272a',
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                    onPress={() => setBillForm({...billForm, type: type.toLowerCase(), biller: `${type} Board`})}
                >
                    <Text style={{ color: 'white', fontSize: 12 }}>{type}</Text>
                </TouchableOpacity>
            ))}
        </View>
        <TextInput 
            style={styles.input} 
            placeholder="Biller Name" 
            placeholderTextColor="#71717a" 
            value={billForm.biller} 
            onChangeText={t => setBillForm({...billForm, biller: t})} 
        />
        <TextInput 
            style={styles.input} 
            placeholder="Amount (₹)" 
            placeholderTextColor="#71717a" 
            keyboardType="numeric" 
            value={billForm.amount} 
            onChangeText={t => setBillForm({...billForm, amount: t})} 
        />
        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#f59e0b' }]} onPress={handleBillPay}>
          <Text style={styles.btnText}>Pay Bill</Text>
        </TouchableOpacity>
      </CustomModal>



    </SafeAreaView>
  );
};

const ActionButton = ({ icon: Icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomModal = ({ visible, onClose, title, children }) => (
  <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#71717a" /></TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subGreeting: { fontSize: 14, color: '#a1a1aa' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#27272a', borderRadius: 20, padding: 4 },
  toggleBtn: { padding: 8, borderRadius: 16 },
  toggleActive: { backgroundColor: '#3f3f46' },
  balanceCard: { padding: 24, borderRadius: 24, marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 24 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  statValue: { color: 'white', fontSize: 16, fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#27272a' },
  actionLabel: { color: '#a1a1aa', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  horizontalScroll: { marginBottom: 24 },
  goalCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 16, marginRight: 12, width: 160, borderWidth: 1, borderColor: '#27272a' },
  goalIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(168, 85, 247, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  goalName: { color: 'white', fontWeight: '600', marginBottom: 4 },
  goalAmount: { color: '#a1a1aa', fontSize: 12, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#27272a', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#a855f7' },
  debtCard: { backgroundColor: '#18181b', padding: 16, borderRadius: 16, marginRight: 12, width: 160, borderWidth: 1, borderColor: '#27272a' },
  debtIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emiText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#71717a', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  input: { backgroundColor: '#27272a', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 16 },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  calendarIcon: { backgroundColor: '#27272a', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  dateSelector: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#27272a', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16 
  },
});

export default DashboardScreen;
