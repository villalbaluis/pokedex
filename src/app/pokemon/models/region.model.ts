import { NamedAPIResource } from './named-api-resource.model';

export interface Region {
    id: number;
    name: string;
    pokedexes: NamedAPIResource[];
}

export interface Pokedex {
    id: number;
    name: string;
    pokemon_entries: PokedexEntry[];
}

export interface PokedexEntry {
    entry_number: number;
    pokemon_species: NamedAPIResource;
}