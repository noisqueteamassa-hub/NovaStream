# NovaStream

Aplicativo de música gratuito, com identidade visual própria e navegação inspirada em padrões comuns de players de música.

## Objetivo
- Acesso gratuito, sem assinatura obrigatória.
- Reprodução em segundo plano.
- Busca, biblioteca, favoritos e playlists.
- Downloads para ouvir offline.
- Interface escura e navegação simples.
- Conta e sincronização opcionais com Supabase.

## Situação atual
Este repositório contém a primeira estrutura visual e a configuração inicial do Expo. Player, busca real, contas, playlists e downloads ainda precisam ser implementados e testados. O primeiro APK será uma compilação inicial, não uma versão final com todos os recursos.

## Direitos de música
O servidor e os downloads devem usar apenas áudio próprio, licenciado, de domínio público ou com autorização de distribuição. O projeto não copia o catálogo, código, marca ou recursos pagos de terceiros. O NovaStream não terá assinatura obrigatória; os recursos implementados serão gratuitos.

## Build Android
O GitHub Actions executa a verificação do Expo, gera o projeto Android e compila um APK. Abra a aba Actions, selecione NovaStream Android APK e baixe o artefato NovaStream-Android-APK quando a execução terminar com sucesso.

## Supabase
Copie .env.example para .env e preencha a URL do projeto e a chave publicável. Nunca coloque a chave service_role no aplicativo.
