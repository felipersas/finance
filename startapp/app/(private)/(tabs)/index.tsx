import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useGetAnalytics } from '@/hooks/useAnalytics';
import { useTheme } from '@/hooks/useTheme';
import { formatMoneyView } from '@/utils/formatters/format-money';

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

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
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
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
  const { response, isLoading } = useGetAnalytics();
  const [chartType, setChartType] = useState<'total' | 'empresa' | 'pessoal'>('total');

  const analytics = response?.data;

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const gastosPorDia = analytics?.gastosPorDia ?? [];

  function normalizeLabel(label: string): string {
    if (!label) return '';
    const clean = label.replace('.', '').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  const gastosByLabel: { [key: string]: any } = {};
  gastosPorDia.forEach((item) => {
    const label = normalizeLabel(item.date);
    if (weekDays.includes(label)) {
      gastosByLabel[label] = item;
    }
  });

  // Garante sempre 7 pontos, na ordem Seg-Dom
  const chartData = weekDays.map((label) => {
    const item = gastosByLabel[label];
    return {
      label,
      value: Math.abs(
        chartType === 'total'
          ? item?.total ?? 0
          : chartType === 'empresa'
          ? item?.totalEmpresa ?? 0
          : item?.totalPessoal ?? 0
      ),
    };
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo total</Text>
          <Text style={styles.saldoValor}>
            {isLoading ? '...' : formatMoneyView((analytics?.saldoTotal ?? 0).toString())}
          </Text>
        </View>
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo empresa</Text>
          <Text style={styles.saldoValor}>
            {isLoading ? '...' : formatMoneyView((analytics?.saldoEmpresa ?? 0).toString())}
          </Text>
        </View>
        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo pessoal</Text>
          <Text style={styles.saldoValor}>
            {isLoading ? '...' : formatMoneyView((analytics?.saldoPessoal ?? 0).toString())}
          </Text>
        </View>
        <View style={styles.graficoContainer}>
          <Text style={styles.sectionTitle}>Gastos últimos 7 dias</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
            <Text
              style={{
                marginHorizontal: 8,
                color: chartType === 'total' ? Colors[theme].tint : Colors[theme].text,
                fontWeight: chartType === 'total' ? 'bold' : 'normal',
                textDecorationLine: chartType === 'total' ? 'underline' : 'none',
              }}
              onPress={() => setChartType('total')}
            >
              Total
            </Text>
            <Text
              style={{
                marginHorizontal: 8,
                color: chartType === 'empresa' ? Colors[theme].tint : Colors[theme].text,
                fontWeight: chartType === 'empresa' ? 'bold' : 'normal',
                textDecorationLine: chartType === 'empresa' ? 'underline' : 'none',
              }}
              onPress={() => setChartType('empresa')}
            >
              Empresa
            </Text>
            <Text
              style={{
                marginHorizontal: 8,
                color: chartType === 'pessoal' ? Colors[theme].tint : Colors[theme].text,
                fontWeight: chartType === 'pessoal' ? 'bold' : 'normal',
                textDecorationLine: chartType === 'pessoal' ? 'underline' : 'none',
              }}
              onPress={() => setChartType('pessoal')}
            >
              Pessoal
            </Text>
          </View>
          <LineChart
            data={chartData}
            height={160}
            width={width}
            color={Colors[theme].tint}
            startFillColor={Colors[theme].tint}
            endFillColor={Colors[theme].tint}
            hideRules
            hideYAxisText
            hideDataPoints
            areaChart
            xAxisLabelTextStyle={{ color: Colors[theme].text, fontSize: 10, opacity: 0.6, textAlign: 'center' }}
            maxValue={chartData.reduce((max, item) => (item.value > max ? item.value : max), 0) * 1.4 || 100}
            spacing={50}
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
            pointerConfig={{
              pointerStripUptoDataPoint: true,
              pointerStripHeight: 160,
              pointerStripColor: Colors[theme].text,
              pointerStripWidth: 2,
              pointerColor: 'transparent',
              radius: 4,
              pointerLabelWidth: 110,
              pointerLabelHeight: 90,
              pointerLabelComponent: (items: any[]) => {
                const item = items[0];
                return (
                  <View
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 0,
                      right: 0,
                      alignSelf: 'center',
                      height: 60,
                      width: 110,
                      backgroundColor: theme === 'dark' ? '#23272a' : '#fff',
                      borderRadius: 8,
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: Colors[theme].muted,
                      zIndex: 10,
                      marginLeft: -40,
                      marginTop: -30,
                    }}
                  >
                    <Text style={{ color: Colors[theme].text, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
                      {item?.label}
                    </Text>
                    <Text style={{ color: Colors[theme].tint, fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
                      {formatMoneyView(item?.value?.toString() ?? '0')}
                    </Text>
                  </View>
                );
              },
            }}
          />
        </View>
        {/* Resumo por categoria pode ser adaptado futuramente para segmentação também */}
      </ScrollView>
    </ThemedView>
  );
}
