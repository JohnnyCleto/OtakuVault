import { Image, Pressable, StyleSheet, Text } from "react-native";
import { openTitulo } from "../navigation";
import { nomeExibicao, Titulo } from "../services/anilist";
import { colors } from "../theme";

// Card horizontal (banner + título). Usado em "Em alta" e "Novos episódios".
export default function WideCard({
  titulo,
  subtitle,
  width = 280,
}: {
  titulo: Titulo;
  subtitle?: string;
  width?: number;
}) {
  return (
    <Pressable
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.7 }]}
      onPress={() => openTitulo(titulo.id)}
    >
      <Image
        source={{ uri: titulo.banner || titulo.coverLarge }}
        style={{
          width,
          height: width * 0.56,
          borderRadius: 10,
          backgroundColor: colors.surface,
        }}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={1}>
        {nomeExibicao(titulo)}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
