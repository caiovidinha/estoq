# Ícones PWA

## Ícones necessários para o PWA:

Você precisa criar ícones nos seguintes tamanhos:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Como criar os ícones:

### Opção 1 - Online (Recomendado):
1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem quadrada (mínimo 512x512px)
3. Baixe os ícones gerados
4. Coloque todos nesta pasta

### Opção 2 - Ferramentas:
- **Photoshop/GIMP**: Crie uma imagem 512x512 e redimensione para cada tamanho
- **ImageMagick**: Use o comando abaixo para gerar todos os tamanhos:

```bash
convert seu-logo.png -resize 72x72 icon-72x72.png
convert seu-logo.png -resize 96x96 icon-96x96.png
convert seu-logo.png -resize 128x128 icon-128x128.png
convert seu-logo.png -resize 144x144 icon-144x144.png
convert seu-logo.png -resize 152x152 icon-152x152.png
convert seu-logo.png -resize 192x192 icon-192x192.png
convert seu-logo.png -resize 384x384 icon-384x384.png
convert seu-logo.png -resize 512x512 icon-512x512.png
```

## Dicas:
- Use fundo transparente ou sólido
- Mantenha o design simples e reconhecível
- Teste em diferentes tamanhos
- Prefira formato PNG com transparência
