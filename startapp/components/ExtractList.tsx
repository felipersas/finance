import { ListExtractItem, useListExtract } from "@/hooks/useListExtract";
import { ThemedView } from "./ThemedView";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { capitalizeEachWord } from "@/utils/formatters/capitalize-each-word";

type OrderDirection = 'asc' | 'desc';

export const ExtractList = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [orderDirection, setOrderDirection] = React.useState<OrderDirection>('desc');

  const { response, isLoading, error } = useListExtract({
    perPage: 4,
    page: currentPage,
    orderDirection,
  });

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  const totalPages = response?.data?.pages || 1;

  const toggleOrder = () => setOrderDirection(prev => prev === 'asc' ? 'desc' : 'asc');

  const renderItem = ({ item }: { item: ListExtractItem }) => (
    <View style={styles.itemContainer} key={item.id?.toString() || Math.random().toString()}>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: textColor }]}>
          {capitalizeEachWord(item.remetenteDestinatario ?? "")}
        </Text>
        <Text style={[styles.itemSubtitle, { color: textColor }]}>
          {item.data ? new Date(item.data).toLocaleDateString("pt-BR") : ""}
        </Text>
      </View>
      <Text style={[styles.itemValue, { color: item.valor >= 0 ? primaryColor : "#E53935" }]}>
        {item.valor >= 0 ? "+" : "-"}R${Math.abs(item.valor).toFixed(2).replace(".", ",")}
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleOrder} style={styles.orderButton} accessibilityLabel="Toggle order direction">
          <Text style={[styles.orderText, { color: primaryColor }]}>
            {orderDirection === "asc" ? "↑" : "↓"} Ordem
          </Text>
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
          style={[styles.pageButton, { backgroundColor: primaryColor, opacity: currentPage === 1 ? 0.3 : 1 }]}
          accessibilityLabel="Previous page"
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={[styles.pageIndicator, { color: textColor }]}>
          {currentPage} / {totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={[styles.pageButton, { backgroundColor: primaryColor, opacity: currentPage === totalPages ? 0.3 : 1 }]}
          accessibilityLabel="Next page"
        >
          <Text style={styles.pageButtonText}>Próxima</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 },
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
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemContent: { flex: 1 },
  itemTitle: { fontWeight: "600", fontSize: 16, marginBottom: 2 },
  itemSubtitle: { opacity: 0.5, fontSize: 13 },
  itemValue: { fontWeight: "700", fontSize: 16, marginLeft: 12 },
  emptyText: { textAlign: "center", marginTop: 32, opacity: 0.7 },
  pagination: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 18 },
  pageButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18, marginHorizontal: 6 },
  pageButtonText: { color: "#fff", fontWeight: "500" },
  pageIndicator: { fontWeight: "500", fontSize: 14, marginHorizontal: 10 },
});