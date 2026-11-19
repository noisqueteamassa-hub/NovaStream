import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { searchAllSources } from './src/services/externalSourcesService';
import { isCatalogConfigured } from './src/services/catalogService';
import { getFavorites, toggleFavorite } from './src/services/favoritesService';

const Tab = createBottomTabNavigator();
const COLORS = {
  background: '#080B0A', surface: '#111715', surfaceLight: '#19221E',
  text: '#F4F7F5', muted: '#9AA8A0', green: '#1ED760', border: '#26332C',
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
        <View style={styles.avatar}><Ionicons name="person-outline" size={21} color={COLORS.text} /></View>
      </View>
      <LinearGradient colors={['#174B32', '#10251B', '#111715']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
        <Text style={styles.heroLabel}>NOVA EXPERIÊNCIA</Text>
        <Text style={styles.heroTitle}>Sua próxima música favorita começa aqui.</Text>
        <Text style={styles.heroText}>Explore, organize e curta sua biblioteca.</Text>
        <View style={styles.heroIcon}><Ionicons name="musical-notes" size={22} color="#07110B" /></View>
      </LinearGradient>
      <SectionTitle>O NovaStream oferece</SectionTitle>
      <View style={styles.featureRow}>
        <FeatureCard icon="cloud-outline" title="Streaming" subtitle="Reprodução online" />
        <FeatureCard icon="cloud-download-outline" title="Offline" subtitle="Downloads protegidos em desenvolvimento" />
      </View>
      <View style={styles.featureRow}>
        <FeatureCard icon="heart-outline" title="Favoritas" subtitle="Sua coleção pessoal" />
        <FeatureCard icon="ban-outline" title="Sem anúncios" subtitle="Tudo gratuito" />
      </View>
      <View style={styles.infoPanel}>
        <Text style={styles.cardTitle}>Catálogo e fontes</Text>
        <Text style={styles.cardDescription}>O catálogo próprio será conectado pela API oficial do NovaStream. Fontes externas só serão adicionadas quando autorizarem busca e reprodução.</Text>
        <Text style={styles.statusText}>{isCatalogConfigured() ? 'Catálogo configurado' : 'Catálogo aguardando configuração do servidor'}</Text>
      </View>
      <View style={{height:100}} />
    </ScrollView>
  );
}

function FeatureCard({ icon, title, subtitle }) {
  return <View style={styles.featureCard}>
    <Ionicons name={icon} size={23} color={COLORS.green} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{subtitle}</Text>
  </View>;
}

function TrackRow({ track, onFavorite, favorite }) {
  return <View style={styles.trackRow}>
    <View style={styles.cover}><Ionicons name="musical-note" size={21} color={COLORS.green}/></View>
    <View style={styles.trackText}>
      <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
      <Text numberOfLines={1} style={styles.cardDescription}>{track.artist}{track.album ? ' • '+track.album : ''}</Text>
      <Text style={styles.sourceLabel}>{track.source || 'Catálogo'}{track.downloadable ? ' • Offline autorizado' : ''}</Text>
    </View>
    <Pressable onPress={onFavorite} accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} style={styles.iconButton}>
      <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={21} color={favorite ? COLORS.green : COLORS.muted}/>
    </Pressable>
  </View>;
}

function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [favorites, setFavorites] = useState([]);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const items = await searchAllSources(query.trim());
      setResults(items);
      if (!items.length) Alert.alert('Nenhum resultado', isCatalogConfigured()
        ? 'Não encontramos resultados nas fontes conectadas.'
        : 'O servidor do catálogo ainda não foi configurado. A busca ficará disponível quando a API for conectada.');
    } catch (error) {
      Alert.alert('Erro na busca', error.message || 'Não foi possível pesquisar agora.');
    } finally { setLoading(false); }
  }

  async function favorite(track) {
    try { setFavorites(await toggleFavorite(track)); }
    catch { Alert.alert('Erro', 'Não foi possível atualizar os favoritos.'); }
  }

  return <View style={styles.screen}>
    <View style={styles.searchHeader}>
      <Text style={styles.pageTitle}>Buscar</Text>
      <Text style={styles.pageDescription}>Músicas, artistas e álbuns do catálogo autorizado.</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={COLORS.muted}/>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={runSearch}
          placeholder="O que você quer ouvir?" placeholderTextColor={COLORS.muted}
          returnKeyType="search" style={styles.searchInput}/>
        {query.length > 0 ? <Pressable onPress={()=>{setQuery('');setResults([]);setSearched(false);}}><Ionicons name="close-circle" size={19} color={COLORS.muted}/></Pressable> : null}
      </View>
      <Pressable style={styles.searchButton} onPress={runSearch} disabled={loading}>
        {loading ? <ActivityIndicator color="#07110B"/> : <Text style={styles.searchButtonText}>Pesquisar</Text>}
      </Pressable>
    </View>
    <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:110}}>
      {results.map((track)=> <TrackRow key={track.id+'-'+track.source} track={track}
        favorite={favorites.some((item)=>item.id===track.id)} onFavorite={()=>favorite(track)}/>)}
      {searched && !loading && results.length===0 ? <Text style={styles.emptyMessage}>Nenhuma música encontrada.</Text> : null}
    </ScrollView>
  </View>;
}

function LibraryScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);
  React.useEffect(() => { getFavorites().then(setFavorites).finally(()=>setLoaded(true)); }, []);
  return <View style={styles.screen}>
    <View style={styles.searchHeader}>
      <Text style={styles.pageTitle}>Sua biblioteca</Text>
      <Text style={styles.pageDescription}>Favoritas e suas coleções ficam reunidas aqui.</Text>
    </View>
    <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:100}}>
      <SectionTitle>Suas músicas favoritas</SectionTitle>
      {!loaded ? <ActivityIndicator color={COLORS.green}/> : favorites.length
        ? favorites.map((track)=><TrackRow key={track.id} track={track} favorite onFavorite={async()=>setFavorites(await toggleFavorite(track))}/>)
        : <View style={styles.emptyCard}><Ionicons name="heart-outline" size={26} color={COLORS.green}/><Text style={styles.cardDescription}>Você ainda não adicionou músicas aos favoritos. Pesquise e toque no coração para guardar.</Text></View>}
    </ScrollView>
  </View>;
}

function AppNavigator() {
  return <Tab.Navigator screenOptions={({route})=>({
    headerShown:false, tabBarActiveTintColor:COLORS.green, tabBarInactiveTintColor:COLORS.muted,
    tabBarLabelStyle:{fontSize:11,fontWeight:'600',marginBottom:3}, tabBarStyle:styles.tabBar,
    tabBarBackground:()=> <BlurView tint="dark" intensity={75} style={StyleSheet.absoluteFill}/>,
    tabBarIcon:({color,size,focused})=>{
      const icons={Início:focused?'home':'home-outline',Buscar:focused?'search':'search-outline',Biblioteca:focused?'library':'library-outline'};
      return <Ionicons name={icons[route.name]} size={size} color={color}/>;
    },
  })}>
    <Tab.Screen name="Início" component={HomeScreen}/>
    <Tab.Screen name="Buscar" component={SearchScreen}/>
    <Tab.Screen name="Biblioteca" component={LibraryScreen}/>
  </Tab.Navigator>;
}

export default function App() {
  return <NavigationContainer theme={{...DarkTheme,colors:{...DarkTheme.colors,background:COLORS.background,card:COLORS.background,text:COLORS.text,border:COLORS.border,primary:COLORS.green}}}>
    <StatusBar style="light" backgroundColor={COLORS.background}/>
    <AppNavigator/>
  </NavigationContainer>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.background}, content:{paddingHorizontal:20,paddingTop:22},
  topBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:25},
  eyebrow:{color:COLORS.muted,fontSize:9,letterSpacing:2,fontWeight:'700',marginBottom:5},
  brand:{color:COLORS.text,fontSize:27,fontWeight:'800',letterSpacing:-1},brandAccent:{color:COLORS.green},
  avatar:{width:42,height:42,borderRadius:21,backgroundColor:COLORS.surfaceLight,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:COLORS.border},
  hero:{minHeight:190,borderRadius:22,padding:21,justifyContent:'center',marginBottom:30,overflow:'hidden'},
  heroLabel:{color:'#A9E7BF',fontSize:10,letterSpacing:2,fontWeight:'800',marginBottom:10},
  heroTitle:{color:'#FFF',fontSize:24,fontWeight:'800',lineHeight:30,maxWidth:'88%'},
  heroText:{color:'#C5D9CC',fontSize:12,marginTop:9},
  heroIcon:{position:'absolute',right:20,bottom:20,width:43,height:43,borderRadius:22,backgroundColor:COLORS.green,alignItems:'center',justifyContent:'center'},
  sectionHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
  sectionTitle:{color:COLORS.text,fontSize:19,fontWeight:'800',marginBottom:14},
  sectionAction:{color:COLORS.green,fontSize:12,fontWeight:'700',marginBottom:14},
  featureRow:{flexDirection:'row',gap:12,marginBottom:12},
  featureCard:{flex:1,minHeight:125,backgroundColor:COLORS.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:COLORS.border},
  cardTitle:{color:COLORS.text,fontSize:14,fontWeight:'700',marginTop:8},
  cardDescription:{color:COLORS.muted,fontSize:11,lineHeight:16,marginTop:4},
  infoPanel:{backgroundColor:COLORS.surface,borderRadius:16,padding:16,borderWidth:1,borderColor:COLORS.border,marginTop:14},
  statusText:{color:COLORS.green,fontSize:11,marginTop:10,fontWeight:'700'},
  pageTitle:{color:COLORS.text,fontSize:25,fontWeight:'800'},
  pageDescription:{color:COLORS.muted,fontSize:13,lineHeight:20,marginTop:7},
  searchHeader:{paddingHorizontal:20,paddingTop:24,paddingBottom:18},
  searchBox:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,borderRadius:13,paddingHorizontal:14,height:50,marginTop:20,borderWidth:1,borderColor:COLORS.border},
  searchInput:{flex:1,color:COLORS.text,fontSize:14},
  searchButton:{backgroundColor:COLORS.green,borderRadius:12,alignItems:'center',justifyContent:'center',height:44,marginTop:12},
  searchButtonText:{color:'#07110B',fontSize:14,fontWeight:'800'},
  trackRow:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:12},
  cover:{width:48,height:48,borderRadius:9,backgroundColor:COLORS.surfaceLight,alignItems:'center',justifyContent:'center'},
  trackText:{flex:1},trackTitle:{color:COLORS.text,fontSize:14,fontWeight:'700'},
  sourceLabel:{color:COLORS.green,fontSize:10,marginTop:4},
  iconButton:{padding:8},emptyMessage:{color:COLORS.muted,textAlign:'center',marginTop:35},
  emptyCard:{backgroundColor:COLORS.surface,borderRadius:14,padding:18,flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:COLORS.border},
  tabBar:{position:'absolute',height:67,paddingTop:7,paddingBottom:7,backgroundColor:'rgba(8,11,10,0.78)',borderTopColor:COLORS.border,borderTopWidth:1,elevation:0},
});
