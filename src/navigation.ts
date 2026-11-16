import { router } from 'expo-router';

export const openTitulo = (id: number) =>
  router.push({ pathname: '/titulo/[id]', params: { id: String(id) } });

export const openCategoria = (nome: string, label: string, tipo: string) =>
  router.push({ pathname: '/categoria/[nome]', params: { nome, label, tipo } });

export const openSecao = (tipo: 'em-alta' | 'recentes' | 'melhores', genero?: string | null, kind = 'ANIME') =>
  router.push({ pathname: '/secao/[tipo]', params: { tipo, genero: genero ?? '', kind } });
