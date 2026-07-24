import { NamedAPIResource, NamedAPIResourceList } from './named-api-resource.model';

export type PokemonListResponse = NamedAPIResourceList;

export type PokemonListItem = NamedAPIResource;

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    base_experience: number;
    sprites: PokemonSprites;
    types: PokemonTypeSlot[];
    abilities: PokemonAbilitySlot[];
    stats: PokemonStatSlot[];
}

export interface PokemonSprites {
    front_default: string | null;
    other?: {
        'official-artwork'?: {
            front_default: string | null;
        };
    };
}

export interface PokemonTypeSlot {
    slot: number;
    type: NamedAPIResource;
}

export interface PokemonAbilitySlot {
    slot: number;
    is_hidden: boolean;
    ability: NamedAPIResource;
}

export interface PokemonStatSlot {
    base_stat: number;
    effort: number;
    stat: NamedAPIResource;
}

export interface PokemonSpecies {
    id: number;
    name: string;
    gender_rate: number;
    genera: GenusEntry[];
    flavor_text_entries: FlavorTextEntry[];
    evolution_chain: NamedAPIResource;
}

export interface GenusEntry {
    genus: string;
    language: NamedAPIResource;
}

export interface FlavorTextEntry {
    flavor_text: string;
    language: NamedAPIResource;
}

export interface TypeDetail {
    name: string;
    damage_relations: {
        double_damage_from: NamedAPIResource[];
        half_damage_from: NamedAPIResource[];
        no_damage_from: NamedAPIResource[];
    };
}

export interface EvolutionChainResponse {
    chain: EvolutionNode;
}

export interface EvolutionNode {
    species: NamedAPIResource;
    evolves_to: EvolutionNode[];
    evolution_details: EvolutionDetail[];
}

export interface EvolutionDetail {
    min_level: number | null;
}