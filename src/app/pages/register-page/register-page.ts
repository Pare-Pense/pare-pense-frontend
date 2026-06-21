import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { LucideLockKeyhole, LucideMail, LucideWallet, LucideUser, LucideCalendar, LucideDollarSign} from '@lucide/angular';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-register-page',
  imports: [    
    ButtonModule,
    FormsModule,
    FloatLabelModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    LucideLockKeyhole,
    LucideMail,
    LucideCalendar,
    LucideUser,
    LucideWallet,
    LucideDollarSign,
    PasswordModule,
    RouterLink,],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  email: string = '';
  senha: string = '';
  username: string = '';
  birthDate: string = '';
  senhaConf: string = '';
  saldoMensal: number | null = null;  
  limiteGastos: number | null = null;
}
