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

## Estado da implementação
O APK inicial foi compilado e instalado pelo usuário. O repositório agora contém:
- Interface de início, busca com integração ao endpoint do catálogo e biblioteca de favoritos.
- Serviço normalizador do catálogo e registro de provedores externos autorizados.
- Política de streaming com qualidade alta padrão e fallback adaptativo.
- Banco SQLite para metadados de downloads e favoritos.
- Armazenamento de chave no Android Keystore por meio do Expo SecureStore.
- Contrato para criptografia nativa AES-GCM em blocos e gerenciador de downloads com validação de licença.

Ainda NÃO estão concluídos: servidor/API real do catálogo, conectores de provedores externos, player funcional integrado à interface, execução em segundo plano testada, criptografia nativa em blocos, download offline completo, seletor SAF para cartão SD, gerenciamento real do limite de cache e telas de configurações completas. O gerenciador de downloads bloqueia a operação enquanto o adaptador nativo de criptografia não estiver disponível; isso evita salvar faixas como arquivos desprotegidos ou alegar que já existe proteção que ainda não foi implementada.

## Contrato da API de catálogo
Configure `EXPO_PUBLIC_CATALOG_API_URL` no ambiente de build. O app consulta:
`GET /search?q=<termo>`

Resposta aceita:
```json
{
  "results": [
    {
      "id": "track-123",
      "title": "Título",
      "artist": "Artista",
      "album": "Álbum",
      "artworkUrl": "https://...",
      "streamUrl": "https://...",
      "downloadUrl": "https://...",
      "duration": 210,
      "source": "catalog",
      "downloadable": false,
      "license": null
    }
  ]
}
```
Use URLs HTTPS. O backend deve confirmar direitos de distribuição e expor `downloadable: true` e os dados da licença somente para faixas autorizadas. Não conecte fontes que removam DRM, extraiam áudio de serviços sem permissão ou contornem assinaturas.

## Segurança e armazenamento
- O Expo SecureStore guarda a chave de proteção usando o armazenamento seguro do sistema (Android Keystore).
- A chave não deve ser gravada no AsyncStorage, SQLite ou logs.
- Áudio offline deve ser cifrado/decifrado em blocos por implementação nativa, sem carregar a faixa inteira na RAM.
- O suporte ao cartão SD exige integração com Android Storage Access Framework (SAF); o armazenamento externo não deve receber a chave.
- Cache temporário de streaming é separado dos downloads e dos metadados da biblioteca.

## Build Android
O GitHub Actions verifica o Expo, gera o projeto Android e compila um APK. Consulte a aba Actions e baixe o artefato quando a execução terminar com sucesso.

## Supabase
A conta e sincronização são opcionais. Configure `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque a chave `service_role` no aplicativo.
