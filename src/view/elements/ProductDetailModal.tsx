import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Defaults from "../../config/index";

const { width: screenWidth } = Dimensions.get("window");

// ─── Helper Functions ─────────────────────────────────────────────────────────
const stripHtml = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const buildImageUrl = (imageName: string): string => {
  if (!imageName) return "";
  const cleaned = imageName.replace(/\\/g, "/").replace(/^\/+/, "");
  return cleaned.startsWith("http")
    ? cleaned
    : `${Defaults.apis.baseUrl}/api/v1/${cleaned}`;
};

// ─── Product Detail Modal ─────────────────────────────────────────────────────
interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  productDetail: any | null;
  loading: boolean;
  onAddToCart?: (product: any) => Promise<void>;
  cartIds?: Set<number>;
  navigation: any;
}

const ProductDetailModal = ({
  visible,
  onClose,
  productDetail,
  loading,
  onAddToCart,
  cartIds = new Set(),
  navigation,
}: ProductDetailModalProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (productDetail) {
      setSelectedVariantId(
        productDetail.ProductVariant?.length > 0
          ? productDetail.ProductVariant[0].Id
          : null
      );
      setActiveImageIndex(0);
    }
  }, [productDetail?.Id]);

  if (!visible) return null;

  const images: string[] = productDetail?.ProductImages?.map(
    (pi: any) => buildImageUrl(pi.Images.ImageName)
  ) ?? [];

  const selectedVariant = productDetail?.ProductVariant?.find(
    (v: any) => v.Id === selectedVariantId
  );

  const productName =
    productDetail?.ProductTranslations?.[0]?.Name ?? "Product";
  const description = stripHtml(
    productDetail?.ProductTranslations?.[0]?.Description ?? ""
  );
  const mrp = parseFloat(productDetail?.MRP ?? "0");

  // ── ProductType: "Single" | "Variant" ──────────────────────────────────────
  const productType: string = productDetail?.ProductType ?? "Single";
  const isVariantType = productType === "Variant";

  const variantPrice = selectedVariant ? parseFloat(selectedVariant.Price) : null;
  const displayPrice = variantPrice ?? mrp;

  const stock: number = isVariantType
    ? selectedVariant?.Stock
    : Math.floor(parseFloat(productDetail?.StockInHand ?? "0"));
