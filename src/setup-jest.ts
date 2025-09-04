import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { tokens } from './app/styles/tokens';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const root = document.documentElement;
root.style.setProperty('--color-primary', tokens.colors.primary);
root.style.setProperty('--font-family-base', tokens.typography.fontFamily);
