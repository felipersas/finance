import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { formatMoneyView } from '@/utils/formatters/format-money';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';


// Exemplo de dados mockados para os últimos 7 dias
const chartData = [
  { value: 120, label: 'Seg' },
  { value: 80, label: 'Ter' },
  { value: 50, label: 'Qua' },
  { value: 30, label: 'Qui' },
  { value: 20, label: 'Sex' },
  { value: 60, label: 'Sáb' },
  { value: 90, label: 'Dom' },
];

const categories = [
  { name: 'Alimentação', value: 200 },
  { name: 'Transporte', value: 120 },
  { name: 'Lazer', value: 80 },
];

const createStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 24,
  },
  saldoContainer: {
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  saldoLabel: {
    fontSize: 16,
    color: Colors[theme].text,
    opacity: 0.7,
  },
  saldoValor: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors[theme].tint,
  },
  graficoContainer: {
    backgroundColor: Colors[theme].card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    alignItems: 'center' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
    color: Colors[theme].text,
  },
  categoriasContainer: {
    backgroundColor: Colors[theme].card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  categoriaItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 6,
  },
  categoriaNome: {
    fontSize: 16,
    color: Colors[theme].text,
    opacity: 0.8,
  },
  categoriaValor: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors[theme].tint,
  },
});

export default function Home() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  // Saldo total mockado
  const saldoTotal = 1500.75;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo total</Text>
          <Text style={styles.saldoValor}>{formatMoneyView(saldoTotal.toString())}</Text>
        </View>
        <View style={styles.graficoContainer}>
          <Text style={styles.sectionTitle}>Gastos últimos 7 dias</Text>
            <LineChart
              data={chartData}
              height={120}
              width={width - 64}
              color={Colors[theme].tint}
              startFillColor={Colors[theme].tint}
              endFillColor={Colors[theme].tint}
              hideRules
              hideYAxisText
              hideDataPoints
              areaChart
              xAxisLabelTextStyle={{ color: Colors[theme].text, fontSize: 12, opacity: 0.6 }}
              spacing={46}
              isAnimated
              lineGradient
              curved
              startOpacity={0.3}
              endOpacity={0.05}
              initialSpacing={20}
              noOfSections={4}
              yAxisColor="white"
              yAxisThickness={0}
              rulesType="solid"
              rulesColor="gray"
              animationDuration={600}
              showXAxisIndices={false}
              showVerticalLines={false}
              showReferenceLine1={false}
              showReferenceLine2={false}
              showReferenceLine3={false}
              yAxisTextNumberOfLines={1}
              xAxisLength={chartData.length}
            />
        </View>
        <View style={styles.categoriasContainer}>
          <Text style={styles.sectionTitle}>Resumo por categoria</Text>
          {categories.map((cat) => (
            <View key={cat.name} style={styles.categoriaItem}>
              <Text style={styles.categoriaNome}>{cat.name}</Text>
              <Text style={styles.categoriaValor}>{formatMoneyView(cat.value.toString())}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
