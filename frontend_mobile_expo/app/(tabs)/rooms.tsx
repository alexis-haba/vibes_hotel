import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B1220",
  card: "#121A2A",
  text: "#E5E7EB",
  sub: "#9CA3AF",
  primary: "#10B981",
  border: "#27324A",
  red: "#EF4444",
  yellow: "#F59E0B",
};

const TYPO = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  p: { fontSize: 14, color: COLORS.sub },
});

type Room = {
  _id: string;
  number: string;
  state: "free" | "occupied" | "cleaning";
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await api.get("/rooms", { headers: { Authorization: `Bearer ${token}` } });
      setRooms(res.data);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger les chambres");
    }
  };

  useEffect(() => { load(); }, []);

  const cycleState = (s: Room["state"]) =>
    s === "free" ? "occupied" : s === "occupied" ? "cleaning" : "free";

 const updateRoom = async (room: Room) => {
  const next = cycleState(room.state);

  // ⚠️ Si la chambre est occupée → demander confirmation
  if (room.state === "occupied") {
    Alert.alert(
      "Confirmer le changement",
      "Cette chambre est occupée. Voulez-vous vraiment changer son état ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Oui", 
          style: "destructive", 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await api.put(`/rooms/${room._id}`, { state: next }, { headers: { Authorization: `Bearer ${token}` } });
              setRooms(prev => prev.map(r => (r._id === room._id ? { ...r, state: next } : r)));
            } catch (e) {
              Alert.alert("Erreur", "Mise à jour impossible");
            }
          } 
        },
      ]
    );
    return;
  }

  // ✅ Sinon mise à jour normale
  try {
    const token = await AsyncStorage.getItem("token");
    await api.put(`/rooms/${room._id}`, { state: next }, { headers: { Authorization: `Bearer ${token}` } });
    setRooms(prev => prev.map(r => (r._id === room._id ? { ...r, state: next } : r)));
  } catch (e) {
    Alert.alert("Erreur", "Mise à jour impossible");
  }
};


  const badgeStyle = (state: Room["state"]) => ({
    backgroundColor: state === "free" ? "rgba(16,185,129,0.15)" : state === "occupied" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
    color: state === "free" ? COLORS.primary : state === "occupied" ? COLORS.red : COLORS.yellow,
  });

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={rooms}
      keyExtractor={(i) => i._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View>
            <Text style={TYPO.h1}>Chambre {item.number}</Text>
            <View style={[styles.badge, { backgroundColor: badgeStyle(item.state).backgroundColor }]}>
              <Text style={{ color: badgeStyle(item.state).color, fontWeight: "700" }}>
                {item.state === "free" ? "Libre" : item.state === "occupied" ? "Occupée" : "En nettoyage"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.action} onPress={() => updateRoom(item)}>
            <Ionicons name="repeat" size={18} color={COLORS.text} />
            <Text style={{ color: COLORS.text, marginLeft: 6, fontWeight: "600" }}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}
    />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  action: { flexDirection: "row", alignItems: "center", backgroundColor: "#1F2937", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
});
