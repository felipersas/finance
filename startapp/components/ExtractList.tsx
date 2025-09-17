import { ListExtractItem, useListExtract } from "@/hooks/useListExtract";
import { ThemedView } from "./ThemedView";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { capitalizeEachWord } from "@/utils/formatters/capitalize-each-word";
import UploadCsvButton from "./UploadCsvButton";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

type OrderDirection = 'asc' | 'desc';

export const ExtractList = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [orderDirection, setOrderDirection] = React.useState<OrderDirection>('desc');

  const { response, isLoading, error } = useListExtract({
    perPage: 4,
    page: currentPage,
    orderDirection,
  });


  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "muted");

  const totalPages = response?.data?.pages || 1;

  const toggleOrder = () => setOrderDirection(prev => prev === 'asc' ? 'desc' : 'asc');

  const renderItem = ({ item }: { item: ListExtractItem }) => (
    <View style={[styles.itemContainer, { backgroundColor }]} key={item.id?.toString() || Math.random().toString()}>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: textColor }]}>
          {capitalizeEachWord(item.remetenteDestinatario ?? "")}
        </Text>
        <Text style={[styles.itemSubtitle, { color: textColor }]}>
          {item.data ? new Date(item.data).toLocaleDateString("pt-BR") : ""}
        </Text>
      </View>
      <View style={styles.itemValueContainer}>
        <Text style={[styles.itemValue, { color: textColor }]}>
          {item.valor >= 0 ? "+" : "-"}R${Math.abs(item.valor).toFixed(2).replace(".", ",")}
        </Text>
        <Feather
          name={item.valor >= 0 ? "arrow-down-left" : "arrow-up-right"}
          size={22}
          color={item.valor >= 0 ? "#22c55e" : "#E53935"}
          style={{ marginHorizontal: 2 }}
        />
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <UploadCsvButton />
        <TouchableOpacity
          onPress={toggleOrder}
          style={styles.orderIconButton}
          accessibilityLabel="Toggle order direction"
        >
          <MaterialIcons
            name={orderDirection === "asc" ? "south" : "north"}
            size={24}
            color={primaryColor}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.orderText, { color: textColor }]}>Ordem</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        <ScrollView style={styles.listContainer} contentContainerStyle={{ flexGrow: 1 }}>
          {isLoading ? (
            <ActivityIndicator color={primaryColor} size="large" style={styles.loader} />
          ) : error ? (
            <Text style={[styles.emptyText, { color: textColor }]}>Erro ao carregar dados.</Text>
          ) : response?.data?.data?.length ? (
            response.data.data.map((item, idx) => renderItem({ item }))
          ) : (
            <Text style={[styles.emptyText, { color: textColor }]}>Nenhum lançamento encontrado.</Text>
          )}
        </ScrollView>
      </View>
      <View style={styles.pagination}>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={[
            styles.pageIconButton,
            { opacity: currentPage === 1 ? 0.3 : 1 }
          ]}
          accessibilityLabel="Página anterior"
        >
          <MaterialIcons name="chevron-left" size={28} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[styles.pageIndicator, { color: textColor }]}>
          {currentPage} / {totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={[
            styles.pageIconButton,
            { opacity: currentPage === totalPages ? 0.3 : 1 }
          ]}
          accessibilityLabel="Próxima página"
        >
          <MaterialIcons name="chevron-right" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 0, // remove espaço extra
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  orderText: { fontWeight: "500", fontSize: 14 },
  listContainer: { flex: 1, minHeight: 400 }, // Fixed min height to prevent layout shifts
  loader: { marginTop: 32 },
  itemContainer: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemContent: { flex: 1 },
  itemTitle: { fontWeight: "600", fontSize: 16, marginBottom: 2 },
  itemSubtitle: { opacity: 0.5, fontSize: 13 },
  itemValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  itemValue: { fontWeight: "700", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  pageIconButton: {
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  pageIndicator: { fontWeight: "500", fontSize: 14, marginHorizontal: 10 },
  orderIconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
});