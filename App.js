import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import Slider from '@react-native-community/slider';
import { searchAllSources } from './src/services/externalSourcesService';
import { isCatalogConfigured } from './src/services/catalogService';
import { getFavorites, toggleFavorite } from './src/services/favoritesService';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import { getPreferences, savePreferences } from './src/storage/preferences';

const Tab = createBottomTabNavigator();
const COLORS = {
  background: '#080B0A', surface: '#111715', surfaceLight: '#19221E',
  text: '#F4F7F5', muted: '#9AA8A0', green: '#1ED760', border: '#26332C',
};

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function HomeScreen() {
  const { currentTrack, playTrack } = usePlayer();
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.topBar}>
      <View><Text style={styles.eyebrow}>SEU SOM, DO SEU JEITO</Text>
        <Text style={styles.brand}>Nova<Text style={styles.brandAccent}>Stream</Text></Text></View>
      <View style={styles.avatar}><Ionicons name="person-outline" size={21} color={COLORS.text}/></View>
    </View>
    <LinearGradient colors={['#174B32','#10251B','#111715']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.hero}>
      <Text style={styles.heroLabel}>NOVA EXPERIÊNCIA</Text>
      <Text style={styles.heroTitle}>Sua próxima música favorita começa aqui.</Text>
      <Text style={styles.heroText}>Explore, organize e curta sua biblioteca.</Text>
      <View style={styles.heroIcon}><Ionicons name="musical-notes" size={22} color="#07110B"/></View>
    </LinearGradient>
    <SectionTitle>Seu NovaStream</SectionTitle>
    <View style={styles.featureRow}>
      <FeatureCard icon="cloud-outline" title="Streaming" subtitle="Player online e controles de reprodução"/>
      <FeatureCard icon="cloud-download-outline" title="Offline" subtitle="Disponível após integração de criptografia nativa"/>
    </View>
    <View style={styles.featureRow}>
      <FeatureCard icon="heart-outline" title="Favoritas" subtitle="Sua coleção pessoal"/>
      <FeatureCard icon="ban-outline" title="Sem anúncios" subtitle="Tudo gratuito"/>
    </View>
    <View style={styles.infoPanel}>
      <Text style={styles.cardTitle}>Catálogo e fontes</Text>
      <Text style={styles.cardDescription}>A busca usa a API configurada e provedores autorizados. Nenhuma fonte é extraída de serviços protegidos.</Text>
      <Text style={styles.statusText}>{isCatalogConfigured() ? 'API do catálogo configurada' : 'Aguardando URL da API do catálogo'}</Text>
    </View>
    {currentTrack ? <Pressable style={styles.resumeCard} onPress={()=>playTrack(currentTrack)}>
      <Ionicons name="play-circle" size={27} color={COLORS.green}/>
      <View style={{flex:1}}><Text style={styles.cardTitle}>Continuar ouvindo</Text><Text style={styles.cardDescription}>{currentTrack.title} • {currentTrack.artist}</Text></View>
    </Pressable> : null}
    <View style={{height:100}}/>
  </ScrollView>;
}

function FeatureCard({ icon, title, subtitle }) {
  return <View style={styles.featureCard}><Ionicons name={icon} size={23} color={COLORS.green}/>
    <Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardDescription}>{subtitle}</Text></View>;
}

function TrackRow({ track, onFavorite, favorite, onPlay }) {
  return <View style={styles.trackRow}>
    <Pressable style={styles.cover} onPress={onPlay}><Ionicons name="play" size={19} color={COLORS.green}/></Pressable>
    <Pressable style={styles.trackText} onPress={onPlay}>
      <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
      <Text numberOfLines={1} style={styles.cardDescription}>{track.artist}{track.album ? ' • '+track.album : ''}</Text>
      <Text style={styles.sourceLabel}>{track.source || 'Catálogo'}{track.downloadable ? ' • Offline autorizado' : ''}</Text>
    </Pressable>
    <Pressable onPress={onFavorite} accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} style={styles.iconButton}>
      <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={21} color={favorite ? COLORS.green : COLORS.muted}/>
    </Pressable>
  </View>;
}

