import { ThemedView } from "@/components/common";
import { useGetAnalytics } from "@/hooks/useAnalytics";
import { formatMoneyView } from "@/utils/formatters/format-money";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import React, { useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

export default function Home() {
  const { width } = useWindowDimensions();
  const { response, isLoading } = useGetAnalytics();
  const [chartType, setChartType] = useState<"total" | "empresa" | "pessoal">(
    "total",
  );

  const analytics = response?.data;

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const gastosPorDia = analytics?.gastosPorDia ?? [];

  function normalizeLabel(label: string): string {
    if (!label) return "";
    const clean = label.replace(".", "").toLowerCase();
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
        chartType === "total"
          ? (item?.total ?? 0)
          : chartType === "empresa"
            ? (item?.totalEmpresa ?? 0)
            : (item?.totalPessoal ?? 0),
      ),
    };
  });

  return (
    <ThemedView className="flex-1 bg-transparent">
      <ScrollView
        className="py-6 px-3 gap-6"
        contentContainerStyle={{ gap: 24 }}
      >
        {/* Card de saldo total com empresa e pessoal lado a lado */}
        <View className="bg-light-card bg-card rounded-2xl p-5 mb-3 shadow-sm min-w-[280px]">
          <View className="flex-row items-center mb-2">
            <Text className="flex-1 text-text text-light-text ">
              Saldo total
            </Text>
            {/* Ícone de carteira */}
            <View>
              <MaterialIcons
                name="account-balance-wallet"
                size={28}
                color="#b4da4aff"
              />
            </View>
          </View>
          <Text className="text-[32px] font-bold text-primary mb-3">
            {isLoading
              ? "..."
              : formatMoneyView((analytics?.saldoTotal ?? 0).toString())}
          </Text>
          <View className="flex-row items-center justify-between">
            {/* Empresa */}
            <View className="flex-1 items-center">
              <Text className="text-sm text-primary opacity-70 mb-0.5">
                Empresa
              </Text>
              <Text className="text-base font-bold text-primary">
                {isLoading
                  ? "..."
                  : formatMoneyView((analytics?.saldoEmpresa ?? 0).toString())}
              </Text>
            </View>
            {/* Linha vertical separadora */}
            <View className="w-px h-8 bg-light-muted bg-muted mx-3 opacity-40" />
            {/* Pessoal */}
            <View className="flex-1 items-center">
              <Text className="text-sm text-primary opacity-70 mb-0.5">
                Pessoal
              </Text>
              <Text className="text-base font-bold text-primary">
                {isLoading
                  ? "..."
                  : formatMoneyView((analytics?.saldoPessoal ?? 0).toString())}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-light-card bg-card rounded-2xl p-5 pl-0 pr-0 mb-3 shadow-sm items-center">
          <Text className="text-lg font-semibold mb-2 text-text">
            Gastos últimos 7 dias
          </Text>
          <View className="flex-row justify-center mb-3">
            <Text
              className={`mx-2 ${
                chartType === "total"
                  ? "text-primary font-bold underline"
                  : "text-text"
              }`}
              onPress={() => setChartType("total")}
            >
              Total
            </Text>
            <Text
              className={`mx-2 ${
                chartType === "empresa"
                  ? "text-primary font-bold underline"
                  : "text-text"
              }`}
              onPress={() => setChartType("empresa")}
            >
              Empresa
            </Text>
            <Text
              className={`mx-2 ${
                chartType === "pessoal"
                  ? "text-primary font-bold underline"
                  : "text-text"
              }`}
              onPress={() => setChartType("pessoal")}
            >
              Pessoal
            </Text>
          </View>
          <LineChart
            data={chartData}
            height={160}
            width={width}
            color="#b4da4aff"
            startFillColor="#b4da4aff"
            endFillColor="#b4da4aff"
            hideRules
            hideYAxisText
            hideDataPoints
            areaChart
            xAxisLabelTextStyle={{
              fontSize: 10,
              opacity: 0.6,
              textAlign: "center",
              color: "white",
            }}
            maxValue={
              chartData.reduce(
                (max, item) => (item.value > max ? item.value : max),
                0,
              ) * 1.4 || 100
            }
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
              pointerStripColor: "currentColor",
              pointerStripWidth: 2,
              pointerColor: "transparent",
              radius: 4,
              pointerLabelWidth: 110,
              pointerLabelHeight: 90,
              pointerLabelComponent: (items: any[]) => {
                const item = items[0];
                return (
                  <View className="absolute top-2.5 left-0 right-0 self-center h-[60px] w-[110px] bg-light-card bg-card rounded-lg shadow-md border border-light-muted border-muted z-10 -ml-10 -mt-7.5">
                    <Text className="text-text text-xs opacity-70 text-center">
                      {item?.label}
                    </Text>
                    <Text className="text-tint font-bold text-text text-center">
                      {formatMoneyView(item?.value?.toString() ?? "0")}
                    </Text>
                  </View>
                );
              },
            }}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
