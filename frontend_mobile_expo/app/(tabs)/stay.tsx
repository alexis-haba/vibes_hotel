// frontend/src/screens/StayScreen.tsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import eventBus from "../../utils/eventBus";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B1220",
  card: "#121A2A",
  text: "#E5E7EB",
  sub: "#9CA3AF",
  primary: "#10B981",
  border: "#27324A",
  danger: "#EF4444",
};

const TYPO = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  label: { fontSize: 13, color: COLORS.sub, marginBottom: 6 },
  money: { fontSize: 16, fontWeight: "700", color: COLORS.text },
});

type Expense = { reason: string; amount: string };

export default function StayScreen() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("");
  const [hours, setHours] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const [autoAmount, setAutoAmount] = useState("");
  const [amount, setAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  const [stayType, setStayType] = useState("hour");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tariff, setTariff] = useState<{ hourRate: number; nightRate: number }>({
    hourRate: 50,
    nightRate: 100,
  });

  // Charger chambres
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data);
      } catch (err) {
        // Erreur silencieuse côté mobile
      }
    };
    fetchRooms();
  }, []);

  // Charger tarifs
  useEffect(() => {
    const fetchTariff = async () => {
      try {
        const res = await api.get("/tariffs");
        if (res.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setTariff(res.data[0]);
          } else {
            setTariff(res.data);
          }
        }
      } catch (err) {
        // Erreur silencieuse côté mobile
      }
    };
    fetchTariff();
  }, []);

  // Calcul automatique du montant
  useEffect(() => {
    if (hours && Number(hours) > 0) {
      const now = new Date();
      const out = new Date(now.getTime() + Number(hours) * 60 * 60 * 1000);
      setCheckIn(now);
      setCheckOut(out);

      const newAutoAmount =
        stayType === "hour"
          ? (Number(hours) * tariff.hourRate).toString()
          : tariff.nightRate.toString();

      setAutoAmount(newAutoAmount);

      if (!isCustomAmount) {
        setAmount(newAutoAmount);
      }
    } else {
      setCheckIn(null);
      setCheckOut(null);
      setAutoAmount("");
      if (!isCustomAmount) setAmount("");
    }
  }, [hours, stayType, tariff, isCustomAmount]);

  // ✅ Validation + Soumission
  const handleSubmit = async () => {
    if (!roomId) {
      Alert.alert("Erreur", "Veuillez choisir une chambre.");
      return;
    }
    if (!hours || Number(hours) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une durée en heures.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const now = new Date();
      const numHours = Number(hours);
      const out = new Date(now.getTime() + numHours * 60 * 60 * 1000);

      const payload = {
        roomId,
        startTime: now.toISOString(),
        endTime: out.toISOString(),
        amount: Number(amount) || 0, // ✅ c'est bien le montant (auto ou custom)
        phase: stayType,
        paymentMethod: paymentMethod === "mobile" ? "other" : paymentMethod,
        expenses: expenses
          .filter((e) => e.reason.trim() && e.amount)
          .map((e) => ({ description: e.reason.trim(), amount: Number(e.amount) })),
      };

      const res = await api.post("/stays", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Succès", "Séjour enregistré !");
      eventBus.emit("dataUpdated");
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.response?.data?.msg || "Une erreur est survenue, réessayez."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[TYPO.h1, { marginBottom: 12 }]}>Enregistrer une entrée</Text>

      <View style={styles.card}>
        {/* Choix chambre */}
        <View style={styles.pickerBox}>
          <Picker
            dropdownIconColor={COLORS.text}
            selectedValue={roomId}
            onValueChange={(v) => setRoomId(v)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="-- Choisir une chambre --" value="" />
            {rooms.map((room) => (
              <Picker.Item key={room._id} label={`Chambre ${room.number}`} value={room._id} />
            ))}
          </Picker>
        </View>

        {/* Durée */}
        <Text style={TYPO.label}>Durée (heures)</Text>
        <TextInput
          value={hours}
          onChangeText={(text) => {
            setHours(text);
            // ❌ on ne force plus isCustomAmount(false) ici
          }}
          placeholder="Ex: 2"
          placeholderTextColor={COLORS.sub}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Heures entrée/sortie */}
        {checkIn && checkOut && (
          <View style={[styles.infoBox, { marginTop: 8 }]}>
            <Text style={{ color: COLORS.text }}>Heure-Entrée : {checkIn.toLocaleString()}</Text>
            <Text style={{ color: COLORS.text }}>Heure-Sortie : {checkOut.toLocaleString()}</Text>
          </View>
        )}

        {/* Montant */}
        <Text style={TYPO.label}>Montant (FG)</Text>
        <TextInput
          value={amount}
          onChangeText={(text) => {
            setIsCustomAmount(true); // ✅ si je tape, je force en manuel
            setAmount(text);
          }}
          placeholder={`Montant (auto: ${autoAmount || "0"})`}
          placeholderTextColor={COLORS.sub}
          keyboardType="numeric"
          style={styles.input}
        />

        {isCustomAmount && (
          <TouchableOpacity
            onPress={() => {
              // ✅ On repasse juste en mode automatique
              setIsCustomAmount(false);
            }}
            style={[styles.btn, { backgroundColor: COLORS.border, marginTop: 6 }]}
          >
            <Ionicons name="refresh" size={18} color={COLORS.text} />
            <Text style={styles.btnText}>Revenir au montant automatique</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type de séjour */}
      <Text style={TYPO.label}>Type de séjour</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={stayType}
          onValueChange={(val) => setStayType(val)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Heure" value="hour" />
          <Picker.Item label="Nuitée" value="night" />
        </Picker>
      </View>

      {/* Méthode de paiement */}
      <Text style={TYPO.label}>Méthode de paiement</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(val) => setPaymentMethod(val)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="Carte" value="card" />
          <Picker.Item label="Mobile" value="mobile" />
          <Picker.Item label="Autre" value="other" />
        </Picker>
      </View>

      {/* Bouton enregistrer */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.btn, { backgroundColor: COLORS.primary }]}
      >
        <Ionicons name="save" size={18} color="#0B1220" />
        <Text style={[styles.btnText, { color: "#0B1220", fontWeight: "800" }]}>
          Enregistrer
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.bg },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#0F172A",
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  btnText: { color: COLORS.text, marginLeft: 8, fontWeight: "700" },
  pickerBox: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    height: 44,
    justifyContent: "center",
  },
  picker: { color: COLORS.text, fontSize: 18 },
  pickerItem: { fontSize: 18, color: COLORS.text },
  infoBox: {
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
