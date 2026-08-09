export type Lang = 'pt' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  pt: {
    'nav.brand': 'Pokédex',
    'nav.explore': 'Explorar',
    'nav.favorites': 'Favoritos',
    'nav.langToggle': 'Mudar para inglês',

    'hero.eyebrow': 'Guia de campo digital',
    'hero.title': 'Catalogue cada espécie do mundo Pokémon',
    'hero.subtitle':
      'Busque, filtre por tipo e monte sua coleção de favoritos com dados completos de mais de 1.000 espécies.',
    'hero.stat.species': 'espécies catalogadas',
    'hero.stat.types': 'tipos elementais',

    'search.placeholder': 'Buscar por nome…',
    'search.filterAll': 'Todos',
    'search.noResults.title': 'Nenhum espécime encontrado',
    'search.noResults.body': 'Tente outro nome ou remova o filtro de tipo.',

    'card.viewDetails': 'Ver ficha completa',
    'card.favoriteAdd': 'Adicionar aos favoritos',
    'card.favoriteRemove': 'Remover dos favoritos',

    'pagination.prev': 'Anterior',
    'pagination.next': 'Próxima',
    'pagination.pageOf': 'Página {current} de {total}',

    'detail.back': 'Voltar à lista',
    'detail.height': 'Altura',
    'detail.weight': 'Peso',
    'detail.abilities': 'Habilidades',
    'detail.hiddenAbility': 'oculta',
    'detail.stats': 'Atributos base',
    'detail.moves': 'Movimentos',
    'detail.movesShowMore': 'Mostrar todos ({count})',
    'detail.evolution': 'Linha evolutiva',
    'detail.evolution.none': 'Este Pokémon não evolui.',
    'detail.legendary': 'Lendário',
    'detail.mythical': 'Mítico',
    'detail.favorite.add': 'Adicionar aos favoritos',
    'detail.favorite.remove': 'Remover dos favoritos',
    'detail.loading': 'Escaneando espécime…',
    'detail.notFound': 'Não foi possível carregar este Pokémon.',

    'favorites.title': 'Seus favoritos',
    'favorites.subtitle': 'Os espécimes que você marcou para acompanhar de perto.',
    'favorites.empty.title': 'Sua lista está vazia',
    'favorites.empty.body': 'Explore a Pokédex e toque na estrela de um card para guardá-lo aqui.',
    'favorites.empty.cta': 'Ir para a Pokédex',

    'footer.builtWith': 'Construído com Angular, Node.js/Express e a PokeAPI.',
    'footer.sourceCode': 'Código-fonte',

    'common.loading': 'Carregando…',
    'common.error.retry': 'Tentar novamente',
  },
  en: {
    'nav.brand': 'Pokédex',
    'nav.explore': 'Explore',
    'nav.favorites': 'Favorites',
    'nav.langToggle': 'Switch to Portuguese',

    'hero.eyebrow': 'Digital field guide',
    'hero.title': 'Catalogue every species in the Pokémon world',
    'hero.subtitle':
      'Search, filter by type, and build your favorites collection with full data on 1,000+ species.',
    'hero.stat.species': 'species catalogued',
    'hero.stat.types': 'elemental types',

    'search.placeholder': 'Search by name…',
    'search.filterAll': 'All',
    'search.noResults.title': 'No specimen found',
    'search.noResults.body': 'Try another name or clear the type filter.',

    'card.viewDetails': 'View full record',
    'card.favoriteAdd': 'Add to favorites',
    'card.favoriteRemove': 'Remove from favorites',

    'pagination.prev': 'Previous',
    'pagination.next': 'Next',
    'pagination.pageOf': 'Page {current} of {total}',

    'detail.back': 'Back to list',
    'detail.height': 'Height',
    'detail.weight': 'Weight',
    'detail.abilities': 'Abilities',
    'detail.hiddenAbility': 'hidden',
    'detail.stats': 'Base stats',
    'detail.moves': 'Moves',
    'detail.movesShowMore': 'Show all ({count})',
    'detail.evolution': 'Evolution line',
    'detail.evolution.none': 'This Pokémon does not evolve.',
    'detail.legendary': 'Legendary',
    'detail.mythical': 'Mythical',
    'detail.favorite.add': 'Add to favorites',
    'detail.favorite.remove': 'Remove from favorites',
    'detail.loading': 'Scanning specimen…',
    'detail.notFound': 'Could not load this Pokémon.',

    'favorites.title': 'Your favorites',
    'favorites.subtitle': 'The specimens you marked to keep a close eye on.',
    'favorites.empty.title': 'Your list is empty',
    'favorites.empty.body': 'Explore the Pokédex and tap the star on a card to save it here.',
    'favorites.empty.cta': 'Go to the Pokédex',

    'footer.builtWith': 'Built with Angular, Node.js/Express and the PokeAPI.',
    'footer.sourceCode': 'Source code',

    'common.loading': 'Loading…',
    'common.error.retry': 'Try again',
  },
};
