import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function ChartWeekly({ data }: any) {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrées & Dépenses (7 jours)</Text>
      <LineChart
        data={{
          labels: data.labels,
          datasets: [
            { data: data.entries, strokeWidth: 2 },
            { data: data.expenses, strokeWidth: 2 }
          ]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix=" FG"
        chartConfig={{
          backgroundColor: "#f9fafb",
          backgroundGradientFrom: "#f9fafb",
          backgroundGradientTo: "#f9fafb",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});
