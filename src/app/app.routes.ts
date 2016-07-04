import { RouterConfig } from '@angular/router';
import {WagePage} from "./pages/wage";

export const routes:RouterConfig = <RouterConfig>[
  {path: '', component: WagePage},
  {path: 'wage', component: WagePage}

];

