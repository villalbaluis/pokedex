import { NamedAPIResource, NamedAPIResourceList } from '../shared/models/named-api-resource.model';

export type PokemonListResponse = NamedAPIResourceList;

export type PokemonListItem = NamedAPIResource;

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
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