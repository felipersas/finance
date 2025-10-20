import { Colors } from "@/constants/Colors";
import { useUpdateTipoExtract } from "@/hooks/mutations/useUpdateTipoExtract";
import { ListExtractItem, useListExtract } from "@/hooks/useListExtract";
import { useTheme } from "@/hooks/useTheme";
import { capitalizeEachWord } from "@/utils/formatters/capitalize-each-word";
import { formatMoneyView } from "@/utils/formatters/format-money";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SwipeAction } from "./SwipeAction";
import { ThemedView } from "../common/ThemedView";
import { UploadCsvButton } from "./UploadCsvButton";

type OrderDirection = "asc" | "desc";

export const ExtractList = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [orderDirection, setOrderDirection] =
    React.useState<OrderDirection>("desc");
  const { response, isLoading, error, isFetching } = useListExtract({
    perPage: 5,
    page: currentPage,
    orderDirection,
  });
  const updateTipoMutation = useUpdateTipoExtract();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<"Pessoal" | "Empresa">(
    "Pessoal",
  );
  const totalPages = response?.data?.pages || 1;
  const totalResults = response?.data?.items || 0;
  const toggleOrder = () =>
    setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"));

  const handleDelete = (item: ListExtractItem) => {
    alert(`Excluir lançamento: ${item.remetenteDestinatario || item.id}`);
  };
  const handleEdit = (item: ListExtractItem) => {
    alert(`Editar lançamento: ${item.remetenteDestinatario || item.id}`);
  };

  const renderLeftActions = (item: ListExtractItem) => (
    <SwipeAction type="edit" onPress={() => handleEdit(item)} />
  );
  const renderRightActions = (item: ListExtractItem) => (
    <SwipeAction type="delete" onPress={() => handleDelete(item)} />
  );

  const handleOpenTipoModal = (id: string) => {
    const item = response?.data?.data?.find((i) => i.id === id);
    if (item) {
      setSelectedId(id);
      setSelectedTipo(item.tipo);
      setModalVisible(true);
    }
  };

  const handleChangeTipo = async (tipo: "Pessoal" | "Empresa") => {
    if (!selectedId) return;
    await updateTipoMutation.mutateAsync(
      { id: selectedId, tipo },
      {
        onSuccess: () => setModalVisible(false),
        onSettled: () => setSelectedTipo(tipo),
      },
    );
  };

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
            {capitalizeEachWord(item.remetenteDestinatario ?? item.descricao)}
          </Text>
          <Text style={styles.modernItemSubtitle} numberOfLines={1}>
            {item.data ? new Date(item.data).toLocaleDateString("pt-BR") : ""}
          </Text>
        </View>
        <View style={styles.modernItemRight}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text style={styles.modernItemValue} numberOfLines={1}>
              {formatMoneyView(Math.abs(item.valor).toString())}
            </Text>
            <View style={styles.modernArrowCircle}>
              <Feather
                name={item.valor >= 0 ? "arrow-down-left" : "arrow-up-right"}
                size={18}
                color={item.valor >= 0 ? Colors.success : Colors.error}
              />
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleOpenTipoModal(item.id)}
            style={[
              styles.categoryBadge,
              item.tipo === "Empresa"
                ? styles.categoryEmpresa
                : styles.categoryPessoal,
              { alignSelf: "flex-end", marginTop: 8 },
            ]}
            accessibilityLabel={
              item.tipo === "Empresa"
                ? "Categoria empresa"
                : "Categoria pessoal"
            }
          >
            <Text
              style={[
                styles.categoryBadgeText,
                item.tipo === "Empresa"
                  ? styles.categoryEmpresaText
                  : styles.categoryPessoalText,
              ]}
            >
              {item.tipo === "Empresa" ? "EMP" : "PES"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );

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
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              style={[
                styles.pageIconButton,
                (currentPage === 1 || isLoading) && styles.disabledButton,
              ]}
              accessibilityLabel="Página anterior"
            >
              <MaterialIcons
                name="chevron-left"
                size={32}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              style={[
                styles.pageIconButton,
                (currentPage === totalPages || isLoading) &&
                  styles.disabledButton,
              ]}
              accessibilityLabel="Próxima página"
            >
              <MaterialIcons
                name="chevron-right"
                size={32}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
          </View>
          {typeof totalResults === "number" && totalResults > 0 && (
            <Text style={styles.totalResultsText}>
              {totalResults} resultados
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {isLoading || isFetching ? (
            renderSkeleton()
          ) : error ? (
            <Text style={styles.emptyText}>Erro ao carregar dados.</Text>
          ) : response?.data?.data?.length ? (
            <FlatList
              data={response.data.data}
              renderItem={renderItem}
              keyExtractor={(item) =>
                item.id?.toString() || Math.random().toString()
              }
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollView}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhum lançamento encontrado.</Text>
          )}
        </View>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Alterar tipo da transação</Text>
            <TouchableOpacity
              style={[
                styles.tipoButton,
                selectedTipo === "Pessoal"
                  ? styles.tipoButtonPessoal
                  : styles.tipoButtonDefault,
              ]}
              onPress={() => handleChangeTipo("Pessoal")}
            >
              <Text style={styles.tipoTextPessoal}>Pessoal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tipoButton,
                selectedTipo === "Empresa"
                  ? styles.tipoButtonEmpresa
                  : styles.tipoButtonDefault,
              ]}
              onPress={() => handleChangeTipo("Empresa")}
            >
              <Text style={styles.tipoTextEmpresa}>Empresa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const createStyles = (theme: "light" | "dark") =>
  StyleSheet.create({
    categoryBadge: {
      minWidth: 38,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      backgroundColor: "transparent",
      marginLeft: 0,
    },
    categoryEmpresa: {
      borderColor: Colors[theme].tint,
    },
    categoryPessoal: {
      borderColor: Colors.success,
    },
    categoryBadgeText: {
      fontWeight: "bold",
      fontSize: 11,
      letterSpacing: 0.5,
    },
    categoryEmpresaText: {
      color: Colors[theme].tint,
    },
    categoryPessoalText: {
      color: Colors.success,
    },
    cardContainer: {
      flex: 1,
      backgroundColor: Colors[theme].card || "#fff",
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 8,
      paddingHorizontal: 12,

      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,

      elevation: 10,
      overflow: "hidden",
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

    modernItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      fontWeight: "600",
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
      flexDirection: "column",
      alignItems: "center",
      marginLeft: 16,
      gap: 8,
    },
    modernItemValue: {
      fontWeight: "700",
      fontSize: 16,
      color: Colors[theme].text,
      marginRight: 8,
      minWidth: 80,
      textAlign: "right",
    },
    modernArrowCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors[theme].background,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
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
      backgroundColor: "transparent",
    },
    totalResultsText: {
      marginLeft: 10,
      color: Colors[theme].text,
      opacity: 0.6,
      fontSize: 14,
    },

    skeletonItem: {
      backgroundColor: Colors[theme].muted,
      opacity: 0.7,
      overflow: "hidden",
    },

    skeletonTitle: {
      width: "60%",
      height: 18,
      borderRadius: 6,
      backgroundColor: Colors[theme].background,
      marginBottom: 8,
    },
    skeletonSubtitle: {
      width: "40%",
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
    modalOverlay: {
      flex: 1,
      backgroundColor: theme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: Colors[theme].card,
      borderRadius: 16,
      padding: 24,
      minWidth: 260,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    modalTitle: {
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 16,
      color: Colors[theme].text,
    },
    tipoButton: {
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      width: 180,
      alignItems: "center",
    },
    tipoButtonPessoal: {
      borderWidth: 2,
      borderColor: Colors.success,
      backgroundColor: Colors.success + "22",
    },
    tipoButtonEmpresa: {
      borderWidth: 2,
      borderColor: Colors[theme].tint,
      backgroundColor: Colors[theme].tint + "22",
    },
    tipoButtonDefault: {
      borderWidth: 1,
      borderColor: "#ccc",
      backgroundColor: Colors[theme].background,
    },
    tipoTextPessoal: {
      color: Colors.success,
      fontWeight: "bold",
      fontSize: 15,
    },
    tipoTextEmpresa: {
      color: Colors[theme].tint,
      fontWeight: "bold",
      fontSize: 15,
    },
    cancelButton: {
      marginTop: 16,
    },
    cancelText: {
      color: Colors[theme].text,
      opacity: 0.6,
      fontSize: 15,
    },
  });
