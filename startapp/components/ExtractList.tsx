import { ListExtractItem, useListExtract } from "@/hooks/useListExtract";
import { ThemedView } from "./ThemedView";
import React from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SwipeAction } from './SwipeAction';
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

  // scrollViewRef removed: not needed with FlatList

  const { response, isLoading, error } = useListExtract({
    perPage: 4,
    page: currentPage,
    orderDirection,
  });

  const totalPages = response?.data?.pages || 1;
  const totalResults = response?.data?.items || 0;

  const toggleOrder = () => setOrderDirection(prev => prev === 'asc' ? 'desc' : 'asc');


  // Callbacks for swipe actions
  const handleDelete = (item: ListExtractItem) => {
    // TODO: Implement delete logic (e.g., show confirm, call API, refresh list)
    alert(`Excluir lançamento: ${item.remetenteDestinatario || item.id}`);
  };
  const handleEdit = (item: ListExtractItem) => {
    // TODO: Implement edit logic (e.g., open modal, navigate to edit screen)
    alert(`Editar lançamento: ${item.remetenteDestinatario || item.id}`);
  };

  const renderLeftActions = (item: ListExtractItem) => (
    <SwipeAction type="edit" onPress={() => handleEdit(item)} />
  );
  const renderRightActions = (item: ListExtractItem) => (
    <SwipeAction type="delete" onPress={() => handleDelete(item)} />
  );

  const renderItem = ({ item }: { item: ListExtractItem }) => (
    <Swipeable
      renderLeftActions={() => renderLeftActions(item)}
      renderRightActions={() => renderRightActions(item)}
      overshootLeft={false}
      containerStyle={styles.swipeableContainer}
      overshootRight={false}
    >
      <View style={styles.modernItemContainer}>
        <View style={styles.modernItemLeft}>
          <Text style={styles.modernItemTitle} numberOfLines={1}>
            {capitalizeEachWord(item.remetenteDestinatario ?? "")}
          </Text>
          <Text style={styles.modernItemSubtitle} numberOfLines={1}>
            {item.data ? new Date(item.data).toLocaleDateString("pt-BR") : ""}
          </Text>
        </View>
        <View style={styles.modernItemRight}>
          <Text style={styles.modernItemValue} numberOfLines={1}>
            R${Math.abs(item.valor).toFixed(2).replace(".", ",")}
          </Text>
          <View style={styles.modernArrowCircle}>
            <Feather
              name={item.valor >= 0 ? "arrow-down-left" : "arrow-up-right"}
              size={18}
              color={item.valor >= 0 ? Colors.success : Colors.error}
            />
          </View>
        </View>
      </View>
    </Swipeable>
  );

  // Skeleton loader for list items (fixed size)
  const SKELETON_COUNT = 4;
  const renderSkeleton = () =>
    Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
      <View style={[styles.modernItemContainer, styles.skeletonItem]} key={idx}>
        <View style={styles.modernItemLeft}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
        <View style={styles.modernItemRight}>
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
        {isLoading ? (
          renderSkeleton()
        ) : error ? (
          <Text style={styles.emptyText}>Erro ao carregar dados.</Text>
        ) : response?.data?.data?.length ? (
          <FlatList
            data={response.data.data}
            renderItem={renderItem}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhum lançamento encontrado.</Text>
        )}
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
  swipeableContainer: {
    marginBottom: 14,
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
    // Modern item styles
    modernItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors[theme].card,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 20,
    },
    modernItemLeft: {
      flex: 1,
      minWidth: 0,
    },
    modernItemTitle: {
      fontWeight: '600',
      fontSize: 16,
      color: Colors[theme].text,
      marginBottom: 2,
      letterSpacing: 0.1,
    },
    modernItemSubtitle: {
      fontSize: 13,
      color: Colors[theme].text,
      opacity: 0.5,
      letterSpacing: 0.2,
    },
    modernItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
      gap: 8,
    },
    modernItemValue: {
      fontWeight: '700',
      fontSize: 16,
      color: Colors[theme].text,
      marginRight: 8,
      minWidth: 80,
      textAlign: 'right',
    },
    modernArrowCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors[theme].background,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
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