const SEARCH_HISTORY_KEY = 'novastream.search.history.v1';
const SEARCH_GENRES = ['Todos', 'Pop', 'Rock', 'Rap', 'Hip-Hop', 'Funk', 'Eletrônica', 'Jazz', 'Clássica', 'Instrumental'];

function SearchScreen() {
  const [query,setQuery]=useState('');
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [favorites,setFavorites]=useState([]);
  const [selectedGenre,setSelectedGenre]=useState('Todos');
  const [history,setHistory]=useState([]);
  const { playTrack }=usePlayer();

  useEffect(()=>{
    getFavorites().then(setFavorites).catch(()=>{});
    AsyncStorage.getItem(SEARCH_HISTORY_KEY).then((raw)=>{
      const saved=raw?JSON.parse(raw):[];
      if(Array.isArray(saved))setHistory(saved.slice(0,8));
    }).catch(()=>{});
  },[]);

  async function runSearch(searchText=query, genreFilter=selectedGenre){
    const term=String(searchText||'').trim();
    if(!term && genreFilter==='Todos')return;
    setLoading(true);setSearched(true);
    try{
      const items=await searchAllSources(term,{genre:genreFilter});
      setResults(items);
      const label=term || genreFilter;
      if(label){
        const next=[label,...history.filter((item)=>item.toLowerCase()!==label.toLowerCase())].slice(0,8);
        setHistory(next);
        AsyncStorage.setItem(SEARCH_HISTORY_KEY,JSON.stringify(next)).catch(()=>{});
      }
    }catch(error){
      Alert.alert('Erro na busca',error.message||'Não foi possível pesquisar agora.');
    }finally{setLoading(false);}
  }

  async function clearHistory(){
    setHistory([]);
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY).catch(()=>{});
  }

  async function favorite(track){
    try{setFavorites(await toggleFavorite(track));}
    catch{Alert.alert('Erro','Não foi possível atualizar os favoritos.');}
  }

  return <View style={styles.screen}>
    <View style={styles.searchHeader}>
      <Text style={styles.pageTitle}>Buscar</Text>
      <Text style={styles.pageDescription}>Pesquise faixas por nome, artista, álbum ou gênero em várias fontes.</Text>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={COLORS.muted}/>
        <TextInput value={query} onChangeText={setQuery} onSubmitEditing={()=>runSearch()} placeholder="O que você quer ouvir?"
          placeholderTextColor={COLORS.muted} returnKeyType="search" style={styles.searchInput}/>
        {query.length>0?<Pressable onPress={()=>{setQuery('');setResults([]);setSearched(false);}}><Ionicons name="close-circle" size={19} color={COLORS.muted}/></Pressable>:null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroller} contentContainerStyle={styles.genreList}>
        {SEARCH_GENRES.map((genre)=><Pressable key={genre} onPress={()=>setSelectedGenre(genre)}
          style={[styles.genreChip,selectedGenre===genre&&styles.genreChipSelected]}>
          <Text style={[styles.genreChipText,selectedGenre===genre&&styles.genreChipTextSelected]}>{genre}</Text>
        </Pressable>)}
      </ScrollView>
      <Pressable style={styles.searchButton} onPress={()=>runSearch()} disabled={loading}>
        {loading?<ActivityIndicator color="#07110B"/>:<Text style={styles.searchButtonText}>Pesquisar</Text>}
      </Pressable>
      <Text style={styles.searchHint}>Dica: use artist:nome, album:nome, track:nome ou genre:estilo.</Text>
    </View>
    <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:110}}>
      {!searched&&history.length>0?<View style={styles.historyBlock}>
        <View style={styles.historyHeader}><Text style={styles.historyTitle}>Pesquisas recentes</Text>
          <Pressable onPress={clearHistory}><Text style={styles.clearHistory}>Limpar</Text></Pressable></View>
        {history.map((item)=><Pressable key={item} style={styles.historyRow} onPress={()=>{setQuery(item);runSearch(item);}}>
          <Ionicons name="time-outline" size={17} color={COLORS.muted}/>
          <Text style={styles.historyText}>{item}</Text>
          <Ionicons name="arrow-up-left" size={16} color={COLORS.muted}/>
        </Pressable>)}
      </View>:null}
      {results.length>0?<Text style={styles.resultCount}>{results.length} faixas encontradas</Text>:null}
      {results.map((track,index)=><TrackRow key={track.id+'-'+track.source+'-'+index} track={track}
        favorite={favorites.some(item=>item.id===track.id)} onFavorite={()=>favorite(track)}
        onPlay={()=>playTrack(track,results)}/>)}
      {searched&&!loading&&results.length===0?<Text style={styles.emptyMessage}>Nenhuma faixa encontrada. Experimente outro termo ou gênero.</Text>:null}
    </ScrollView>
  </View>;
}
function LibraryScreen() {
  const [favorites,setFavorites]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const {playTrack}=usePlayer();
  useEffect(()=>{getFavorites().then(setFavorites).finally(()=>setLoaded(true));},[]);
  return <View style={styles.screen}><View style={styles.searchHeader}>
    <Text style={styles.pageTitle}>Sua biblioteca</Text><Text style={styles.pageDescription}>Favoritas e suas coleções ficam reunidas aqui.</Text>
  </View><ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:100}}>
    <SectionTitle>Suas músicas favoritas</SectionTitle>
    {!loaded?<ActivityIndicator color={COLORS.green}/>:favorites.length
      ?favorites.map(track=><TrackRow key={track.id} track={track} favorite onPlay={()=>playTrack(track,favorites)}
        onFavorite={async()=>setFavorites(await toggleFavorite(track))}/>)
      :<View style={styles.emptyCard}><Ionicons name="heart-outline" size={26} color={COLORS.green}/>
        <Text style={styles.cardDescription}>Você ainda não adicionou músicas aos favoritos. Pesquise e toque no coração para guardar.</Text></View>}
  </ScrollView></View>;
}