console.log('stock',stock);

  const isInCart = productDetail ? cartIds.has(productDetail.Id) : false;

  // Cart payload includes variant details only when applicable
  const cartProduct = {
    id: productDetail?.Id,
    name: productName,
    // Use variant price as points if it's a variant, else the product points
    points: 
      isVariantType && selectedVariant 
        ? parseFloat(selectedVariant.Price) 
        : (productDetail?.Points ?? 0),
    images: images,
    quantity: 1,
    ...(isVariantType && selectedVariant
      ? {
          variantId: selectedVariant.Id,
          variantCode: selectedVariant.ProductVariantCode,
          variantPrice: parseFloat(selectedVariant.Price),
        }
      : {}),
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          {/* Drag handle */}
          <View style={modalStyles.handle} />

          {/* Close button */}
          <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
            <Text style={modalStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {loading ? (
            <View style={modalStyles.loaderBox}>
              <ActivityIndicator size="large" color="#612C7E" />
              <Text style={modalStyles.loaderText}>Loading details...</Text>
            </View>
          ) : !productDetail ? (
            <View style={modalStyles.loaderBox}>
              <Text style={modalStyles.loaderText}>Failed to load product.</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.scrollContent}
            >
              {/* ── Image Carousel ── */}
              {images.length > 0 ? (
                <View style={modalStyles.imageSection}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(
                        e.nativeEvent.contentOffset.x / screenWidth
                      );
                      setActiveImageIndex(idx);
                    }}
                  >
                    {images.map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={[modalStyles.productImage, { width: screenWidth }]}
                        resizeMode="contain"
                      />
                    ))}
                  </ScrollView>

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <View style={modalStyles.dotsRow}>
                      {images.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            modalStyles.dot,
                            idx === activeImageIndex && modalStyles.dotActive,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={modalStyles.noImageBox}>
                  <Text style={modalStyles.noImageText}>No Image</Text>
                </View>
              )}

              {/* ── Product Info ── */}
              <View style={modalStyles.infoSection}>
                <Text style={modalStyles.productTitle}>{productName}</Text>

             {/* Score / Price based on ProductType */}

  <View>
    <Text style={modalStyles.pricemodal}>
      {selectedVariant && parseFloat(selectedVariant.Price) > 0
        ? parseFloat(selectedVariant.Price).toFixed(0)
        : productDetail.Points}{' '}
      Scores
    </Text>
  </View>
             
                {/* ── Stock Badge ── */}
                <View style={modalStyles.stockRow}>
                  <View
                    style={[
                      modalStyles.stockDot,
                      { backgroundColor: stock > 0 ? "#16a34a" : "#dc2626" },
                    ]}
                  />
                  <Text
                    style={[
                      modalStyles.stockText,
                      { color: stock > 0 ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}
                  </Text>
                </View>

                {/* ── Variants — only shown when ProductType === "Variant" ── */}
                {isVariantType && productDetail.ProductVariant?.length > 0 && (
                  <View style={modalStyles.variantSection}>
                    <Text style={modalStyles.sectionLabel}>Select Variant</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={modalStyles.variantRow}>
                        {productDetail.ProductVariant.map((variant: any) => {
                          const isSelected = variant.Id === selectedVariantId;
                          const variantLabel = variant.ProductVariantCode;
                          const variantPriceVal = parseFloat(variant.Price);
                          const variantStock: number = variant.Stock ?? 0;
                          const isColorVariant =
                            /^(red|green|blue|yellow|black|white|pink|orange|purple|grey|gray|brown)$/i.test(
                              variantLabel
                            );
                          const isOutOfStock = variantStock === 0;

                          return (
                            <TouchableOpacity
                              key={variant.Id}
                              style={[
                                modalStyles.variantChip,
                                isSelected && modalStyles.variantChipSelected,
                                isOutOfStock && modalStyles.variantChipDisabled,
                              ]}
                              onPress={() =>
                                !isOutOfStock && setSelectedVariantId(variant.Id)
                              }
                              disabled={isOutOfStock}
                            >
                              {isColorVariant && (
                                <View
                                  style={[
                                    modalStyles.colorDot,
                                    { backgroundColor: variantLabel.toLowerCase() },
                                  ]}
                                />
                              )}
                              <Text
                                style={[
                                  modalStyles.variantChipText,
                                  isSelected && modalStyles.variantChipTextSelected,
                                  isOutOfStock && modalStyles.variantChipTextDisabled,
                                ]}
                              >
                                {variantLabel}
                              </Text>
                              <Text
                                style={[
                                  modalStyles.variantPrice,
                                  isSelected && modalStyles.variantPriceSelected,
                                ]}
                              >
                                {variantPriceVal.toFixed(0)} Scores
                              </Text>
                              {/* Per-variant stock indicator */}
                              <Text
                                style={[
                                  modalStyles.variantStockBadge,
                                  {
                                    color: variantStock > 0 ? "#16a34a" : "#dc2626",
                                    borderColor: variantStock > 0 ? "#16a34a" : "#dc2626",
                                  },
                                ]}
                              >
                                {variantStock > 0 ? `Qty: ${variantStock}` : "N/A"}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* ── Description ── */}
                {description ? (
                  <View style={modalStyles.descSection}>
                    <Text style={modalStyles.sectionLabel}>Description</Text>
                    <Text style={modalStyles.descText}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          )}

          {/* ── Bottom Actions ── */}
          {!loading && productDetail && stock > 0 && (
            <View style={modalStyles.actionBar}>
              {onAddToCart && (
                <TouchableOpacity
                  style={[
                    modalStyles.cartBtnModal,
                    isInCart && { backgroundColor: "#10b981" },
                  ]}
                  onPress={() => {
                    if (isInCart) {
                      onClose();
                      (navigation as any).navigate("Cart");
                    } else {
                      onAddToCart(cartProduct);
                    }
                  }}
                >
                  <Text style={modalStyles.cartBtnText}>
                    {isInCart ? "Go to Cart" : "Add to Cart"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 0,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    zIndex: 10,
    backgroundColor: "#f1f3f6",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { fontSize: 14, color: "#555", fontWeight: "700" },

  loaderBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loaderText: { fontSize: 14, color: "#888" },

  scrollContent: { paddingBottom: 20 },

  imageSection: { backgroundColor: "#f8f9fa" },
  productImage: { height: 260 },
  noImageBox: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f6",
  },
  noImageText: { color: "#aaa", fontSize: 16 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#d0d0d0",
  },
  dotActive: { backgroundColor: "#612C7E", width: 18 },

  infoSection: { paddingHorizontal: 16, paddingTop: 14 },

  productTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    lineHeight: 26,
  },

  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  price: { fontSize: 22, fontWeight: "800", color: "#612C7E" },
  mrp: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },

  pointsBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fef9c3",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  pointsText: { fontSize: 13, color: "#612C7E", fontWeight: "600" },

  stockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: "600" },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  variantSection: { marginBottom: 16 },
  variantRow: { flexDirection: "row", gap: 10 },
  variantChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
  },
  variantChipSelected: {
    borderColor: "#612C7E",
    backgroundColor: "#e8f0fe",
  },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: "#ccc" },
  variantChipText: { fontSize: 13, color: "#444", fontWeight: "500" },
  variantChipTextSelected: { color: "#612C7E", fontWeight: "700" },
  variantPrice: { fontSize: 12, color: "#888" },
  variantPriceSelected: { color: "#612C7E", fontWeight: "600" },

  attributeSection: { marginBottom: 16 },
  attributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attributeKey: { fontSize: 13, color: "#888", flex: 1 },
  attributeVal: { fontSize: 13, color: "#212121", fontWeight: "600", flex: 1, textAlign: "right" },

  descSection: { marginBottom: 16 },
  descText: { fontSize: 14, color: "#555", lineHeight: 22 },

  actionBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  cartBtn: {
    backgroundColor: "#612C7E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cartBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
   pricemodal: { fontSize: 22, fontWeight: "800", color: "#2874f0" },
     variantChipDisabled: {
    borderColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },
    variantChipTextDisabled: { color: "#aaa" },
      variantStockBadge: {
    fontSize: 10,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
    cartBtnModal: {
    backgroundColor: '#612C7E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
  },
});

export default ProductDetailModal;