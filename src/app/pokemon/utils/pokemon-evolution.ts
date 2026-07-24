import { EvolutionNode } from '../models/pokemon.model';

export interface EvolutionStage {
    name: string;
    minLevel: number | null;
}

export function flattenEvolutionChain(node: EvolutionNode): EvolutionStage[] {
    const stages: EvolutionStage[] = [{ name: node.species.name, minLevel: null }];

    let current = node;
    while (current.evolves_to.length > 0) {
        const next = current.evolves_to[0];
        const minLevel = next.evolution_details[0]?.min_level ?? null;
        stages.push({ name: next.species.name, minLevel });
        current = next;
    }

    return stages;
}