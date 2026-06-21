import { Component, Input, model, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideDollarSign } from '@lucide/angular';

@Component({
  selector: 'app-modal-despesa',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    LucideDollarSign,
  ],
  templateUrl: 'modal-despesa.html',
})
export class ModalDespesa {
  public visible = model(false);
  protected categorias = ['Alimentação', 'Lazer', 'Transporte', 'Compras', 'Contas', 'Outros'];

  public isDespesa = model(true);
  @Input() isEditMode = false;
  protected valNome?: string;
  protected valCategoria?: string;
  protected valData?: Date;
  protected valValor?: number;


  protected onDialogHide() {
    this.valNome = undefined;
    this.valCategoria = undefined;
    this.valData = undefined;
    this.valValor = undefined;
    this.isDespesa.set(true);
  }

  protected onSubmit() {
    this.visible.set(false);
  }
}
