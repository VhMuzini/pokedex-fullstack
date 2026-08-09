import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/** Marca requisicoes cujo erro nao deve gerar um toast global (ex.: checagens silenciosas). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

function friendlyMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Nao foi possivel falar com a API. Ela esta rodando?';
  }
  if (error.status === 404) {
    return 'Pokemon nao encontrado na Pokedex.';
  }
  if (error.status === 429) {
    return 'Muitas requisicoes em pouco tempo. Aguarde um instante.';
  }
  return error.error?.message ?? 'Algo deu errado ao falar com a API.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.context.get(SKIP_ERROR_TOAST)) {
        notifications.show(friendlyMessage(error));
      }
      return throwError(() => error);
    }),
  );
};
