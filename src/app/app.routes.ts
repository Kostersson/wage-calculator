import { RouterConfig } from '@angular/router';
import { Home } from './pages/home';
import {WagePage} from "./pages/wage";

export const routes:RouterConfig = <RouterConfig>[
  {path: '', component: Home},
  {path: 'home', component: Home},
  {path: 'wage', component: WagePage}

];

