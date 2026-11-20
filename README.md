# NovaStream

Player de música gratuito, sem anúncios e sem planos pagos, com identidade visual própria.

## Decisões do produto
- Catálogo próprio + fontes externas que autorizem oficialmente busca e reprodução.
- Alta qualidade como padrão; o backend poderá oferecer adaptação conforme a conexão.
- Streaming online e downloads offline apenas quando a licença da faixa permitir.
- Downloads destinados a uma área privada e criptografada, reproduzíveis somente pelo NovaStream.
- Preferência de armazenamento interno ou cartão SD no Android, quando o suporte nativo estiver integrado.
- Busca por música, artista e álbum; favoritos e biblioteca local.
- Todos os recursos do aplicativo serão gratuitos.

## Implementado
- Interface de início, busca do catálogo, favoritos e biblioteca.
- Player compartilhado com reprodução HTTPS, pausa/retomada, avanço/retrocesso, busca na linha do tempo e fila.
- Configuração nativa do serviço de reprodução em segundo plano via plugin expo-audio.
- Sessão de mídia e metadados na tela bloqueada/notificação Android usando setActiveForLockScreen.
- Tela de configurações e preferências locais.
- API de catálogo Supabase Edge Function, migration SQL e pesquisa full-text com limite de 30 resultados.
- RLS: a API só devolve faixas publicadas, com direitos marcados como autorizados e URL HTTPS.

## Fontes externas de música\n- **Jamendo:** crie um aplicativo no portal oficial de desenvolvedores e configure `EXPO_PUBLIC_JAMENDO_CLIENT_ID` como GitHub Actions repository variable. A API oferece pesquisa por texto, artista, álbum e tags/gêneros, além de URL oficial de streaming. O plano padrão é voltado a apps não comerciais e possui limite mensal publicado pelo Jamendo. A API não deve ser usada para oferecer acesso offline nem cache dedicado; o app só pode manter buffering razoavelmente necessário para funcionar.\n- **Openverse:** pesquisa gravações musicais com licenças abertas. Cada resultado mantém a fonte e a licença; a permissão de cópia/offline precisa ser avaliada individualmente. A busca anônima tem limites de uso.\n- **Spotify:** não será usado como provedor de áudio. A Web API é principalmente metadados/controle de reprodução, e a política limita streaming a assinantes Premium, proíbe integrar conteúdo com outros serviços e proíbe replicar a experiência principal do Spotify.\n- **YouTube:** pode fornecer descoberta de vídeos pelo API oficial, mas as políticas proíbem separar áudio, download offline fora do Premium e background play do player API.\n- **SoundCloud:** requer acesso aprovado à API e restringe uso e armazenamento; não é tratado como fonte gratuita garantida.\n\n## Configurar a API de catálogo
1. Crie um projeto Supabase e abra o SQL Editor.
2. Execute o conteúdo de `supabase/migrations/202611190001_catalog.sql`.
3. Publique a função `catalog-search` de `supabase/functions/catalog-search/index.ts` como Edge Function. A configuração em `supabase/config.toml` deixa a função pública para pesquisa; a tabela continua protegida por RLS.
4. Configure `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente de build. A URL é montada automaticamente como `https://SEU-PROJETO.supabase.co/functions/v1/catalog-search`. `EXPO_PUBLIC_CATALOG_API_URL` é opcional.
5. Cadastre somente faixas para as quais exista autorização de distribuição, com `rights_status=authorized`, `is_published=true` e `stream_url` HTTPS direto. Para download, também são necessários `downloadable=true`, `download_url` HTTPS e licença que permita cópia offline.

**Importante:** criar a API não cria uma biblioteca musical automaticamente. O catálogo começa vazio. As faixas e os respectivos arquivos precisam ser fornecidos por você ou por distribuidores/fontes com autorização. Não adicione áudio extraído de plataformas protegidas ou sem permissão.

## Contrato da API
`GET https://SEU-PROJETO.supabase.co/functions/v1/catalog-search?q=termo`

Resposta JSON: `{"results":[{"id":"uuid","title":"Título","artist":"Artista","streamUrl":"https://...","downloadable":false}]}`

## O que ainda não está concluído
- Projeto Supabase, execução da migration, publicação da Edge Function e cadastro de faixas exigem configuração no painel Supabase.
- Conectores externos: Jamendo (busca e streaming oficial; sem modo offline pela API) e Openverse (busca de áudio musical com licenças abertas).
- Criptografia nativa AES-GCM em blocos, download offline completo e seletor SAF para cartão SD continuam pendentes. O gerenciador de downloads bloqueia operações enquanto a criptografia nativa não estiver pronta.
- Cache temporário automático ainda precisa ser ligado aos arquivos reais.
- Reprodução em segundo plano está configurada no código; precisa de teste em aparelho Android real, incluindo tela bloqueada, notificação, fone Bluetooth e economia de bateria.

## Segurança
- A chave pública/publishable pode ficar no app porque a tabela tem RLS. Nunca coloque `service_role` no aplicativo.
- A chave privada do projeto nunca deve ser enviada pelo chat nem gravada no app.
- Áudio offline deve ser cifrado/decifrado em blocos por implementação nativa, sem carregar a faixa inteira na RAM.
- O suporte ao cartão SD exige Android Storage Access Framework (SAF).

## Build Android
O GitHub Actions verifica o Expo, gera o projeto Android e compila um APK. Consulte a aba Actions e baixe o artefato quando a execução terminar com sucesso.\n\n## Estratégia de pesquisa inspirada em padrões de mercado\nA tela de busca possui histórico local, filtros rápidos de gênero e operadores `artist:`, `album:`, `track:` e `genre:`. A busca externa combina o catálogo NovaStream, Jamendo e Openverse, remove duplicatas por título/artista e mantém o provedor/licença de cada resultado. A interface é uma implementação original: não copia código, marcas, imagens ou layout proprietário do Spotify.\n