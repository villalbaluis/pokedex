import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { LoadingIndicator } from './layout/loading-indicator/loading-indicator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, LoadingIndicator],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pokedex');
}