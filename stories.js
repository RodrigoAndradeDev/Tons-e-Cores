/**
 * Histórias reais do Projeto Tons & Cores
 * ---------------------------------------------------------------------------
 * Este arquivo é a única fonte de dados das histórias exibidas na primeira
 * seção e na visualização detalhada. Nenhum dado fictício deve ser publicado.
 *
 * Cada item deve seguir a estrutura abaixo. Somente histórias com
 * `authorization: true` são renderizadas, e todos os textos/imagens precisam
 * ter autorização de publicação da pessoa ou família retratada.
 *
 * {
 *   id: "identificador-unico-e-estavel",
 *   name: "Nome ou identificação autorizada (ex.: 'Dona Maria')",
 *   summary: "Resumo curto da história, exibido na galeria.",
 *   narrative: "Relato mais longo, opcional. Separe parágrafos com uma linha em branco.",
 *   visitContext: "Como foi a visita realizada pelo projeto.",
 *   cover: {
 *     src: "assets/historias/arquivo-de-capa.jpg",
 *     alt: "Descrição objetiva da fotografia de capa."
 *   },
 *   photos: [
 *     {
 *       src: "assets/historias/foto-1.jpg",
 *       alt: "Descrição objetiva da fotografia.",
 *       thumbnail: "assets/historias/miniatura-1.jpg" // opcional
 *     }
 *   ],
 *   video: { // opcional — omita a chave se não houver vídeo real
 *     src: "assets/historias/depoimento.mp4",
 *     type: "video/mp4", // opcional
 *     poster: "assets/historias/poster.jpg", // opcional
 *     alt: "Descrição do conteúdo do depoimento em vídeo.",
 *     caption: "Legenda ou crédito, se necessário.", // opcional
 *     tracks: [ // opcional — legenda acessível
 *       { src: "assets/historias/depoimento.vtt", language: "pt-BR", label: "Português", default: true }
 *     ]
 *   },
 *   testimonials: [ // opcional — falas reais e autorizadas
 *     { author: "Nome ou identificação autorizada", text: "Depoimento real." }
 *   ],
 *   authorization: true // obrigatório: publicação autorizada
 * }
 *
 * Dicas de privacidade e dignidade:
 * - Não publique endereços, documentos, diagnósticos, renda ou situações
 *   familiares sem autorização explícita.
 * - Use identificações autorizadas quando o nome completo não puder ser exposto.
 * - Escreva textos alternativos descritivos; não use "imagem de pessoa".
 * - Otimize as imagens antes de subir (JPG/WebP, largura máxima ~1600px).
 */
window.TONS_E_CORES_STORIES = [];
