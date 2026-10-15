# Publicação Android com Trusted Web Activity

O Telegram Hub é uma PWA. O caminho de menor manutenção para entregar um aplicativo Android é empacotar a PWA como uma **Trusted Web Activity (TWA)** usando o Bubblewrap. A aplicação precisa estar publicada em HTTPS antes de criar o pacote Android.

## 1. Preparar a PWA

No diretório do projeto:

```bash
npm install
npm run generate:icons
npm run android:check
```

Publique a aplicação em uma origem HTTPS estável e confirme que estes endereços respondem publicamente:

```text
https://SEU-DOMINIO/manifest.json
https://SEU-DOMINIO/icons/icon-192.png
https://SEU-DOMINIO/icons/icon-512.png
```

O domínio usado durante o `bubblewrap init` precisa ser o mesmo domínio servido pela PWA.

## 2. Criar o projeto TWA

Instale o Bubblewrap em uma máquina de build Android com Node.js 20.9 ou superior e o Android SDK configurado:

```bash
npm install --global @bubblewrap/cli
bubblewrap init --manifest=https://SEU-DOMINIO/manifest.json
```

Quando solicitado, escolha um identificador Android estável, por exemplo `com.suaempresa.telegramhub`. O identificador escolhido passa a fazer parte do aplicativo publicado e não deve ser alterado depois. O Bubblewrap cria a pasta Android do TWA e solicita os dados da chave de assinatura.

Gere o pacote de produção:

```bash
bubblewrap build
```

O artefato `.aab` gerado é o arquivo para a Google Play. Guarde a chave de assinatura e os arquivos de configuração do Bubblewrap em armazenamento seguro; sem a mesma chave não será possível atualizar o aplicativo publicado.

## 3. Habilitar a verificação de origem

O Android só trata o site como uma TWA confiável quando o domínio publica `assetlinks.json` em `/.well-known/assetlinks.json`. Primeiro obtenha a impressão digital SHA-256 do certificado de assinatura usado pelo pacote que será distribuído. Se o Google Play App Signing estiver ativo, use também a impressão digital do certificado de assinatura do app exibida no Play Console; a chave de upload local é outra identidade. Depois, no diretório do projeto, gere o arquivo com os valores reais:

PowerShell:

```powershell
$env:ANDROID_PACKAGE_NAME = "com.suaempresa.telegramhub"
$env:ANDROID_SHA256_CERT_FINGERPRINTS = "AA:BB:...:FF"
npm run android:assetlinks
```

Para mais de um certificado (por exemplo, chave local e chave de upload), separe as impressões digitais por vírgulas. O script grava `public/.well-known/assetlinks.json`; publique esse arquivo junto com a aplicação e confirme:

```text
https://SEU-DOMINIO/.well-known/assetlinks.json
```

O arquivo `public/.well-known/assetlinks.json.example` mostra o formato, mas seus valores reais são obrigatórios. Não use o exemplo em produção.

## 4. Validar antes da Play Store

1. Abra a PWA no Chrome Android e confirme que o manifest e os ícones carregam sem erro.
2. Acesse o `assetlinks.json` pelo domínio HTTPS final e valide o JSON.
3. Instale o APK de teste gerado por `bubblewrap build` e confirme que a navegação permanece em modo TWA, sem barra de endereço.
4. Teste links internos, retorno ao app, modo offline e os atalhos do manifest (`?tab=explore`, `?action=submit`, `?tab=trending` e `?tab=favorites`).
5. Só então envie o `.aab` para um teste interno na Google Play.

O Bubblewrap pode atualizar os metadados do TWA quando o manifest mudar:

```bash
bubblewrap update
bubblewrap build
```

O backend PostgreSQL, as variáveis de ambiente e o deploy HTTPS continuam sendo requisitos do servidor. O empacotamento Android não substitui essa infraestrutura.
