import { ListExtractItem, useListExtract } from "@/hooks/useListExtract";
import { ThemedView } from "./ThemedView";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet, TextInput } from "react-native";
import { capitalizeEachWord } from "@/utils/formatters/capitalize-each-word";
import UploadCsvButton from "./UploadCsvButton";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";

type OrderDirection = 'asc' | 'desc';

export const ExtractList = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [orderDirection, setOrderDirection] = React.useState<OrderDirection>('desc');

  const [pageInput, setPageInput] = React.useState('1');
  const scrollViewRef = React.useRef<ScrollView>(null);

  const { response, isLoading, error } = useListExtract({
    perPage: 4,
    page: currentPage,
    orderDirection,
  });

  const totalPages = response?.data?.pages || 1;
  const totalResults = response?.data?.items || 0;

  const toggleOrder = () => setOrderDirection(prev => prev === 'asc' ? 'desc' : 'asc');

  // Smooth scroll to top on page change
  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const renderItem = ({ item }: { item: ListExtractItem }) => (
    <View style={styles.itemContainer} key={item.id?.toString() || Math.random().toString()}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>
          {capitalizeEachWord(item.remetenteDestinatario ?? "")}
        </Text>
        <Text style={styles.itemSubtitle}>
          {item.data ? new Date(item.data).toLocaleDateString("pt-BR") : ""}
        </Text>
      </View>
      <View style={styles.itemValueContainer}>
        <Text style={styles.itemValue}>
          R${Math.abs(item.valor).toFixed(2).replace(".", ",")}
        </Text>
        <Feather
          name={item.valor >= 0 ? "arrow-down-left" : "arrow-up-right"}
          size={22}
          color={item.valor >= 0 ? Colors.success : Colors.error}
          style={styles.valueIcon}
        />
      </View>
    </View>
  );

  // Skeleton loader for list items (fixed size)
  const SKELETON_COUNT = 4;
  const renderSkeleton = () =>
    Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <View style={[styles.itemContainer, styles.skeletonItem]} key={idx}>
        <View style={styles.itemContent}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
        <View style={styles.itemValueContainer}>
          <View style={styles.skeletonValue} />
          <View style={styles.skeletonIcon} />
        </View>
      </View>
    ));

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
            color={Colors[theme].tint}
            style={styles.orderIcon}
          />
          <Text style={styles.orderText}>Ordem</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.cardContainer, isLoading && styles.fixedListHeight]}>
        <View style={styles.pagination}>
        <View style={styles.paginationIcon}>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1 || isLoading}
          style={[
            styles.pageIconButton,
            (currentPage === 1 || isLoading) && styles.disabledButton
          ]}
          accessibilityLabel="Página anterior"
        >
          <MaterialIcons name="chevron-left" size={32} color={Colors[theme].text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || isLoading}
          style={[
            styles.pageIconButton,
            (currentPage === totalPages || isLoading) && styles.disabledButton
          ]}
          accessibilityLabel="Próxima página"
        >

        <MaterialIcons name="chevron-right" size={32} color={Colors[theme].text} />
        </TouchableOpacity>
        </View>
        {typeof totalResults === 'number' && totalResults > 0 && (
          <Text style={styles.totalResultsText}>
            {totalResults} resultados
          </Text>
        )}
      </View>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {isLoading
            ? renderSkeleton()
            : error
            ? <Text style={styles.emptyText}>Erro ao carregar dados.</Text>
            : response?.data?.data?.length
              ? response.data.data.map((item, idx) => renderItem({ item }))
              : <Text style={styles.emptyText}>Nenhum lançamento encontrado.</Text>
          }
        </ScrollView>
      </View>

    </ThemedView>
  );
};

const createStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      backgroundColor: Colors[theme].card || '#fff',
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 8,
      paddingHorizontal: 12,
      paddingBottom: 8,
      // Remove marginTop so card starts at the top of its flex space
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      // Elevation for Android
      elevation: 10,
      overflow: 'hidden',
    },
    scrollView: {
      flex: 1,
    },
  container: { flex: 1, backgroundColor: Colors[theme].background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      gap: 0,
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
    orderText: {
      fontWeight: "500",
      fontSize: 14,
      color: Colors[theme].text,
    },
  listContainer: { flex: 1 },
    fixedListHeight: {},
    scrollContent: { flexGrow: 1 },
    loader: { marginTop: 32 },
    itemContainer: {
      marginBottom: 12,
      borderRadius: 16,
      padding: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: Colors[theme].muted,
    },
    itemContent: { flex: 1 },
    itemTitle: {
      fontWeight: "600",
      fontSize: 16,
      marginBottom: 2,
      color: Colors[theme].text,
    },
    itemSubtitle: {
      opacity: 0.5,
      fontSize: 13,
      color: Colors[theme].text,
    },
    itemValueContainer: {
      flexDirection: "row",
    },
    itemValue: {
      fontWeight: "700",
      alignItems: "flex-start",
      fontSize: 16,
      color: Colors[theme].text,
    },
    valueIcon: { marginHorizontal: 2 },
    emptyText: {
      textAlign: "center",
      marginTop: 32,
      opacity: 0.7,
      color: Colors[theme].text,
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 8,
      flexWrap: "wrap",
    },
    paginationIcon: { flexDirection: "row", alignItems: "center" },
    pageIconButton: {
      borderRadius: 32,
      marginHorizontal: 3,
      backgroundColor: Colors[theme].muted,
    },
    disabledButton: {
      opacity: 0.3,
    },
    pageIndicator: {
      fontWeight: "500",
      fontSize: 14,
      marginHorizontal: 10,
      color: Colors[theme].text,
    },
    pageJumpContainer: {
      marginLeft: 10,
      marginRight: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[theme].tint,
      backgroundColor: Colors[theme].background,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      width: 48,
    },
    pageJumpInput: {
      width: 40,
      height: 28,
      textAlign: "center",
      color: Colors[theme].text,
      fontSize: 14,
      padding: 0,
      backgroundColor: 'transparent',
    },
    totalResultsText: {
      marginLeft: 10,
      color: Colors[theme].text,
      opacity: 0.6,
      fontSize: 14,
    },
    // Skeleton styles
    skeletonItem: {
      backgroundColor: Colors[theme].muted,
      opacity: 0.7,
      overflow: 'hidden',
    },
// In your Colors.ts, add a lighter card color for both themes:
// card: '#fff' (light), card: '#23272e' (dark) or similar
    skeletonTitle: {
      width: '60%',
      height: 18,
      borderRadius: 6,
      backgroundColor: Colors[theme].background,
      marginBottom: 8,
    },
    skeletonSubtitle: {
      width: '40%',
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors[theme].background,
    },
    skeletonValue: {
      width: 48,
      height: 18,
      borderRadius: 6,
      backgroundColor: Colors[theme].background,
      marginRight: 8,
    },
    skeletonIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: Colors[theme].background,
    },
    orderIconButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      paddingVertical: 6,
      paddingHorizontal: 14,
    },
    orderIcon: { marginRight: 4 },
  });

// Adicione no seu Colors.ts:
/// export const Colors = {
///   ...,
///   success: "#22c55e",
///   error: "#E53935",
///   ...
/// }