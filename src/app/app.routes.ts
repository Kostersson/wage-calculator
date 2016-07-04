import { WebpackAsyncRoute } from '@angularclass/webpack-toolkit';
import { RouterConfig } from '@angular/router';
import { Home } from './pages/home';
import {Wage} from "./pages/wage";

export const routes:RouterConfig = [
  {path: '', component: Home},
  {path: 'home', component: Home},
  {path: 'wage', component: Wage}

];

