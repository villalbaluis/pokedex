import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly externalLinks: { label: string; href: string; icon: SafeHtml }[] = [
    {
      label: 'Pokémon',
      href: 'https://www.pokemon.com/',
      icon: this.svg(`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h6M15 12h6" />
          <circle cx="12" cy="12" r="3" />
        </svg>`),
    },
    {
      label: 'PokeAPI',
      href: 'https://pokeapi.co/',
      icon: this.svg(`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 8 5 12l4 4" />
          <path d="m15 8 4 4-4 4" />
        </svg>`),
    },
  ];

  private svg(markup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  }
}