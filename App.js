import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#080B0A',
  surface: '#111715',
  surfaceLight: '#19221E',
  text: '#F4F7F5',
  muted: '#9AA8A0',
  green: '#1ED760',
  border: '#26332C',
};

function SectionTitle({ children, action }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>SEU SOM, DO SEU JEITO</Text>
          <Text style={styles.brand}>Nova<Text style={styles.brandAccent}>Stream</Text></Text>
        </View>
        <Pressable style={styles.avatar} accessibilityLabel="Perfil">
          <Ionicons name="person-outline" size={21} color={COLORS.text} />
        </Pressable>
      </View>

      <LinearGradient
        colors={['#174B32', '#10251B', '#111715']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>NOVA EXPERIÊNCIA</Text>
        <Text style={styles.heroTitle}>Sua próxima música favorita começa aqui.</Text>
        <Text style={styles.heroText}>Explore, organize e curta sua biblioteca.</Text>
        <View style={styles.heroIcon}>
          <Ionicons name="play" size={22} color="#07110B" />
        </View>
      </LinearGradient>

      <SectionTitle action="Ver tudo">Ouça novamente</SectionTitle>
      <View style={styles.emptyCard}>
        <Ionicons name="headset-outline" size={27} color={COLORS.green} />
        <View style={styles.emptyTextWrap}>
          <Text style={styles.cardTitle}>Sua jornada começa agora</Text>
          <Text style={styles.cardDescription}>Quando você ouvir músicas, elas aparecerão aqui.</Text>
        </View>
      </View>

      <SectionTitle>Feito para você</SectionTitle>
      <View style={styles.featureRow}>
        <FeatureCard icon="cloud-download-outline" title="Offline" subtitle="Suas músicas disponíveis" />
        <FeatureCard icon="heart-outline" title="Favoritas" subtitle="Tudo que você ama" />
      </View>
      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

function FeatureCard({ icon, title, subtitle }) {
  return (
    <View style={styles.featureCard}>
      <Ionicons name={icon} size={23} color={COLORS.green} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{subtitle}</Text>
    </View>
  );
}

function SearchScreen() {
  return (
    <View style={[styles.screen, styles.centerScreen]}>
      <Ionicons name="search" size={42} color={COLORS.green} />
      <Text style={styles.pageTitle}>Buscar</Text>
      <Text style={styles.pageDescription}>Encontre músicas, artistas e álbuns.</Text>
      <View style={styles.searchPlaceholder}>
        <Ionicons name="search-outline" size={19} color={COLORS.muted} />
        <Text style={styles.searchPlaceholderText}>O que você quer ouvir?</Text>
      </View>
    </View>
  );
}

function LibraryScreen() {
  return (
    <View style={[styles.screen, styles.centerScreen]}>
      <Ionicons name="library-outline" size={42} color={COLORS.green} />
      <Text style={styles.pageTitle}>Sua biblioteca</Text>
      <Text style={styles.pageDescription}>Playlists, álbuns baixados e músicas favoritas ficarão aqui.</Text>
    </View>
  );
}

function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 3 },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={75} style={StyleSheet.absoluteFill} />
        ),
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Início: focused ? 'home' : 'home-outline',
            Buscar: focused ? 'search' : 'search-outline',
            Biblioteca: focused ? 'library' : 'library-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="Biblioteca" component={LibraryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: COLORS.background,
          card: COLORS.background,
          text: COLORS.text,
          border: COLORS.border,
          primary: COLORS.green,
        },
      }}
    >
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  eyebrow: { color: COLORS.muted, fontSize: 9, letterSpacing: 2, fontWeight: '700', marginBottom: 5 },
  brand: { color: COLORS.text, fontSize: 27, fontWeight: '800', letterSpacing: -1 },
  brandAccent: { color: COLORS.green },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  hero: { minHeight: 190, borderRadius: 22, padding: 21, justifyContent: 'center', marginBottom: 30, overflow: 'hidden' },
  heroLabel: { color: '#A9E7BF', fontSize: 10, letterSpacing: 2, fontWeight: '800', marginBottom: 10 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30, maxWidth: '88%' },
  heroText: { color: '#C5D9CC', fontSize: 12, marginTop: 9 },
  heroIcon: { position: 'absolute', right: 20, bottom: 20, width: 43, height: 43, borderRadius: 22, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800', marginBottom: 14 },
  sectionAction: { color: COLORS.green, fontSize: 12, fontWeight: '700', marginBottom: 14 },
  emptyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: 17, marginBottom: 29, borderWidth: 1, borderColor: COLORS.border, gap: 14 },
  emptyTextWrap: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  cardDescription: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  featureRow: { flexDirection: 'row', gap: 12 },
  featureCard: { flex: 1, minHeight: 125, backgroundColor: COLORS.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: COLORS.border },
  centerScreen: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  pageTitle: { color: COLORS.text, fontSize: 25, fontWeight: '800', marginTop: 15 },
  pageDescription: { color: COLORS.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 8, maxWidth: 290 },
  searchPlaceholder: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 12, padding: 15, width: '100%', marginTop: 25, borderWidth: 1, borderColor: COLORS.border },
  searchPlaceholderText: { color: COLORS.muted, fontSize: 13 },
  tabBar: { position: 'absolute', height: 67, paddingTop: 7, paddingBottom: 7, backgroundColor: 'rgba(8,11,10,0.78)', borderTopColor: COLORS.border, borderTopWidth: 1, elevation: 0 },
});