function PlayerScreen() {
  const {currentTrack,status,togglePlayback,seekTo,next,previous,queue,queueIndex,playAt,error}=usePlayer();
  const duration=Number(status.duration)||0;
  const position=Number(status.currentTime)||0;
  const fmt=(v)=>{const n=Math.max(0,Math.floor(v));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
  return <ScrollView style={styles.screen} contentContainerStyle={styles.playerPage}>
    <Text style={styles.pageTitle}>Tocando agora</Text>
    <View style={styles.albumArt}><Ionicons name="musical-notes" size={72} color={COLORS.green}/></View>
    <Text numberOfLines={2} style={styles.playerTitle}>{currentTrack?.title||'Escolha uma música'}</Text>
    <Text style={styles.pageDescription}>{currentTrack?.artist||'Pesquise no catálogo autorizado para começar'}</Text>
    <View style={styles.progressWrap}>
      <Slider minimumValue={0} maximumValue={Math.max(duration,1)} value={Math.min(position,duration||0)}
        onSlidingComplete={seekTo} minimumTrackTintColor={COLORS.green} maximumTrackTintColor={COLORS.border} thumbTintColor={COLORS.green}/>
      <View style={styles.timeRow}><Text style={styles.cardDescription}>{fmt(position)}</Text><Text style={styles.cardDescription}>{fmt(duration)}</Text></View>
    </View>
    <View style={styles.controls}>
      <Pressable onPress={previous} style={styles.controlButton}><Ionicons name="play-skip-back" size={28} color={COLORS.text}/></Pressable>
      <Pressable onPress={togglePlayback} style={styles.playButton}><Ionicons name={status.playing?'pause':'play'} size={32} color="#07110B"/></Pressable>
      <Pressable onPress={next} style={styles.controlButton}><Ionicons name="play-skip-forward" size={28} color={COLORS.text}/></Pressable>
    </View>
    {error?<Text style={styles.errorText}>{error}</Text>:null}
    <SectionTitle>Fila de reprodução</SectionTitle>
    {queue.length?queue.map((track,index)=><Pressable key={track.id+'-'+index} style={styles.queueRow} onPress={()=>playAt(index)}>
      <Ionicons name={index===queueIndex?'volume-high':'musical-note'} size={18} color={index===queueIndex?COLORS.green:COLORS.muted}/>
      <View style={{flex:1}}><Text style={styles.trackTitle}>{track.title}</Text><Text style={styles.cardDescription}>{track.artist}</Text></View>
    </Pressable>):<Text style={styles.cardDescription}>A fila aparecerá quando você iniciar uma música nos resultados da busca.</Text>}
  </ScrollView>;
}

function SettingsScreen() {
  const [prefs,setPrefs]=useState(null);
  useEffect(()=>{getPreferences().then(setPrefs);},[]);
  async function update(changes){
    const next=await savePreferences(changes);setPrefs(next);
  }
  if(!prefs)return <View style={styles.screen}><ActivityIndicator color={COLORS.green}/></View>;
  const Choice=({label,selected,onPress})=><Pressable onPress={onPress} style={[styles.choice,selected&&styles.choiceSelected]}>
    <Text style={[styles.choiceText,selected&&{color:COLORS.green}]}>{label}</Text><Ionicons name={selected?'checkmark-circle':'ellipse-outline'} size={18} color={selected?COLORS.green:COLORS.muted}/>
  </Pressable>;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.settingsPage}>
    <Text style={styles.pageTitle}>Configurações</Text>
    <Text style={styles.pageDescription}>Preferências de reprodução e armazenamento.</Text>
    <SectionTitle>Qualidade de áudio</SectionTitle>
    {['standard','high','very_high','adaptive'].map(value=><Choice key={value} label={{standard:'Padrão',high:'Alta (recomendada)',very_high:'Muito alta',adaptive:'Adaptativa'}[value]} selected={prefs.quality===value} onPress={()=>update({quality:value})}/>)}
    <SectionTitle>Limite do cache temporário</SectionTitle>
    <Text style={styles.cardDescription}>{prefs.cacheLimitMB} MB • Ajuste salvo para a política de cache. A limpeza automática ainda depende da integração do gerenciador de arquivos.</Text>
    <View style={styles.cacheChoices}>{[256,512,1024,2048].map(value=><Choice key={value} label={value>=1024?(value/1024)+' GB':value+' MB'} selected={prefs.cacheLimitMB===value} onPress={()=>update({cacheLimitMB:value})}/>)}</View>
    <SectionTitle>Local de armazenamento offline</SectionTitle>
    <Choice label="Memória interna" selected={prefs.storageLocation==='internal'} onPress={()=>update({storageLocation:'internal'})}/>
    <View style={[styles.choice,{opacity:0.5}]}><Text style={styles.choiceText}>Cartão SD — integração Android SAF pendente</Text><Ionicons name="lock-closed-outline" size={17} color={COLORS.muted}/></View>
    <Text style={styles.note}>Os downloads offline continuam bloqueados até a integração e validação da criptografia nativa. Nenhuma música será salva sem proteção.</Text>
    <View style={{height:100}}/>
  </ScrollView>;
}

