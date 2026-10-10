import { Component, computed, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { IconCategoria } from '../../components/icon-categoria/icon-categoria';
import {
  Categoria,
  CategoriaService,
  injectQueryCategorias,
  nomeExibicaoCategoria,
} from '../../services/categoria-service';

@Component({
  selector: 'app-categorias-page',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FloatLabelModule,
    FormsModule,
    IconCategoria,
    InputTextModule,
    LucideChevronLeft,
    LucidePencil,
    LucideTrash2,
    MessageModule,
    ProgressSpinnerModule,
    RouterLink,
    TagModule,
  ],
  templateUrl: './categorias-page.html',
  providers: [ConfirmationService],
})
export class CategoriasPage {
  private authService = inject(AuthService);
  private categoriaService = inject(CategoriaService);
  private queryClient = inject(QueryClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  protected readonly nomeExibicao = nomeExibicaoCategoria;

  queryCategorias = injectQueryCategorias();

  categoriasPadrao = computed(() =>
    (this.queryCategorias.data() ?? []).filter((c) => !c.personalizada),
  );
  categoriasPersonalizadas = computed(() =>
    (this.queryCategorias.data() ?? []).filter((c) => c.personalizada),
  );

  valNovaCategoria = '';

  popupEditar = false;
  categoriaEdit?: Categoria;
  valNomeEdit = '';

  mutationCadastrar = injectMutation(() => ({
    mutationFn: (nome: string) =>
      lastValueFrom(
        this.categoriaService.cadastrarCategoria({
          nome,
          idUsuario: this.authService.getUsuarioId()!,
        }),
      ),
  }));

  mutationAtualizar = injectMutation(() => ({
    mutationFn: ({ id, nome }: { id: string; nome: string }) =>
      lastValueFrom(
        this.categoriaService.atualizarCategoria({ nome }, this.authService.getUsuarioId()!, id),
      ),
  }));

  mutationDeletar = injectMutation(() => ({
    mutationFn: (id: string) =>
      lastValueFrom(this.categoriaService.deletarCategoria(this.authService.getUsuarioId()!, id)),
  }));

  private invalidar() {
    this.queryClient.invalidateQueries({ queryKey: ['categorias'] });
    this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
  }

  private tratarErro(form: NgForm, err: any, campo: string, padrao: string) {
    const msg: string | undefined = err?.error?.erro;
    if (msg === 'Dados inválidos') {
      for (const detail of err.error.detalhes) {
        if (form.controls[detail.campo]) {
          form.controls[detail.campo].setErrors({ custom: detail.mensagem });
        }
      }
    } else {
      form.controls[campo]?.setErrors({ custom: msg ?? padrao });
    }
  }

  onSubmitNova(form: NgForm) {
    if (form.invalid) return;

    this.mutationCadastrar.mutate(this.valNovaCategoria.trim(), {
      onSuccess: () => {
        form.resetForm();
        this.invalidar();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Categoria criada com sucesso!',
        });
      },
      onError: (err) => this.tratarErro(form, err, 'nome', 'Erro ao criar categoria'),
    });
  }

  abrirEditar(categoria: Categoria) {
    this.categoriaEdit = categoria;
    this.valNomeEdit = categoria.nome;
    this.popupEditar = true;
  }

  onSubmitEditar(form: NgForm) {
    if (form.invalid || !this.categoriaEdit) return;

    this.mutationAtualizar.mutate(
      { id: this.categoriaEdit.id, nome: this.valNomeEdit.trim() },
      {
        onSuccess: () => {
          this.popupEditar = false;
          this.invalidar();
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria atualizada com sucesso!',
          });
        },
        onError: (err) => this.tratarErro(form, err, 'nome', 'Erro ao atualizar categoria'),
      },
    );
  }

  excluir(categoria: Categoria) {
    this.confirmationService.confirm({
      header: 'Excluir categoria',
      message: `Tem certeza que quer excluir a categoria "${categoria.nome}"?<br>As despesas dela passarão para "Outros".`,
      closable: false,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Excluir',
        severity: 'danger',
      },
      accept: () => {
        this.mutationDeletar.mutate(categoria.id, {
          onSuccess: () => {
            this.invalidar();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria excluída com sucesso!',
            });
          },
          onError: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err?.error?.erro ?? 'Erro ao excluir categoria',
            });
          },
        });
      },
    });
  }
}
