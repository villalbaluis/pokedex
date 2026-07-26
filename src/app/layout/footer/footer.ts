import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly year = new Date().getFullYear();

  protected readonly regionCount = 10;

  protected readonly links = [
    { label: 'Pokémon', href: 'https://www.pokemon.com/' },
    { label: 'PokeAPI', href: 'https://pokeapi.co/' },
    { label: 'Documentación', href: 'https://pokeapi.co/docs/v2' },
  ];

  protected readonly socials = [
    { label: 'GitHub', href: 'https://github.com/villalbaluis' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/villalbaluiz/' },
  ];
}