function AppNavigator() {
  const {currentTrack,status,togglePlayback}=usePlayer();
  return <Tab.Navigator screenOptions={({route})=>({
    headerShown:false,tabBarActiveTintColor:COLORS.green,tabBarInactiveTintColor:COLORS.muted,
    tabBarLabelStyle:{fontSize:10,fontWeight:'600',marginBottom:3},tabBarStyle:styles.tabBar,
    tabBarBackground:()=> <BlurView tint="dark" intensity={75} style={StyleSheet.absoluteFill}/>,
    tabBarIcon:({color,size,focused})=>{
      const icons={Início:focused?'home':'home-outline',Buscar:focused?'search':'search-outline',
        Biblioteca:focused?'library':'library-outline',Player:focused?'musical-notes':'musical-notes-outline',
        Ajustes:focused?'settings':'settings-outline'};
      return <Ionicons name={icons[route.name]} size={size} color={color}/>;
    },
  })}>
    <Tab.Screen name="Início" component={HomeScreen}/>
    <Tab.Screen name="Buscar" component={SearchScreen}/>
    <Tab.Screen name="Biblioteca" component={LibraryScreen}/>
    <Tab.Screen name="Player" component={PlayerScreen} options={{tabBarBadge:currentTrack&&status.playing?'•':undefined}}/>
    <Tab.Screen name="Ajustes" component={SettingsScreen}/>
  </Tab.Navigator>;
}

