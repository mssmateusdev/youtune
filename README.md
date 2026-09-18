<p align="center">
  <img width="120px" src="assets/img/Logo.png" alt="YouTune Logo" />
</p>

<h1 align="center">YouTune</h1>

<p align="center">
  <b>Um aplicativo desktop moderno, rápido e sem anúncios para o YouTube Music.</b><br />
  Construído com Tauri v2, Rust, React e TypeScript para <b>Windows e Linux</b> (com suporte a macOS).
</p>

<p align="center">
  <a href="https://github.com/mssmateusdev/youtune/releases/latest"><img src="https://img.shields.io/github/v/release/mssmateusdev/youtune?style=for-the-badge&color=ff0033&label=versão" alt="Versão"></a>
  <a href="https://github.com/mssmateusdev/youtune/releases/latest"><img src="https://img.shields.io/github/downloads/mssmateusdev/youtune/total?style=for-the-badge&color=ff3d00&label=downloads" alt="Downloads"></a>
  <a href="https://github.com/mssmateusdev/youtune/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mssmateusdev/youtune?style=for-the-badge&color=ff6900" alt="Licença"></a>
  <a href="https://github.com/mssmateusdev/youtune/stargazers"><img src="https://img.shields.io/github/stars/mssmateusdev/youtune?style=for-the-badge&color=ff9700&label=estrelas" alt="Stars"></a>
</p>

---

## 🌟 Sobre o YouTune

O **YouTune** traz o YouTube Music diretamente para a sua área de trabalho como um aplicativo nativo e ultra-otimizado, dispensando abas pesadas do navegador. Ele consome significativamente menos memória RAM do que navegadores convencionais e clientes baseados em Electron, oferecendo uma experiência fluida, limpa e com recursos exclusivos.

> [!NOTE]
> O **YouTune** é um projeto independente e não é oficialmente afiliado, patrocinado ou endossado pelo Google ou YouTube.

---

## ✨ Principais Funcionalidades

| Recurso | Descrição |
|---|---|
| 🚫 **Música Sem Anúncios (Ad-Block Nativo)** | Reprodução limpa e contínua de áudio, bloqueando anúncios diretamente no fluxo de reprodução. |
| ⚡ **Carregamento Instantâneo** | Pre-warming e otimização de requisições de áudio para início imediato das faixas sem engasgos. |
| 📺 **Modo Tela Cheia Imersivo** | Interface dedicada para visualização em tela cheia com capa do álbum ampliada, barra de progresso de alta precisão, controle de volume e atalhos rápidos. |
| 🎨 **Personalização de Cores** | Escolha livremente a cor de destaque (accent color) dos botões e controles nas configurações. |
| 🎮 **Discord Rich Presence** | Mostra no seu perfil do Discord a música que você está ouvindo e o artista em tempo real. |
| 🦀 **Motor de Áudio Rust Nativo** | Decodificação nativa de alta fidelidade em Rust (Opus / symphonia / cpal / rodio) direto para a placa de som, sem usar iframes web pesados. |
| 🎚️ **Equalizador de 10 Bandas** | Equalizador paramétrico com presets (Bass, Vocal, Treble, Flat) e controle de ganho/pré-amplificador em tempo real. |
| 📥 **Downloads & Modo Offline** | Baixe faixas, álbuns inteiros ou playlists para escutar sem conexão com a internet. |
| 🎤 **Letras Sincronizadas** | Letras linha por linha que acompanham a música, com suporte a tradução em vários idiomas e ajuste fino de sincronia. |
| 🔍 **Pesquisa Rápida** | Busca instantânea de músicas, artistas, álbuns, playlists e podcasts (`Ctrl+Space`). |
| 📑 **Múltiplas Abas Independentes** | Navegue por várias playlists ou álbuns ao mesmo tempo, cada aba mantendo seu próprio histórico e estado. |
| 🪟 **Mini Player Flutuante** | Mini controle compacto que se destaca quando você muda de janela, permitindo controlar a reprodução sem abrir o app. |
| 🐧 **Multiplataforma (Linux & Windows)** | Compatível nativamente com Windows (10/11) e distribuições Linux (Ubuntu, Debian, Fedora, Arch, etc.). |

---

## 📥 Instalação e Download

Baixe o instalador mais recente na aba de **[Releases](https://github.com/mssmateusdev/youtune/releases/latest)**:

### 🪟 Windows
1. Baixe o instalador `YouTune_1.4.0_x64-setup.exe` ou `YouTune_1.4.0_x64_en-US.msi`.
2. Execute o instalador e siga as instruções na tela.
3. Pronto! O YouTune criará o atalho na Área de Trabalho e no Menu Iniciar.

### 🐧 Linux
O YouTune oferece pacotes para as principais distribuições Linux:

- **AppImage** (compatível com qualquer distribuição):
  ```bash
  chmod +x YouTune*.AppImage
  ./YouTune*.AppImage
  ```
- **Debian / Ubuntu / Linux Mint** (`.deb`):
  ```bash
  sudo dpkg -i youtune_*_amd64.deb
  sudo apt-get install -f # se faltar alguma dependência
  ```
- **Fedora / Red Hat** (`.rpm`):
  ```bash
  sudo rpm -i youtune-*.x86_64.rpm
  ```

#### 💡 Dependências de Áudio e Vídeo no Linux
Para garantir que todos os codecs proprietários e fluxos do YouTube funcionem sem erros no Linux:

```bash
# Debian / Ubuntu / Mint
sudo apt install gstreamer1.0-libav gstreamer1.0-plugins-base gstreamer1.0-plugins-good libwebkit2gtk-4.1-0

# Fedora
sudo dnf install gstreamer1-libav gstreamer1-plugins-base gstreamer1-plugins-good webkit2gtk4.1

# Arch Linux / Manjaro
sudo pacman -S gst-libav gst-plugins-base gst-plugins-good webkit2gtk-4.1
```

---

## 🛠️ Para Desenvolvedores (Build do Código Fonte)

### Pré-requisitos
- **Node.js** (v18 ou superior) e `npm`
- **Rust e Cargo** (versão estável mais recente: [rustup.rs](https://rustup.rs/))
- **No Windows**: C++ Build Tools (Visual Studio MSVC)
- **No Linux**: Dependências de desenvolvimento do WebKitGTK e GTK3:
  ```bash
  sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libasound2-dev libssl-dev cmake build-essential
  ```

### Clonar e Rodar Localmente

```bash
# Clonar o repositório
git clone https://github.com/mssmateusdev/youtune.git
cd youtune

# Instalar dependências do frontend
npm install

# Rodar em modo de desenvolvimento (Live Reload)
npm run tauri dev

# Compilar instaladores para produção
npm run tauri build
```

Os instaladores compilados serão gerados em `src-tauri/target/release/bundle/`.

---

## 📄 Licença

Distribuído sob a licença GNU General Public License v3.0. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
