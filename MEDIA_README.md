# Aura Linho & Atelier — pacote de mídia

Mídia editorial original gerada por IA com a ferramenta integrada `image_gen`, seguindo a direção Warm Mediterranean Boutique. Os movimentos do vídeo e da sequência são animações digitais sutis das imagens geradas. Modelos e diretora criativa são personagens fictícios.

## Conteúdo

- `media/`: 21 imagens estáticas em AVIF e WebP, totalizando 42 arquivos.
- `media/frames/`: 120 quadros de 1024 × 576 em cada formato, numerados de `frame_0001` a `frame_0120`.
- `media/hero-ambient.mp4`: H.264, 1280 × 720, 24 fps, 108 quadros, 4,5 segundos, CRF 24, sem áudio e com faststart.
- `MEDIA_MANIFEST.json`: dimensões, bytes, textos alternativos em pt-BR, pontos focais normalizados, hashes e organização dos produtos e quadros.
- `preview/contact-sheet.jpg`: visão geral das 21 imagens.
- `preview/storyboard.jpg`: seis momentos da sequência.
- `VALIDATION.json`: resultados das verificações realizadas.
- `PROMPTS.md`: conjunto exato de prompts e referências utilizados.

São **283 arquivos de mídia**. As imagens de produto têm 1000 × 1250 pixels. Os nomes `-a` e `-b` representam, respectivamente, vista principal e detalhe para hover. As alternativas de cor citadas no manifesto são opções da coleção; cada par representa uma cor do produto, não duas variantes de cor.

## Sequência para canvas

Reproduzir os quadros de 1 a 120 a 24 fps: a duração é de 5 segundos. Os primeiros 35 quadros fazem o desenho ganhar linhas; os quadros 36–85 revelam a fotografia por varredura diagonal; os quadros 86–120 mostram a peça finalizada com pequenas oscilações no tecido e na luz. O croqui e a fotografia usam o mesmo enquadramento e recorte.

Use o padrão `media/frames/frame_0001.avif` com fallback para `.webp`. Para navegação por rolagem, transforme o progresso normalizado em um índice com `Math.min(119, Math.floor(progresso * 120)) + 1`. Faça o carregamento próximo ao quadro atual e mantenha um cache limitado, em vez de decodificar todos os quadros simultaneamente em aparelhos móveis. Para pessoas com preferência de movimento reduzido, mostre o último quadro estático.

## Integração de imagens

Priorize AVIF em um elemento `<picture>` e use WebP no `<img>`. Os caminhos no manifesto são relativos à raiz do pacote. `focalPoint.x` e `focalPoint.y` usam valores de 0 a 1, medidos a partir do canto superior esquerdo; multiplique por 100 para usar como `object-position` em porcentagem. Preserve as dimensões declaradas para evitar mudança de layout durante o carregamento.

## Loop do vídeo

O original animado de 5 segundos foi processado com `xfade=transition=fade:duration=0.5:offset=4.5`, cruzando os últimos 0,5 segundos com os primeiros 0,5 segundos. Depois, o intervalo de 0,5 a 5 segundos foi mantido, produzindo os 4,5 segundos finais. Esse recorte é necessário para respeitar a duração solicitada sem duplicar o trecho de abertura. Use `autoplay muted loop playsinline` e `preload="metadata"` no elemento de vídeo.

## Codificação e origem

Cada AVIF foi codificado em uma chamada individual do FFmpeg com `libaom-av1`, `-still-picture 1`, `-crf 30`, `-b:v 0`, `-cpu-used 6`, `-pix_fmt yuv420p` e `-frames:v 1`. Não foi usada saída AVIF em lote pelo muxer image2. Os arquivos foram decodificados e suas caixas `av1C` foram conferidas.

As imagens originais têm resoluções nativas diferentes; foram recortadas e redimensionadas para as dimensões exatas do pedido, com pequena ampliação onde necessário. O manifesto informa as dimensões finais. Não foram usadas fotos ou vídeos de banco.

Os PNGs de origem e `sources.json` estão preservados em `sources/` no projeto local e ficam fora do ZIP para manter a distribuição otimizada. O script `scripts/build_media.py` permite reconstruir o pacote a partir dessas origens; requer Python com Pillow e NumPy, além de FFmpeg e FFprobe no PATH. Execute as etapas `statics`, `frames`, `video`, `manifest`, `contact-sheet` e `package`. As verificações de navegador e de continuidade estão registradas no relatório de validação.
