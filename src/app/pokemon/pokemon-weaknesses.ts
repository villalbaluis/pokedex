import { TypeDetail } from './pokemon.model';

export interface Weakness {
    type: string;
    multiplier: number;
}

export function calculateWeaknesses(typeDetails: TypeDetail[]): Weakness[] {
    const multipliers = new Map<string, number>();

    for (const typeDetail of typeDetails) {
        for (const t of typeDetail.damage_relations.double_damage_from) {
            multipliers.set(t.name, (multipliers.get(t.name) ?? 1) * 2);
        }
        for (const t of typeDetail.damage_relations.half_damage_from) {
            multipliers.set(t.name, (multipliers.get(t.name) ?? 1) * 0.5);
        }
        for (const t of typeDetail.damage_relations.no_damage_from) {
            multipliers.set(t.name, (multipliers.get(t.name) ?? 1) * 0);
        }
    }

    return Array.from(multipliers.entries())
        .map(([type, multiplier]) => ({ type, multiplier }))
        .filter((w) => w.multiplier > 1)
        .sort((a, b) => b.multiplier - a.multiplier);
}