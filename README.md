# Reanálise — Script Mínimo

Site simples e estático para montar o texto padrão do "Script Mínimo" com um clique.

## Como publicar no GitHub Pages

**Importante:** sempre que houver uma atualização, substitua **todos** os arquivos do ZIP no repositório (especialmente `index.html`, `style.css` e `script.js` juntos). Atualizar só um deles pode fazer partes do site pararem de funcionar, já que os três trabalham em conjunto.

1. Crie um repositório novo no GitHub (ex: `reanalise`).
2. Suba os 3 arquivos deste ZIP (`index.html`, `style.css`, `script.js`) para a raiz do repositório.
3. No repositório, vá em **Settings → Pages**.
4. Em **Source**, selecione a branch `main` e a pasta `/ (root)`. Clique em **Save**.
5. Aguarde 1–2 minutos. O link ficará algo como:
   `https://SEU-USUARIO.github.io/reanalise/`

Pronto — o site já pode ser acessado e usado direto do celular ou computador, sem precisar de servidor.

## Como funciona

- Cada campo é selecionado clicando no botão da resposta desejada (clique de novo para desmarcar).
- O campo "Celular / Chave Pix" é digitado livremente.
- O texto no painel da direita é montado automaticamente, na ordem correta, conforme os campos são preenchidos.
- O botão **Copiar texto** copia o texto pronto para a área de transferência.
- O botão **Limpar tudo** reseta o formulário.

## Estrutura

```
index.html               -> estrutura do site
style.css                -> visual (fundo branco, fonte Poppins, verde claro + azul escuro)
script.js                -> lógica de montagem do texto e cópia
site.webmanifest         -> configuração do PWA (nome, cores, ícones)
favicon.ico / favicon-16x16.png / favicon-32x32.png  -> ícones da aba do navegador
apple-touch-icon.png     -> ícone ao adicionar na tela do iPhone
android-chrome-192x192.png / android-chrome-512x512.png -> ícones do PWA no Android
```

Todos esses arquivos precisam estar juntos, na raiz do repositório, para o favicon e o PWA funcionarem corretamente.