export default function App() {
  return <PlayerProvider><NavigationContainer theme={{...DarkTheme,colors:{...DarkTheme.colors,
    background:COLORS.background,card:COLORS.background,text:COLORS.text,border:COLORS.border,primary:COLORS.green}}}>
    <StatusBar style="light" backgroundColor={COLORS.background}/><AppNavigator/>
  </NavigationContainer></PlayerProvider>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:COLORS.background},content:{paddingHorizontal:20,paddingTop:22},
  topBar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:25},
  eyebrow:{color:COLORS.muted,fontSize:9,letterSpacing:2,fontWeight:'700',marginBottom:5},
  brand:{color:COLORS.text,fontSize:27,fontWeight:'800',letterSpacing:-1},brandAccent:{color:COLORS.green},
  avatar:{width:42,height:42,borderRadius:21,backgroundColor:COLORS.surfaceLight,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:COLORS.border},
  hero:{minHeight:190,borderRadius:22,padding:21,justifyContent:'center',marginBottom:30,overflow:'hidden'},
  heroLabel:{color:'#A9E7BF',fontSize:10,letterSpacing:2,fontWeight:'800',marginBottom:10},
  heroTitle:{color:'#FFF',fontSize:24,fontWeight:'800',lineHeight:30,maxWidth:'88%'},
  heroText:{color:'#C5D9CC',fontSize:12,marginTop:9},
  heroIcon:{position:'absolute',right:20,bottom:20,width:43,height:43,borderRadius:22,backgroundColor:COLORS.green,alignItems:'center',justifyContent:'center'},
  sectionTitle:{color:COLORS.text,fontSize:18,fontWeight:'800',marginTop:22,marginBottom:12},
  featureRow:{flexDirection:'row',gap:12,marginBottom:12},
  featureCard:{flex:1,minHeight:125,backgroundColor:COLORS.surface,borderRadius:16,padding:15,borderWidth:1,borderColor:COLORS.border},
  cardTitle:{color:COLORS.text,fontSize:14,fontWeight:'700',marginTop:8},
  cardDescription:{color:COLORS.muted,fontSize:11,lineHeight:16,marginTop:4},
  infoPanel:{backgroundColor:COLORS.surface,borderRadius:16,padding:16,borderWidth:1,borderColor:COLORS.border,marginTop:14},
  statusText:{color:COLORS.green,fontSize:11,marginTop:10,fontWeight:'700'},
  resumeCard:{marginTop:15,padding:15,backgroundColor:COLORS.surface,borderRadius:14,flexDirection:'row',alignItems:'center',gap:12},
  pageTitle:{color:COLORS.text,fontSize:25,fontWeight:'800'},
  pageDescription:{color:COLORS.muted,fontSize:13,lineHeight:20,marginTop:7},
  searchHeader:{paddingHorizontal:20,paddingTop:24,paddingBottom:18},
  searchBox:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:COLORS.surface,borderRadius:13,paddingHorizontal:14,height:50,marginTop:20,borderWidth:1,borderColor:COLORS.border},
  searchInput:{flex:1,color:COLORS.text,fontSize:14},
  searchButton:{backgroundColor:COLORS.green,borderRadius:12,alignItems:'center',justifyContent:'center',height:44,marginTop:12},
  searchButtonText:{color:'#07110B',fontSize:14,fontWeight:'800'},
  genreScroller:{marginTop:13,maxHeight:38},
  genreList:{gap:8,paddingRight:10},
  genreChip:{paddingHorizontal:13,paddingVertical:8,borderRadius:20,backgroundColor:COLORS.surfaceLight,borderWidth:1,borderColor:COLORS.border},
  genreChipSelected:{backgroundColor:'#173C29',borderColor:COLORS.green},
  genreChipText:{color:COLORS.muted,fontSize:11,fontWeight:'600'},
  genreChipTextSelected:{color:COLORS.green},
  searchHint:{color:COLORS.muted,fontSize:10,marginTop:9},
  historyBlock:{marginBottom:16},
  historyHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:8},
  historyTitle:{color:COLORS.text,fontSize:14,fontWeight:'700'},
  clearHistory:{color:COLORS.green,fontSize:11,fontWeight:'700'},
  historyRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:11,borderBottomWidth:1,borderBottomColor:COLORS.border},
  historyText:{color:COLORS.text,fontSize:13,flex:1},
  resultCount:{color:COLORS.muted,fontSize:11,marginBottom:6,marginTop:6},
  trackRow:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.border,gap:12},
  cover:{width:48,height:48,borderRadius:9,backgroundColor:COLORS.surfaceLight,alignItems:'center',justifyContent:'center'},
  trackText:{flex:1},trackTitle:{color:COLORS.text,fontSize:14,fontWeight:'700'},
  sourceLabel:{color:COLORS.green,fontSize:10,marginTop:4},iconButton:{padding:8},
  emptyMessage:{color:COLORS.muted,textAlign:'center',marginTop:35},
  emptyCard:{backgroundColor:COLORS.surface,borderRadius:14,padding:18,flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:COLORS.border},
  playerPage:{padding:22,paddingBottom:110,alignItems:'stretch'},
  albumArt:{height:260,marginTop:28,marginBottom:25,borderRadius:22,backgroundColor:COLORS.surfaceLight,borderWidth:1,borderColor:COLORS.border,alignItems:'center',justifyContent:'center'},
  playerTitle:{color:COLORS.text,fontSize:22,fontWeight:'800',textAlign:'center'},
  progressWrap:{marginTop:25},timeRow:{flexDirection:'row',justifyContent:'space-between'},
  controls:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:35,marginVertical:28},
  controlButton:{padding:12},playButton:{width:68,height:68,borderRadius:34,backgroundColor:COLORS.green,alignItems:'center',justifyContent:'center'},
  queueRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:1,borderBottomColor:COLORS.border},
  errorText:{color:'#FF8A80',textAlign:'center',marginBottom:15},
  settingsPage:{padding:22,paddingBottom:100},
  choice:{minHeight:48,backgroundColor:COLORS.surface,borderRadius:11,paddingHorizontal:14,marginBottom:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderWidth:1,borderColor:COLORS.border},
  choiceSelected:{borderColor:COLORS.green},choiceText:{color:COLORS.text,fontSize:13},
  cacheChoices:{gap:2},note:{color:COLORS.muted,fontSize:11,lineHeight:17,marginTop:14},
  tabBar:{position:'absolute',height:67,paddingTop:7,paddingBottom:7,backgroundColor:'rgba(8,11,10,0.78)',borderTopColor:COLORS.border,borderTopWidth:1,elevation:0},
});
